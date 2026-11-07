/** Structural coverage checks; never a clinical-evidence adjudicator. */
export function schemaLeaves(schema, prefix='') {
  return Object.entries(schema.properties ?? {}).flatMap(([key,value]) => {
    const path=prefix ? prefix+'.'+key : key;
    return value.properties ? schemaLeaves(value,path) : [path];
  });
}
export function auditH1(corpus, {inventory,matrix,semantics,inputSchema,outputSchema}, pathExists=()=>true) {
  const errors=[];
  const fail=message=>errors.push('H1: '+message);
  if (!inventory || !matrix || !semantics || !inputSchema || !outputSchema) return ['H1: missing inventory, matrix, semantics or API schemas'];
  for (const artifact of [inventory,matrix,semantics]) if (artifact.schemaVersion!=='1.0.0') fail('unsupported artifact schema');
  const claimIds=corpus.claims.map(c=>c.id), contextIds=corpus.contexts.map(c=>c.id);
  const knownClaims=new Set(claimIds), knownContexts=new Set(contextIds);
  const equalSet=(actual,expected)=>actual.length===expected.length && new Set(actual).size===actual.length && actual.every(x=>expected.includes(x));
  const refs=(values,where)=>{if(!Array.isArray(values)||!values.length||values.some(id=>!knownClaims.has(id))) fail(where+' has missing/unknown claim references');};
  if (!equalSet(inventory.claimIds,claimIds) || inventory.claimFamilyCount!==claimIds.length) fail('claim denominator differs from corpus');
  if (!/^[a-f0-9]{40}$/.test(inventory.snapshotCommit)) fail('missing immutable inventory snapshot');
  if (inventory.surfaceCount!==inventory.surfaces.length || new Set(inventory.surfaces.map(s=>s.path)).size!==inventory.surfaces.length) fail('surface denominator or duplicate surface');
  const mapped=new Set();
  for(const surface of inventory.surfaces){
    refs(surface.claimIds,surface.path);
    for(const id of surface.claimIds ?? []) mapped.add(id);
    if(!pathExists(surface.path)||surface.path.split(/[\\/]/).includes('..')||surface.path.startsWith('/')) fail('missing/unsafe inventory surface '+surface.path);
    if(!/^[a-f0-9]{40}$/.test(surface.gitBlobAtSnapshot)||!surface.reviewScope) fail('surface lacks snapshot or inspection scope');
  }
  for(const id of claimIds) if(!mapped.has(id)) fail('unmapped claim '+id);
  if (matrix.claimCount!==claimIds.length || matrix.contextCount!==contextIds.length || matrix.cellCount!==claimIds.length*contextIds.length) fail('matrix denominator mismatch');
  if (!equalSet(matrix.rows.map(r=>r.claimId),claimIds)) fail('missing/duplicate/unknown claim rows');
  for(const row of matrix.rows){
    if(!equalSet(Object.keys(row.cells),contextIds)) fail(row.claimId+' missing/unknown context cell');
    for(const [context,code] of Object.entries(row.cells)){
      const disposition=matrix.legend[code];
      if(!disposition){fail(row.claimId+'/'+context+' unknown disposition');continue;}
      if(!['unreviewed','not-a-population-performance-claim'].includes(disposition.evidenceStatus)) fail('H1 cannot promote a clinical evidence state without a separately reviewed schema extension');
      if(!disposition.useDisposition || !Array.isArray(disposition.evidenceRefs) || disposition.evidenceRefs.length) fail('H1 legend must preserve no clinical evidence adjudication');
      if(disposition.evidenceStatus==='not-a-population-performance-claim' && !corpus.claims.find(c=>c.id===row.claimId)?.noPopulationPerformanceInference) fail(row.claimId+' biological claim mislabeled as method only');
    }
  }
  for(const context of corpus.contexts){
    for(const dimension of ['severity','duration','treatment','coexistingConditions','measurementProtocol','timeHorizon']) {
      if(context.dimensions?.[dimension]?.state!=='unreviewed' || context.dimensions[dimension].value!==null) fail(context.id+' requires an explicit unreviewed dimension '+dimension);
    }
    if(context.axis==='intersection' && (!context.composedOf?.length || context.composedOf.some(id=>!knownContexts.has(id)||id===context.id))) fail('invalid intersection '+context.id);
  }
  for(const [kind,schema] of [['input',inputSchema],['output',outputSchema]]) {
    const fields=semantics[kind+'Fields'];
    if(!Array.isArray(fields)){fail('missing '+kind+' field semantics');continue;}
    if(!equalSet(fields.map(f=>f.path),schemaLeaves(schema))) fail(kind+' field coverage differs from API schema');
    for(const field of fields){refs(field.claimIds,field.path);if(!field.units||!field.role) fail('missing units or epistemic role '+field.path);}
  }
  if(semantics.externalTerminologyMappings.length || corpus.contexts.some(c=>c.externalMappings.length) || corpus.concepts.some(c=>c.externalMappings.length)) fail('external mappings need a verified version/terms mapping contract before adoption');
  return errors;
}
