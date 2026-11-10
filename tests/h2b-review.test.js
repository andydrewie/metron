import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {auditH2B} from '../research/robustness/h2b/audit.mjs';
import {auditProgram} from '../research/robustness/audit.mjs';
import {lookupClaim} from '../research/robustness/inspect.mjs';
import {mifflinStJeor,cunninghamRmr} from '../core/model.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(root+p,'utf8'));
const digest=p=>createHash('sha256').update(readFileSync(root+p)).digest('hex');
const records=slice=>({review:read(`research/robustness/${slice}/review.json`),registry:read(`research/robustness/${slice}/sources.json`),searchLog:read(`research/robustness/${slice}/search-log.json`),queue:read('research/robustness/h2-review-queue.json'),...(slice==='h2b'?{crosswalk:read('research/robustness/h2b/equation-crosswalk.json')}:{})});
function fixture(){return {corpus:read('research/robustness/corpus.json'),matrix:read('research/robustness/applicability.json'),plan:read('research/robustness/plan.json'),records:records('h2b')};}
const audit=f=>auditH2B(f.corpus,f.matrix,f.plan,f.records,'2026-11-09',digest);
const options=f=>({asOf:f.plan.asOf,pathExists:p=>existsSync(root+p),fileDigest:digest,h2a:records('h2a'),h2d:{review:read('research/robustness/h2d/review.json'),registry:read('research/robustness/h2d/sources.json'),searchLog:read('research/robustness/h2d/search-log.json'),queue:read('research/robustness/h2-review-queue.json')},h2e:{review:read('research/robustness/h2e/review.json'),registry:read('research/robustness/h2e/sources.json'),searchLog:read('research/robustness/h2e/search-log.json'),queue:read('research/robustness/h2-review-queue.json')},h2c:{review:read('research/robustness/h2c/review.json'),registry:read('research/robustness/h2c/sources.json'),searchLog:read('research/robustness/h2c/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2c/measurement-crosswalk.json')},h2b:f.records,h1:{inventory:read('research/robustness/inventory.json'),matrix:f.matrix,semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')}});
test('H2-B covers its declared slice while preserving every frozen study file',()=>{
 const f=fixture();assert.deepEqual(audit(f),[]);assert.equal(auditProgram(f.plan,f.corpus,options(f)).valid,true);
 assert.equal(f.records.review.claimReviews.length,9);assert.equal(f.records.registry.sources.length,14);assert.equal(f.records.searchLog.queries.length,32);
 assert.ok(f.corpus.contexts.every(c=>c.clinicalEvidenceReview==='unreviewed'));
});
test('equation fingerprints distinguish implemented arithmetic from named variants',()=>{
 const f=fixture(),variants=f.records.crosswalk.variants;
 const m=variants.find(v=>v.id==='metron-mifflin-rounded').coefficients,c=variants.find(v=>v.id==='metron-cunningham-500-22').coefficients;
 for(const profile of [{weightKg:80,heightCm:175,ageYears:30,equationSex:'male'},{weightKg:60,heightCm:160,ageYears:75,equationSex:'female'}]) {
  const expected=m.weightKg*profile.weightKg+m.heightCm*profile.heightCm+m.ageYears*profile.ageYears+m[profile.equationSex+'Constant'];
  assert.equal(mifflinStJeor(profile),expected);
 }
 for(const ffm of [30,60,90]) assert.equal(cunninghamRmr(ffm),c.intercept+c.massKg*ffm);
 const cai=variants.find(v=>v.id==='cai-table-501.6-21.6').coefficients;
 assert.notEqual(cai.intercept+cai.massKg*60,cunninghamRmr(60));
});
test('unknown variants and conflicting source counts cannot silently become resolved evidence',()=>{
 for(const mutate of [f=>f.records.crosswalk.sourceMappings.find(m=>m.sourceId==='h2b-kfir-2023').variantIds.push('metron-cunningham-500-22'),f=>f.records.crosswalk.sourceMappings.find(m=>m.sourceId==='h2b-cai-2026').variantIds=['metron-cunningham-500-22'],f=>f.records.crosswalk.discrepancies[0].state='resolved',f=>f.records.crosswalk.discrepancies[0].observations.pop()]){const f=fixture();mutate(f);assert.ok(audit(f).length);}
});
test('missing source, query, overlay or next-review date fails bounded review integrity',()=>{
 for(const mutate of [f=>f.records.review.claimReviews[0].sourceIds=[],f=>f.records.review.claimReviews[0].searchIds=['unknown'],f=>f.matrix.reviewOverlays.splice(f.matrix.reviewOverlays.findIndex(m=>m.reviewId==='H2-B'),1),f=>f.records.review.claimReviews[0].nextReviewBy='2026-02-30']) {const f=fixture();mutate(f);assert.ok(audit(f).length);}
});
test('multiple dated reviews coexist and lookup selects the appropriate detailed record',()=>{
 const f=fixture(),reviews=[records('h2a').review,f.records.review];
 for(const [claimId,reviewId] of [['C15','H2-A'],['C02','H2-B']]) {
  const r=lookupClaim(f.corpus,f.matrix,{claimId,contextId:'general-adult',reviews});
  assert.equal(r.contexts[0].evidenceReviews[0].reviewId,reviewId);assert.equal(r.contexts[0].evidenceReviews[0].details.claimId,claimId);assert.equal(r.contexts[0].evidenceStatus,'unreviewed');
 }
 assert.deepEqual(lookupClaim(f.corpus,f.matrix,{claimId:'C02',contextId:'renal-fluid',reviews}).contexts[0].evidenceReviews,[]);
 for(const mutate of [f=>f.matrix.reviewOverlays.push({...f.matrix.reviewOverlays[0],reviewId:'H2-Z'}),f=>f.matrix.reviewOverlays.push(f.matrix.reviewOverlays[0])]) {const f=fixture();mutate(f);assert.equal(auditProgram(f.plan,f.corpus,options(f)).valid,false);}
});
test('changed frozen evidence and path traversal fail preservation checks',()=>{
 const f=fixture();assert.ok(auditH2B(f.corpus,f.matrix,f.plan,f.records,'2026-11-09',()=> '0'.repeat(64)).some(e=>e.includes('frozen study changed')));
 f.records.crosswalk.frozenStudy.files[0].path='research/ree-validation/../../outside';assert.ok(audit(f).some(e=>e.includes('invalid protected path')));
});
test('H2-B review-age boundary warns without refreshing evidence or blocking future gate progress',()=>{
 const f=fixture(),opts=options(f);opts.asOf='2027-02-07';const r=auditProgram(f.plan,f.corpus,opts);
 assert.equal(r.valid,true);assert.ok(r.warnings.some(w=>w.includes('H2-B bounded evidence review is due')));assert.equal(f.records.review.asOf,'2026-11-09');
 f.records.queue.slices.forEach(s=>{s.state='complete';});f.plan.gates.find(g=>g.id==='H2').state='complete';f.plan.nextTask={gate:'H3',action:'Synthetic later checkpoint'};
 assert.deepEqual(audit(f),[]);
});
