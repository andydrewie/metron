import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inspectEventContext} from '../research/activity-events/inspect.mjs';
const dir=new URL('../research/provider-step-semantics/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,dir),'utf8'));
const matrix=read('matrix.json'),fixtures=read('fixtures.json');
test('official documentation comparison exposes uncertainty rather than a correction',()=>{
 assert.equal(matrix.schemaVersion,'1.0.0');
 assert.equal(matrix.productionModelChanged,false);
 assert.equal(matrix.evidenceBasis,'public-official-provider-documentation');
 assert.deepEqual(matrix.comparison.map(x=>x.id),['whoop-v2','garmin-connect','apple-healthkit']);
 for(const row of matrix.comparison){
  assert.equal(row.automaticDailyStepInclusionProven,false);
  assert.equal(row.experimentalMembership,'unknown');
  assert.equal(row.sourceUrls.length,row.sourceIds.length);
  assert.ok(row.sourceUrls.length>=2);
  for(const url of row.sourceUrls) assert.ok(/^https:\/\/developer\.(whoop|garmin|apple)\.com\//.test(url),url);
 }
 assert.equal(matrix.researchDecision.requiresHumanDataNow,false);
});
test('all synthetic provider-inspired records retain unknown membership',()=>{
 assert.equal(fixtures.cases.length,3);
 for(const c of fixtures.cases){
  assert.equal(c.record.membership.status,'unknown');
  assert.ok(matrix.comparison.some(x=>x.id===c.providerRef));
  const result=inspectEventContext(c.record);
  assert.equal(result.stepMembership.status,'unknown');
  assert.equal(result.stepMembership.includedSteps,null);
  assert.equal(result.modifiesTdee,false);
  assert.equal(result.calibratedUncertainty,false);
 }
});
test('physiological cycle and calendar-day summaries retain distinct periods',()=>{
 const whoop=inspectEventContext(fixtures.cases.find(x=>x.id==='whoop-cycle').record);
 assert.equal(whoop.temporalRelation,'disjoint');
 assert.equal(whoop.stepSummary.periodBasis,'physiological-cycle');
 for(const id of ['garmin-all-day','apple-mixed-sources']){
  const example=fixtures.cases.find(x=>x.id===id);
  assert.equal(example.record.workout.stepsDuringWorkout,6000);
  const result=inspectEventContext(example.record);
  assert.equal(result.temporalRelation,'workout-contained');
  assert.equal(result.stepMembership.includedSteps,null);
 }
});
test('missing cycle step data must never be converted into zero',()=>{
 const c=JSON.parse(JSON.stringify(fixtures.cases[0].record));
 c.stepSummary.steps=null;
 assert.throws(()=>inspectEventContext(c),RangeError);
});
test('headless provider comparison prints structured, synthetic-only output',()=>{
 const stdout=execFileSync(process.execPath,[new URL('run.mjs',dir).pathname],{encoding:'utf8'});
 const result=JSON.parse(stdout);
 assert.equal(result.schemaVersion,'1.0.0');
 assert.equal(result.conclusion,'not-established-across-reviewed-surfaces');
 assert.equal(result.productionModelChanged,false);
 assert.equal(result.results.length,3);
 assert.ok(result.results.every(x=>x.inspection.stepMembership.includedSteps===null));
});
