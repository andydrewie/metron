import test from 'node:test'; import assert from 'node:assert/strict';
import {DEFAULTS,normalizeInput,mifflinStJeor,estimateEnergy,evaluateRecovery,evaluate,fatFreeMassKg,cunninghamRmr} from '../core/model.js';
test('Mifflin equations match published simplified formulas',()=>{
  assert.equal(mifflinStJeor({weightKg:80,heightCm:175,ageYears:30,equationSex:'male'}),1748.75);
  assert.equal(mifflinStJeor({weightKg:80,heightCm:175,ageYears:30,equationSex:'female'}),1582.75);
});
test('FFM is total non-fat mass, not just SMM',()=>{
  assert.equal(fatFreeMassKg({weightKg:100,bodyFatPercent:20}),80);
  assert.equal(cunninghamRmr(80),2260);
});
test('step increments scale with body mass and preserve invariants',()=>{
  const low=estimateEnergy({profile:{weightKg:60},activity:{steps:10000,workoutMinutes:0}});
  const high=estimateEnergy({profile:{weightKg:120},activity:{steps:10000,workoutMinutes:0}});
  assert.ok(high.components.walkingKcal>low.components.walkingKcal);
  assert.equal(estimateEnergy({activity:{steps:0,workoutMinutes:0}}).components.walkingKcal,0);
  assert.equal(estimateEnergy({activity:{steps:2000,workoutMinutes:0}}).components.walkingKcal,0);
});
test('zero workout has zero additional gym kcal',()=>assert.equal(estimateEnergy({activity:{workoutMinutes:0}}).components.workoutKcal,0));
test('Cunningham requires BF data',()=>assert.throws(()=>estimateEnergy({activity:{restingModel:'cunningham'}}),/bodyFatPercent/));
test('impossible body composition rejected',()=>assert.throws(()=>normalizeInput({profile:{weightKg:70,bodyFatPercent:40,skeletalMuscleKg:50}}),/cannot exceed/));
test('invalid numeric range rejected',()=>assert.throws(()=>estimateEnergy({activity:{steps:-2}}),RangeError));
test('all outputs are deterministic and serializable',()=>{
  const a=evaluate(); const b=evaluate(); assert.deepEqual(a,b); assert.doesNotThrow(()=>JSON.stringify(a));
});
test('sleep under five triggers recovery-first status',()=>{
  const x=evaluateRecovery({recovery:{sleepHours:4.5}}); assert.equal(x.status,'recovery-first');assert.deepEqual([x.recommendation.minSets,x.recommendation.maxSets],[0,0]);
});
test('weekly fatigue reduces suggested volume relative to fresh week',()=>{
  const fresh=evaluateRecovery({recovery:{weekly:'fresh',usualMuscleSets:20}});
  const tired=evaluateRecovery({recovery:{weekly:'fatigued',usualMuscleSets:20}});
  assert.ok(fresh.recommendation.maxSets>tired.recommendation.maxSets);
});
test('explicitly does not treat more steps as automatic recovery penalty',()=>{
  const a=evaluateRecovery({activity:{steps:3000}});const b=evaluateRecovery({activity:{steps:20000}});
  assert.deepEqual(a.recommendation,b.recommendation);
});
test('default profile is generic, not a personal record',()=>{
  assert.equal(DEFAULTS.profile.weightKg,80); assert.equal(DEFAULTS.profile.bodyFatPercent,null);
});

test('no unexpected fields are silently accepted',()=>{
  assert.throws(()=>normalizeInput({unknown:12}),/Unknown top-level/);
  assert.throws(()=>normalizeInput({profile:{bodymass:80}}),/Unknown profile/);
  assert.throws(()=>normalizeInput({activity:null}),/must not be null/);
});
test('estimating energy must never mutate a caller-provided profile',()=>{
  const input={profile:{weightKg:90},activity:{steps:9500}};
  const copy=JSON.stringify(input);
  estimateEnergy(input); assert.equal(JSON.stringify(input),copy);
});
test('step expenditure increases monotonically as steps rise over baseline',()=>{
  let prev=-1;
  for(let steps=2000;steps<=30000;steps+=1000){
    const {components}=estimateEnergy({activity:{steps,workoutMinutes:0}});
    assert.ok(components.walkingKcal>=prev);prev=components.walkingKcal;
  }
});
test('TDEE is not reduced when energy or weekly fatigue changes',()=>{
  const a=evaluate({recovery:{sleepHours:8,weekly:'fresh'}}).energy;
  const b=evaluate({recovery:{sleepHours:4,weekly:'fatigued'}}).energy;
  assert.equal(a.estimatedTdeeKcal,b.estimatedTdeeKcal);
});
test('model change is explicit and observable, never adds SMM as bonus',()=>{
  const a=estimateEnergy({profile:{bodyFatPercent:20,skeletalMuscleKg:25},activity:{restingModel:'cunningham'}});
  const b=estimateEnergy({profile:{bodyFatPercent:20,skeletalMuscleKg:35},activity:{restingModel:'cunningham'}});
  assert.equal(a.estimatedTdeeKcal,b.estimatedTdeeKcal);
});
