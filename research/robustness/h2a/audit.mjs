/** Audit a dated review record, not the truth or completeness of its science. */
export function auditH2A(corpus,matrix,plan,{review,registry,searchLog,queue}={},asOf) {
  const errors=[];const fail=m=>errors.push('H2-A: '+m);
  if(!review || !Array.isArray(registry?.sources) || !Array.isArray(searchLog?.queries) || !Array.isArray(queue?.slices)) return ['H2-A: missing review, sources, search log or queue'];
  const date=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
  const ids=items=>new Set(items.map(x=>x.id));
  const sourceIds=ids(registry.sources),queryIds=ids(searchLog.queries),claimIds=ids(corpus.claims),contextIds=ids(corpus.contexts);
  const slice=queue.slices.find(x=>x.id==='H2-A');
  if(!slice || !Array.isArray(review.claimReviews)) return ['H2-A: missing slice or claim reviews'];
  if(review.schemaVersion!=='1.0.0'||review.reviewId!=='H2-A'||review.status!=='complete-for-declared-slice'||slice.state!=='complete') fail('invalid completed-slice state');
  if(review.clinicalApplicabilityEstablished!==false || review.algorithmEmpiricallyValidated!==false || review.productionBehaviorChanged!==false) fail('bounded review cannot promote clinical/algorithm validation or claim a production change');
  if(!review.closure?.scope || !review.closure?.acceptanceReview || !slice.closure?.evidence?.length) fail('closure lacks scoped evidence');
  const actual=review.claimReviews.map(x=>x.claimId),expected=slice.claimIds;
  if(actual.length!==expected.length || new Set(actual).size!==actual.length || expected.some(id=>!actual.includes(id))) fail('claim review denominator differs from slice');
  if(sourceIds.size!==registry.sources.length||queryIds.size!==searchLog.queries.length) fail('duplicate source or query IDs');
  if(!date(asOf)||!date(review.asOf)||review.asOf>asOf||!date(searchLog.publicationCutoff)||searchLog.publicationCutoff>asOf) fail('invalid/future review date or cutoff');
  if(!date(review.nextReviewBy)||review.nextReviewBy<=review.asOf) fail('invalid next review date');
  for(const source of registry.sources){
    const canonical=corpus.sources.find(x=>x.id===source.id);
    if(!canonical || canonical.url!==source.url || canonical.sourceContentReviewedAt!==source.sourceContentReviewedAt) fail('source registry/corpus mismatch '+source.id);
    if(!date(source.sourceContentReviewedAt)||source.sourceContentReviewedAt>asOf) fail('invalid/future source review '+source.id);
    if(!source.inspectedPortions||!source.rightsStatus||!source.limitations||!source.correctionReview?.unresolved||!source.design) fail('source lacks scope, rights, design or update limits '+source.id);
  }
  for(const q of searchLog.queries) if(!q.q || !date(q.runDate) || q.runDate>asOf || (q.recencyDays!==null && (!Number.isInteger(q.recencyDays)||q.recencyDays<=0))) fail('invalid query record '+q.id);
  if(searchLog.includedSourceIds.length!==sourceIds.size||new Set(searchLog.includedSourceIds).size!==sourceIds.size||searchLog.includedSourceIds.some(id=>!sourceIds.has(id))) fail('search inclusion/source mismatch');
  const overlayKeys=new Set();
  for(const overlay of matrix.reviewOverlays ?? []){
    const key=overlay.claimId+'/'+overlay.contextId;
    if(overlayKeys.has(key)) fail('duplicate review overlay '+key);overlayKeys.add(key);
    const cr=review.claimReviews.find(x=>x.claimId===overlay.claimId);
    if(overlay.reviewId!=='H2-A'||!cr||!contextIds.has(overlay.contextId)||!cr.reviewedContextIds.includes(overlay.contextId)||overlay.disposition!==cr.disposition||overlay.clinicalApplicabilityEstablished!==false) fail('invalid or unsupported overlay '+key);
  }
  for(const cr of review.claimReviews){
    if(!claimIds.has(cr.claimId)||!cr.finding||!cr.permittedInterpretation||!cr.reviewScope||!cr.reversalTrigger) fail('missing claim meaning or boundary '+cr.claimId);
    if(cr.clinicalApplicabilityEstablished!==false||cr.directAlgorithmValidation!==false) fail('unsupported claim validation '+cr.claimId);
    if(!date(cr.reviewedAt)||cr.reviewedAt>asOf||!date(cr.nextReviewBy)||cr.nextReviewBy<=cr.reviewedAt) fail('invalid claim review date '+cr.claimId);
    if(!cr.searchIds.length||cr.searchIds.some(id=>!queryIds.has(id))) fail('missing/unknown query evidence '+cr.claimId);
    if(cr.sourceIds.some(id=>!sourceIds.has(id))) fail('unknown primary source '+cr.claimId);
    for(const id of cr.reviewedContextIds) if(!contextIds.has(id)||!overlayKeys.has(cr.claimId+'/'+id)) fail('missing reviewed-context overlay '+cr.claimId+'/'+id);
    const canonical=corpus.claims.find(x=>x.id===cr.claimId);
    if(!plan.gates.some(g=>g.id===cr.nextGate)||!canonical?.gates.includes(cr.nextGate)) fail('invalid downstream gate '+cr.claimId);
    if(canonical?.evidenceDisposition!==cr.disposition || !canonical?.evidenceReviews?.some(x=>x.reviewId==='H2-A'&&x.reviewedAt===cr.reviewedAt) || cr.sourceIds.some(id=>!canonical?.sources.includes(id))) fail('claim corpus/review mismatch '+cr.claimId);
  }
  for(const contradiction of review.contradictions){
    if(!contradiction.resolution||!contradiction.unresolved||contradiction.sourceIds.some(id=>!sourceIds.has(id))) fail('invalid contradiction record '+contradiction.id);
  }
  if(queue.slices.some(s=>s.state!=='complete') && plan.gates.find(g=>g.id==='H2')?.state==='complete') fail('whole H2 cannot close with unreviewed slices');
  if(!queue.slices.some(s=>s.id===plan.nextTask.slice&&s.state!=='complete')) fail('next task must name an incomplete slice');
  return errors;
}
