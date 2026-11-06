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
 assert.ok(['proposed-not-run','protocol-locked','benchmark-implemented','analysis-in-progress','published','blocked'].includes(plan.status));
 if(plan.status==='proposed-not-run'){
  assert.equal(plan.resultsAvailable,false);
  assert.equal(plan.measurementOutcomesAnalyzed,false);
 }
 if(plan.status==='published')assert.equal(plan.resultsAvailable,true);
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
  assert.ok(['not-started','in-progress','blocked','complete'].includes(g.state));
  assert.ok(g.evidenceNeeded.length>=3);
  assert.ok(g.goNoGo.length>20);
  for(const dep of g.dependsOn)assert.ok(seen.has(dep)&&dep!==g.id,'invalid gate dependency');
 }
 assert.ok(p.protections.noHumanHealthUploadsToRepository);
 assert.ok(p.protections.noKpiOrDeadline);
});

test('dataset candidates are transparently unverified rather than analyzed',()=>{
 const x=read('research/ree-validation/candidate-sources.json');
 assert.ok(['unverified-source-register','metadata-reviewed-source-register','verified-source-register','source-admission-register'].includes(x.kind));
 assert.ok(x.records.length>=3);
 for(const r of x.records){
  assert.ok(r.datasetDoi);
  assert.ok(r.recordUrl.startsWith('https://'));
  assert.equal(typeof r.fileContentsInspected,'boolean');
  assert.equal(typeof r.variablesMapped,'boolean');
  assert.ok(['candidate-not-admitted','not-currently-usable','conditionally-eligible','eligible','excluded'].includes(r.decision));
  if(r.decision==='eligible'){
   assert.equal(r.fileContentsInspected,true);
   assert.equal(r.variablesMapped,true);
   assert.ok(!r.rights.includes('unverified'));
  }
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
 const plan=read('research/ree-validation/plan.json');
 assert.equal(m.researchPrototypes.rmrExternalValidation.status,plan.status);
 assert.equal(m.researchPrototypes.rmrExternalValidation.empiricalResultsPublished,plan.resultsAvailable);
 assert.equal(m.implemented.empiricallyValidatedReadiness,false);
 assert.equal(m.implemented.calibratedIndividualUncertainty,false);
});

test('G0 source audit distinguishes reviewed metadata from uninspected measured records',()=>{
 const plan=read('research/ree-validation/plan.json');
 const sources=read('research/ree-validation/candidate-sources.json');
 assert.ok(['in-progress','blocked','complete'].includes(plan.phases[0].state));
 assert.ok(sources.records.length>=3);
 for(const r of sources.records){
   assert.equal(typeof r.metadataReviewed,'boolean');
   assert.equal(typeof r.fileContentsInspected,'boolean');
   assert.ok(r.licenseEvidence.startsWith('https://'));
   if(!r.fileContentsInspected)assert.notEqual(r.decision,'eligible');
 }
 assert.ok(sources.records.find(r=>r.id==='enable-rmr').observedFileManifest.length>=3);
 const nav=read('docs/navigation.json');
 const route=nav.routes.find(r=>r.id==='plan-resting-energy-validation');
 assert.ok(route.next.includes('research/ree-validation/G0_SOURCE_AUDIT.md'));
 assert.ok(exists('research/ree-validation/G0_SOURCE_AUDIT.md'));
});

test('verified G0 evidence qualifies real source schema but never fabricates prediction accuracy',()=>{
 const report=read('research/ree-validation/G0_FILE_VERIFICATION.json');
 const plan=read('research/ree-validation/plan.json');
 const source=read('research/ree-validation/candidate-sources.json').records.find(x=>x.id==='enable-rmr');
 assert.equal(report.gateDecision.g0,'passed-for-enable-data-tsv-only');
 assert.equal(report.privateRowDataStored,false);
 assert.equal(report.predictionsComputed,false);
 assert.equal(report.measuredPredictionErrorsComputed,false);
 assert.equal(report.admittedDataset.nonblankDataRows,459);
 assert.equal(report.admittedDataset.rmrsPositiveNumericCount,454);
 assert.equal(report.admittedDataset.basicFullInputCountMifflin,454);
 assert.equal(report.files.length,4);
 assert.ok(report.files.every(x=>x.zenodoMd5Verified===true && /^[0-9a-f]{64}$/.test(x.sha256)));
 assert.equal(source.decision,'eligible');
 assert.equal(source.fileContentsInspected,true);
 assert.equal(source.variablesMapped,true);
 assert.equal(plan.phases[0].state,'complete');
 assert.equal(plan.phases[1].state,'complete');
 assert.equal(plan.phases[1].protocolId,'RMR-EXT-001-G1-v1');
 if(plan.status==='protocol-locked')assert.equal(plan.resultsAvailable,false);
 assert.equal(plan.measurementOutcomesAnalyzed,false);
});
