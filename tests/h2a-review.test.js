import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {auditH2A} from '../research/robustness/h2a/audit.mjs';
import {auditProgram} from '../research/robustness/audit.mjs';
import {lookupClaim} from '../research/robustness/inspect.mjs';
import {evaluateRecovery,MODEL_VERSION} from '../core/model.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(root+p,'utf8'));
function fixture(){return {corpus:read('research/robustness/corpus.json'),matrix:read('research/robustness/applicability.json'),plan:read('research/robustness/plan.json'),records:{review:read('research/robustness/h2a/review.json'),registry:read('research/robustness/h2a/sources.json'),searchLog:read('research/robustness/h2a/search-log.json'),queue:read('research/robustness/h2-review-queue.json')}};}
const audit=f=>auditH2A(f.corpus,f.matrix,f.plan,f.records,'2026-11-07');
test('bounded H2-A records resolve without promoting clinical validity',()=>{
 const f=fixture();assert.deepEqual(audit(f),[]);assert.equal(f.plan.gates.find(x=>x.id==='H2').state,'in-progress');
 assert.ok(f.corpus.contexts.every(c=>c.clinicalEvidenceReview==='unreviewed'));
});
test('source/query references and reviewed-context overlays cannot disappear silently',()=>{
 for(const mutate of [f=>f.records.review.claimReviews[0].sourceIds.push('invented'),f=>f.records.review.claimReviews[0].searchIds.push('Q999'),f=>f.matrix.reviewOverlays.splice(f.matrix.reviewOverlays.findIndex(x=>x.reviewId==='H2-A'),1),f=>f.matrix.reviewOverlays.push(f.matrix.reviewOverlays[0]),f=>f.records.review.claimReviews[0].nextGate='H99']){
  const f=fixture();mutate(f);assert.ok(audit(f).length);
 }
});
test('clinical promotion or whole-gate closure from a bounded review fails',()=>{
 const f=fixture();f.records.review.claimReviews[0].directAlgorithmValidation=true;f.plan.gates.find(x=>x.id==='H2').state='complete';
 const errors=audit(f);assert.ok(errors.some(e=>e.includes('unsupported claim')));assert.ok(errors.some(e=>e.includes('whole H2')));
});
test('dated H2-A review does not prevent a later plan from moving to H3',()=>{
 const f=fixture();f.records.queue.slices.forEach(s=>{s.state='complete';});
 f.plan.gates.find(g=>g.id==='H2').state='complete';f.plan.nextTask={gate:'H3',action:'Fixture: proceed after all H2 slices'};
 assert.deepEqual(audit(f),[]); // Whole-plan closure evidence is checked separately by auditProgram.
});
test('source metadata drift, absent inspected portions and impossible dates fail',()=>{
 for(const mutate of [f=>f.records.registry.sources[0].url='https://example.com/wrong',f=>f.records.registry.sources[0].inspectedPortions='',f=>f.records.review.claimReviews[0].reviewedAt='2026-02-30']){
  const f=fixture();mutate(f);assert.ok(audit(f).length);
 }
});
test('lookup distinguishes a bounded review from unreviewed clinical contexts',()=>{
 const f=fixture();const reviewed=lookupClaim(f.corpus,f.matrix,{claimId:'C15',contextId:'general-adult',review:f.records.review});
 assert.equal(reviewed.contexts[0].evidenceStatus,'unreviewed');assert.equal(reviewed.contexts[0].evidenceReviews[0].details.directAlgorithmValidation,false);
 const untouched=lookupClaim(f.corpus,f.matrix,{claimId:'C15',contextId:'renal-fluid',review:f.records.review});assert.deepEqual(untouched.contexts[0].evidenceReviews,[]);
});
test('review-age boundary warns without inventing scientific invalidity or refresh',()=>{
 const f=fixture();const h1={inventory:read('research/robustness/inventory.json'),matrix:f.matrix,semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')};
 const opts={asOf:'2027-02-05',pathExists:p=>existsSync(root+p),h1,h2a:f.records,h2b:{review:read('research/robustness/h2b/review.json'),registry:read('research/robustness/h2b/sources.json'),searchLog:read('research/robustness/h2b/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2b/equation-crosswalk.json')}};
 const result=auditProgram(f.plan,f.corpus,opts);assert.equal(result.valid,true);assert.ok(result.warnings.some(w=>w.includes('H2-A bounded evidence review is due')));
 assert.equal(f.records.review.asOf,'2026-11-07');
});
test('published synthetic boundary audit matches its declared current model version',()=>{
 const artifact=read('research/robustness/h2a/rule-audit.json');
 assert.ok(artifact.cases.every(c=>c.output.modelVersion===MODEL_VERSION),'A model-version change requires explicit treatment of this dated rule audit');
 for(const c of artifact.cases) assert.deepEqual(evaluateRecovery(c.input),c.output,c.id);
});
