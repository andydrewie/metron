import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {auditH2C} from '../research/robustness/h2c/audit.mjs';
import {auditProgram} from '../research/robustness/audit.mjs';
import {lookupClaim} from '../research/robustness/inspect.mjs';
import {estimateEnergy} from '../core/model.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(root+p,'utf8'));
const records=s=>({review:read(`research/robustness/${s}/review.json`),registry:read(`research/robustness/${s}/sources.json`),searchLog:read(`research/robustness/${s}/search-log.json`),queue:read('research/robustness/h2-review-queue.json'),...(s==='h2b'?{crosswalk:read('research/robustness/h2b/equation-crosswalk.json')}:s==='h2c'?{crosswalk:read('research/robustness/h2c/measurement-crosswalk.json')}:{})});
function fixture(){return {corpus:read('research/robustness/corpus.json'),matrix:read('research/robustness/applicability.json'),plan:read('research/robustness/plan.json'),records:records('h2c')};}
const audit=f=>auditH2C(f.corpus,f.matrix,f.plan,f.records,'2026-11-09');
const options=f=>({asOf:'2026-11-09',pathExists:p=>existsSync(root+p),fileDigest:p=>createHash('sha256').update(readFileSync(root+p)).digest('hex'),h2a:records('h2a'),h2b:records('h2b'),h2c:f.records,h1:{inventory:read('research/robustness/inventory.json'),matrix:f.matrix,semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')}});
test('H2-C covers 12 families with bounded evidence and leaves clinical cells unreviewed',()=>{
 const f=fixture();assert.deepEqual(audit(f),[]);assert.equal(auditProgram(f.plan,f.corpus,options(f)).valid,true);
 assert.equal(f.records.review.claimReviews.length,12);assert.equal(f.records.registry.sources.length,17);assert.equal(f.records.searchLog.queries.length,40);
 assert.equal(f.matrix.reviewOverlays.filter(x=>x.reviewId==='H2-C').length,16);
 assert.equal(f.matrix.cellCount,805);assert.ok(f.corpus.contexts.every(c=>c.clinicalEvidenceReview==='unreviewed'));
 const r=lookupClaim(f.corpus,f.matrix,{claimId:'C05',contextId:'cardiopulmonary',reviews:[f.records.review]});
 assert.equal(r.contexts[0].evidenceReviews[0].details.claimId,'C05');assert.equal(r.contexts[0].evidenceStatus,'unreviewed');
 assert.deepEqual(lookupClaim(f.corpus,f.matrix,{claimId:'C05',contextId:'older-renal',reviews:[f.records.review]}).contexts[0].evidenceReviews,[]);
});
test('missing method metadata, sources, claims and query provenance fail integrity',()=>{
 for(const mutate of [f=>f.records.crosswalk.mappings[0].reference='',f=>f.records.crosswalk.mappings[0].requiredMetadata=[],f=>f.records.crosswalk.mappings[0].sourceIds=['invented'],f=>f.records.crosswalk.mappings=f.records.crosswalk.mappings.filter(m=>!m.claimIds.includes('C04')),f=>f.records.review.claimReviews[0].searchIds=['invented']]){const f=fixture();mutate(f);assert.ok(audit(f).length);}
});
test('membership, missingness, defaults, authorization and uncertainty cannot silently be promoted',()=>{
 for(const id of ['metric-identity','aggregate-membership','missingness','defaults','uncertainty','authorization','device-transfer']){const f=fixture();f.records.crosswalk.guardrails.find(g=>g.id===id).requiredState='validated';assert.ok(audit(f).some(e=>e.includes(id)));}
 for(const mutate of [f=>f.records.crosswalk.providerMembership[0].state='included',f=>f.records.crosswalk.providerMembership[1].automaticReconciliationPermitted=true,f=>f.records.crosswalk.pilotPredicateContract.rawDayOptions=[],f=>f.records.crosswalk.productionIntegration=true]){const f=fixture();mutate(f);assert.ok(audit(f).length);}
});
test('equal SDNN can coexist with unequal RMSSD: units and one statistic cannot recover ordering',()=>{
 // Synthetic interval arrays only, not observations or an HRV implementation.
 const sd=a=>{const mean=a.reduce((s,v)=>s+v,0)/a.length;return Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/(a.length-1));};
 const rmssd=a=>Math.sqrt(a.slice(1).reduce((s,v,i)=>s+(v-a[i])**2,0)/(a.length-1));
 const alternating=[800,1000,800,1000],grouped=[800,800,1000,1000];
 assert.equal(sd(alternating),sd(grouped));assert.equal(rmssd(alternating),200);assert.notEqual(rmssd(alternating),rmssd(grouped));
});
test('fixed-mass BF sensitivity does not describe a joint mass and BF change',()=>{
 const at=(weightKg,bodyFatPercent)=>estimateEnergy({profile:{weightKg,bodyFatPercent},activity:{restingModel:'cunningham'}}).derived.restingKcal;
 assert.equal(at(80,25)-at(80,20),-88);
 assert.equal(at(84,25)-at(80,20),-22);
 assert.notEqual(at(84,25)-at(80,20),-88);
});
test('synthetic energy examples expose the baseline floor and session reference',()=>{
 const input={profile:{weightKg:80,heightCm:200,ageYears:40,equationSex:'male'},activity:{steps:6000,workoutMinutes:60,intensity:'typical'}};
 const r=estimateEnergy(input);
 assert.equal(r.derived.strideMeters,0.83);assert.equal(r.derived.incrementalWalkingKm,3.32);
 assert.equal(r.components.baselineKcal,2226);assert.ok(Math.abs(r.components.walkingKcal-132.8)<1e-10);
 assert.equal(r.components.workoutKcal,187.25); // 280 gross minus 92.75 app baseline; not minus 80 (one standard MET).
 for(const steps of [0,1999,2000]){const v=estimateEnergy({...input,activity:{...input.activity,steps,workoutMinutes:0}});assert.equal(v.components.baselineKcal,2226);assert.equal(v.components.walkingKcal,0);}
});
test('supplying SMM alone does not invent BF or FFM',()=>{
 const r=estimateEnergy({profile:{skeletalMuscleKg:35}});
 assert.equal(r.derived.fatFreeMassKg,null);assert.equal(r.derived.cunninghamKcal,null);
 assert.throws(()=>estimateEnergy({profile:{skeletalMuscleKg:35},activity:{restingModel:'cunningham'}}),/requires bodyFatPercent/);
});
test('provider review expires at 30 days without refreshing its evidence date',()=>{
 const f=fixture(),opts=options(f);opts.asOf='2026-12-09';const r=auditProgram(f.plan,f.corpus,opts);
 assert.equal(r.valid,true);assert.ok(r.warnings.some(w=>w.includes('H2-C bounded evidence review is due')));
 assert.equal(r.sourceReviews.find(s=>s.id==='h2c-whoop-cycle').state,'due');assert.equal(f.records.review.asOf,'2026-11-09');
});
test('a later source inspection preserves the dated review only with its retained provenance',()=>{
 const f=fixture(),s=f.corpus.sources.find(s=>s.id==='siedler-2023');
 s.sourceContentReviewedAt='2026-11-10';s.reviewScope='Synthetic later inspection';
 const opts=options(f);opts.asOf='2026-11-10';
 assert.equal(auditProgram(f.plan,f.corpus,opts).valid,true);
 assert.equal(f.records.registry.sources.find(s=>s.id==='siedler-2023').sourceContentReviewedAt,'2026-11-09');
 s.contentReviewHistory=[];
 assert.equal(auditProgram(f.plan,f.corpus,opts).valid,false);
});
