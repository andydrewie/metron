import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { auditOverlap } from '../research/energy-accounting/audit.mjs';
import { estimateEnergy } from '../core/model.js';
const fixtures=JSON.parse(readFileSync(new URL('../research/energy-accounting/scenarios.json',import.meta.url),'utf8'));
const scenario=id=>{
  const row=fixtures.cases.find(x=>x.id===id);
  assert.ok(row,'Missing synthetic scenario '+id);
  return auditOverlap({
    profile:fixtures.profile,
    activity:{...fixtures.defaultActivity,...row.activity},
    overlap:row.overlap
  });
};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,a+' differs from '+b);

test('same aggregate inputs give different conditional outcomes when overlap assumption changes',()=>{
  const disjoint=scenario('disjoint-resistance');
  const treadmill=scenario('known-treadmill');
  const unknown=scenario('bounded-unknown');
  near(disjoint.publishedModel.estimatedTdeeKcal,2523.4625);
  near(disjoint.publishedModel.estimatedTdeeKcal,treadmill.publishedModel.estimatedTdeeKcal);
  near(treadmill.publishedModel.estimatedTdeeKcal,unknown.publishedModel.estimatedTdeeKcal);
  near(disjoint.conditionalScenario.minimumKcal,2523.4625);
  near(treadmill.conditionalScenario.minimumKcal,2349.1625);
  near(treadmill.conditionalScenario.maximumRemovedWalkingKcal,174.3);
  near(unknown.conditionalScenario.minimumKcal,treadmill.conditionalScenario.minimumKcal);
  near(unknown.conditionalScenario.maximumKcal,disjoint.conditionalScenario.maximumKcal);
  assert.equal(unknown.conditionalScenario.isCalibratedInterval,false);
  assert.equal(unknown.conditionalScenario.isValidatedCorrection,false);
});

test('published energy model remains unchanged by research-only hypotheses',()=>{
  const baseline=estimateEnergy({profile:fixtures.profile,activity:fixtures.defaultActivity});
  const start=JSON.stringify(fixtures);
  for(const row of fixtures.cases.slice(0,3)){
    const x=scenario(row.id);
    assert.equal(x.publishedModel.estimatedTdeeKcal,baseline.estimatedTdeeKcal);
  }
  assert.equal(JSON.stringify(fixtures),start);
});

test('very low steps demonstrate current baseline plateau rather than measured equality',()=>{
  const zero=scenario('zero-steps');
  const baseline=scenario('baseline-steps');
  const high=scenario('high-steps');
  near(zero.publishedModel.estimatedTdeeKcal,2098.5);
  near(baseline.publishedModel.estimatedTdeeKcal,2098.5);
  near(high.publishedModel.estimatedTdeeKcal,2621.4);
});

test('experiment refuses overlap without evidence-consistent model allocations',()=>{
  const input={profile:fixtures.profile,activity:fixtures.defaultActivity};
  assert.throws(()=>auditOverlap({...input,overlap:{kind:'known',stepsAssignedToWorkoutBeyondBaseline:-1}}),RangeError);
  assert.throws(()=>auditOverlap({...input,overlap:{kind:'known',stepsAssignedToWorkoutBeyondBaseline:8001}}),RangeError);
  assert.throws(()=>auditOverlap({...input,overlap:{kind:'known',stepsAssignedToWorkoutBeyondBaseline:1.5}}),RangeError);
  assert.throws(()=>auditOverlap({...input,overlap:{kind:'bounded-unknown',maximumStepsAssignedToWorkoutBeyondBaseline:9000}}),RangeError);
  assert.throws(()=>auditOverlap({...input,overlap:{kind:'unqualified'}}),TypeError);
  assert.throws(()=>auditOverlap({...input,activity:{steps:10000,workoutMinutes:0},overlap:{kind:'known',stepsAssignedToWorkoutBeyondBaseline:1}}),RangeError);
});

test('headless research runner prints navigable, synthetic JSON',()=>{
  const script=new URL('../research/energy-accounting/run.mjs',import.meta.url);
  const json=execFileSync(process.execPath,[script.pathname],{encoding:'utf8'});
  const result=JSON.parse(json);
  assert.equal(result.schemaVersion,'1.0.0');
  assert.equal(result.status,'synthetic-only');
  assert.equal(result.results.length,6);
  assert.equal(result.results.find(x=>x.id==='bounded-unknown').diagnostic.conditionalScenario.isCalibratedInterval,false);
});
