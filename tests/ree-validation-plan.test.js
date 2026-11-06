import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const exists=path=>existsSync(new URL(path,root));

test('resting-energy plan labels itself prospective, not completed validation',()=>{
 const plan=read('research/ree-validation/plan.json');
 assert.equal(plan.schemaVersion,'1.0.0');
 assert.equal(plan.studyId,'RMR-EXT-001');
 assert.equal(plan.status,'proposed-not-run');
 assert.equal(plan.measuredDataAccessed,false);
 assert.equal(plan.resultsAvailable,false);
 assert.equal(plan.unmodifiedProductionDefault,true);
 assert.equal(plan.scope.endpoint,'RMR/REE in kcal/day');
 assert.ok(plan.scope.exclude.includes('TDEE'));
 assert.ok(plan.scope.exclude.includes('readiness'));
 assert.equal(plan.humanDashboard,'https://github.com/andydrewie/metron/issues/9');
});

test('evidence gates have unique IDs, trackable issues, ordered prerequisites and status semantics',()=>{
 const p=read('research/ree-validation/plan.json');
 assert.deepEqual(p.phases.map(g=>g.id),['G0','G1','G2','G3','G4']);
 assert.deepEqual(p.phases.map(g=>g.issue),[10,11,12,13,13]);
 const seen=new Set();
 for(const g of p.phases){
  assert.ok(!seen.has(g.id));seen.add(g.id);
  assert.equal(g.state,'not-started');
  assert.ok(g.evidenceNeeded.length>=3);
  assert.ok(g.goNoGo.length>20);
  for(const dep of g.dependsOn)assert.ok(seen.has(dep)&&dep!==g.id,'invalid gate dependency');
 }
 assert.ok(p.protections.noHumanHealthUploadsToRepository);
 assert.ok(p.protections.noKpiOrDeadline);
});

test('dataset candidates are transparently unverified rather than analyzed',()=>{
 const x=read('research/ree-validation/candidate-sources.json');
 assert.equal(x.kind,'unverified-source-register');
 assert.equal(x.records.length,3);
 for(const r of x.records){
  assert.ok(r.datasetDoi);
  assert.ok(r.recordUrl.startsWith('https://'));
  assert.equal(r.fileContentsInspected,false);
  assert.equal(r.variablesMapped,false);
  assert.ok(['candidate-not-admitted','not-currently-usable'].includes(r.decision));
  assert.ok(r.risks.length>=2);
 }
 assert.ok(x.deferred.some(d=>d.id==='dlw-tee'));
 assert.ok(x.explicitlyUnsuitableAsGroundTruth.some(d=>d.id==='model-derived-bmr'));
});

test('comparison contracts never equate sex mapping, FFM, and empirical correctness',()=>{
 const p=read('research/ree-validation/plan.json');
 assert.equal(p.comparisons.primary.metric,'MAE kcal/day');
 assert.ok(p.comparisons.conditional.pairedEligibility.includes('identical eligible participant rows'));
 assert.ok(p.comparisons.restrictions.some(x=>x.includes('gender identity')));
 assert.ok(p.reporting.summary.includes('MAE'));
 assert.ok(p.reporting.summary.includes('RMSE'));
 assert.ok(p.reporting.confidence.includes('not individual prediction intervals'));
});

test('human and machine routing remain available and production remains exploratory',()=>{
 const nav=read('docs/navigation.json');
 assert.ok(nav.routes.some(x=>x.id==='plan-resting-energy-validation'&&x.entry==='research/ree-validation/README.md'));
 const m=read('metron.manifest.json');
 for(const key of ['rmrValidationProgram','rmrValidationPlan','rmrValidationCandidates'])assert.ok(exists(m.entrypoints[key]));
 assert.equal(m.researchPrototypes.rmrExternalValidation.status,'proposed-not-run');
 assert.equal(m.researchPrototypes.rmrExternalValidation.empiricalResultsPublished,false);
 assert.equal(m.implemented.empiricallyValidatedReadiness,false);
 assert.equal(m.implemented.calibratedIndividualUncertainty,false);
});
