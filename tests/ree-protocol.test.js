import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const json=path=>JSON.parse(read(path));
const p=json('research/ree-validation/protocol.v1.json');
const lock=json('research/ree-validation/protocol.lock.json');
const source=json('research/ree-validation/G0_FILE_VERIFICATION.json');
const plan=json('research/ree-validation/plan.json');
const manifest=json('metron.manifest.json');

test('G1 protocol is frozen to one byte-exact versioned JSON file',()=>{
  const bytes=read(lock.immutablePath);
  const hash=createHash('sha1').update('blob '+Buffer.byteLength(bytes)+'\0').update(bytes).digest('hex');
  assert.equal(hash,lock.protocolGitBlobSha);
  assert.equal(p.protocolId,lock.protocolId);
  assert.equal(p.studyId,'RMR-EXT-001');
  assert.equal(p.status,'frozen-before-model-error-analysis');
  assert.equal(p.resultsAvailable,false);
  assert.equal(p.observedVsPredictedErrorsExamined,false);
  assert.equal(lock.preOutcomeErrorAnalysis,true);
  assert.match(lock.modelGitBlobSha,/^[0-9a-f]{40}$/);
  assert.equal(p.safeguards.noModelErrorBeforeFreeze,true);
  assert.equal(p.safeguards.noCalibrationOrCoefficientTraining,true);
  assert.match(lock.changePolicy,/protocol\.v2\.json/);
});

test('reference source is immutable admitted enable v1 data and kJ/day is explicit',()=>{
  const file=source.files.find(x=>x.name===p.source.file);
  assert.equal(p.source.recordId,17735477);
  assert.equal(p.source.file,'enable_data.tsv');
  assert.equal(p.source.actualDelimiter,'comma');
  assert.equal(p.source.fileSha256,file.sha256);
  assert.equal(lock.sourceDataSha256,file.sha256);
  assert.equal(p.source.reportedRawRows,459);
  assert.equal(p.source.reportedProvisionalCompleteRows,454);
  assert.equal(p.source.expectedCountsNotEnforced.startsWith('Final'),true);
  assert.match(p.variables.measuredRmrConversion,/4\.184/);
  assert.equal(p.variables.measuredRmrKjDay,'RMR.KJ');
  assert.equal(p.source.license,'CC BY 4.0');
  assert.equal(p.primaryEligibility.noOutcomeBasedExclusion,true);
});

test('participant inclusion rules explicitly preserve model domain and prevent post hoc exclusions',()=>{
  assert.deepEqual(p.primaryEligibility.orderedRules.map(x=>x.id),['file-integrity','headers','id','sex','age','height','weight','reference']);
  assert.deepEqual(p.variables.equationSexMapping,{'männlich':'male','weiblich':'female'});
  assert.match(p.variables.mappingMeaning,/never inferred gender identity/);
  assert.equal(p.primaryEligibility.noImputation,true);
  assert.equal(p.primaryEligibility.noWinsorization,true);
  assert.match(p.primaryEligibility.duplicatePolicy,/Abort/);
  assert.match(p.primaryEligibility.outcomeValidity,/retained/);
});

test('matched Mifflin and Cunningham use same cohort with BIA measurement caveat',()=>{
  assert.equal(p.models.mifflin.export,'mifflinStJeor');
  assert.equal(p.models.cunningham.export,'cunninghamRmr');
  assert.match(p.models.cunningham.eligibleFfm,/5–150/);
  assert.match(p.models.cunningham.eligibleFfm,/FFM<=weight/);
  assert.match(p.models.cunningham.limitation,/BIA-estimated/);
  assert.match(p.models.pairedComparison,/exact same eligible IDs/);
  assert.equal(p.models.originalCoreBlobSha,lock.modelGitBlobSha);
  assert.equal(p.models.noRefitting,true);
});

test('statistical targets and seed are frozen; intervals not individual uncertainty',()=>{
  assert.equal(p.metrics.primary.name,'MAE');
  assert.equal(p.metrics.secondary.length,4);
  assert.match(p.metrics.conditionalPairedDelta.formula,/MAE_C - MAE_M/);
  assert.equal(p.metrics.noUniversalPassThreshold,true);
  assert.equal(p.resampling.replicateCount,5000);
  assert.equal(p.resampling.seed,20261106);
  assert.equal(p.resampling.sampleUnit,'Probanden-ID');
  assert.match(p.resampling.method,/stratified by recorded Site/);
  assert.match(p.resampling.pairedRule,/identical IDs/);
  assert.match(p.resampling.interval,/95% percentile/);
  assert.match(p.resampling.interpretation,/not individual prediction uncertainty/);
});

test('subgroups and version-control gate have evidence based limits',()=>{
  assert.equal(p.subgroups.minimumNForAccuracy,30);
  assert.deepEqual(p.subgroups.dimensions.map(x=>x.name),['Site','equationSex','ageYears','BMI']);
  assert.match(p.subgroups.smallNRule,/n<30/);
  assert.equal(plan.phases[0].state,'complete');
  assert.equal(plan.phases[1].state,'complete');
  assert.equal(plan.phases[1].protocolId,p.protocolId);
  if(plan.status==='protocol-locked')assert.equal(plan.resultsAvailable,false);
  assert.equal(manifest.researchPrototypes.rmrExternalValidation.status,plan.status);
  assert.equal(manifest.researchPrototypes.rmrExternalValidation.empiricalResultsPublished,plan.resultsAvailable);
  assert.equal(manifest.implemented.calibratedIndividualUncertainty,false);
});
