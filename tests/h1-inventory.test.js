import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {auditH1} from '../research/robustness/h1-audit.mjs';
import {lookupClaim} from '../research/robustness/inspect.mjs';
import {evaluate} from '../core/model.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(root+p,'utf8'));
function fixture(){return {corpus:read('research/robustness/corpus.json'),artifacts:{inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')}};}
const check=({corpus,artifacts})=>auditH1(corpus,artifacts,p=>existsSync(root+p));
test('H1 denominator, source paths and every API field are accounted for',()=>assert.deepEqual(check(fixture()),[]));
test('H2 queue assigns every inventoried claim exactly once and exposes an unstarted next slice',()=>{
  const {corpus}=fixture(),q=read('research/robustness/h2-review-queue.json'),p=read('research/robustness/plan.json');
  assert.deepEqual(q.slices.flatMap(s=>s.claimIds).sort(),corpus.claims.map(c=>c.id).sort());
  assert.ok(q.slices.every(s=>['not-started','in-progress','complete'].includes(s.state) && s.firstExecutableTask && s.ownerRole));
  if(p.nextTask.gate==='H2') assert.ok(q.slices.some(s=>s.id===p.nextTask.slice&&s.state==='not-started'));
});
test('missing and duplicate matrix rows or cells fail rather than inherit support',()=>{
  for(const mutate of [f=>f.artifacts.matrix.rows.pop(),f=>f.artifacts.matrix.rows.push(f.artifacts.matrix.rows[0]),f=>delete f.artifacts.matrix.rows[0].cells['renal-fluid']]){
    const f=fixture();mutate(f);assert.ok(check(f).length);
  }
});
test('invented clinical support and unknown intersection members fail',()=>{
  const f=fixture();f.artifacts.matrix.legend.U.evidenceStatus='supported';
  f.corpus.contexts.find(x=>x.axis==='intersection').composedOf.push('unknown-disease');
  const errors=check(f);assert.ok(errors.some(e=>e.includes('promote')));assert.ok(errors.some(e=>e.includes('intersection')));
});
test('coverage changes and missing field units cannot silently pass',()=>{
  const f=fixture();f.artifacts.inventory.claimIds.pop();f.artifacts.semantics.outputFields[0].units='';
  f.artifacts.inputSchema.properties.profile.properties.newMeasurement={type:'number'};
  const errors=check(f);assert.ok(errors.some(e=>e.includes('denominator')));assert.ok(errors.some(e=>e.includes('units')));assert.ok(errors.some(e=>e.includes('input field coverage')));
});
test('runtime output leaf paths match the semantic contract including nullable fields',()=>{
  const f=fixture();
  const leaves=(o,p='')=>Object.entries(o).flatMap(([k,v])=>{const path=p?p+'.'+k:k;return v && typeof v==='object' && !Array.isArray(v)?leaves(v,path):[path];});
  for(const input of [{},read('examples/strength-athlete.json')]) assert.deepEqual(leaves(evaluate(input)).sort(),f.artifacts.semantics.outputFields.map(x=>x.path).sort());
});
test('lookup carries scope, unknown dimensions and primary pointers without inventing evidence',()=>{
  const {corpus,artifacts}=fixture();const result=lookupClaim(corpus,artifacts.matrix,{claimId:'C15',contextId:'renal-fluid'});
  assert.equal(result.contexts[0].evidenceStatus,'unreviewed');assert.equal(result.contexts[0].context.dimensions.treatment.value,null);assert.ok(result.sources.length);
  assert.throws(()=>lookupClaim(corpus,artifacts.matrix,{claimId:'C999'}),/Unknown claim/);
  assert.throws(()=>lookupClaim(corpus,artifacts.matrix,{claimId:'C15',contextId:'not-real'}),/Unknown context/);
});
