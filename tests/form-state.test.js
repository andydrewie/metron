import test from 'node:test';
import assert from 'node:assert/strict';
import {createFormState,transitionForm,exportSnapshot,hasBodyFat} from '../ui/form-state.js';
import {evaluate} from '../core/model.js';
const number=(form,id,value,valid=true)=>transitionForm(form,{type:'numeric',id,value,valid});
const choice=(form,key,value)=>transitionForm(form,{type:'choice',key,value});
const composition=(form,enabled)=>transitionForm(form,{type:'composition',enabled});

test('disabling composition during an invalid edit clears data and prevents hidden input revival',()=>{
  let f=composition(createFormState(),true);
  f=number(f,'bodyfat','20');f=number(f,'smm','30');f=choice(f,'restingModel','cunningham');
  f=number(f,'weight','');assert.equal(f.result.state,'invalid');assert.equal(exportSnapshot(f),null);
  f=composition(f,false);
  assert.equal(f.compositionEnabled,false);assert.equal(hasBodyFat(f),false);
  assert.equal(f.input.profile.bodyFatPercent,null);assert.equal(f.input.profile.skeletalMuscleKg,null);
  assert.equal(f.input.activity.restingModel,'mifflin');assert.equal(f.rawValues.bodyfat,'');
  assert.equal(number(f,'bodyfat','25'),f);assert.equal(choice(f,'restingModel','cunningham'),f);
  f=number(f,'weight','80');const payload=exportSnapshot(f);
  assert.equal(payload.input.profile.bodyFatPercent,null);assert.equal(payload.output.energy.restingModel,'mifflin');
  assert.equal(payload.inputOrigins.activity.restingModel,'fallback-default');
});
test('other controls continue tracking the current draft while results are blocked',()=>{
  let f=number(createFormState(),'weight','');
  f=number(f,'steps','20000');f=number(f,'minutes','0');f=number(f,'sleep','6');f=choice(f,'energy','low');
  assert.equal(f.input.activity.steps,20000);assert.equal(f.rawValues.steps,'20000');
  assert.equal(f.input.activity.workoutMinutes,0);assert.equal(f.input.recovery.sleepHours,6);
  assert.equal(exportSnapshot(f),null);
  f=number(f,'weight','80');assert.deepEqual(exportSnapshot(f).output,evaluate(f.input));
});
test('multiple errors require their own correction; composition off clears only composition errors',()=>{
  let f=composition(createFormState(),true);
  f=number(f,'weight','');f=number(f,'age','17',false);f=number(f,'bodyfat','99',false);
  f=composition(f,false);assert.deepEqual([...f.invalidFields].sort(),['age','weight']);
  f=number(f,'weight','80');assert.equal(f.result.state,'invalid');
  f=number(f,'age','30');assert.equal(f.result.state,'ready');
});
test('cross-field invalidity blocks export and clears after correction without losing other inputs',()=>{
  let f=composition(createFormState(),true);f=number(f,'bodyfat','40');f=number(f,'smm','60');
  assert.equal(f.result.state,'invalid');assert.equal(exportSnapshot(f),null);
  assert.deepEqual(f.result.fields,['smm','weight','bodyfat']);
  const correctedByWeight=number(f,'weight','110');assert.equal(correctedByWeight.result.state,'ready');
  const heavierMuscle=number(f,'smm','90');assert.deepEqual(heavierMuscle.result.fields,['smm','weight']);
  f=number(f,'smm','');assert.equal(f.result.state,'ready');assert.equal(f.input.profile.bodyFatPercent,40);
});
test('exports are isolated snapshots and reject a mismatched revision',()=>{
  const initial=createFormState(),payload=exportSnapshot(initial);
  assert.deepEqual(payload.output,evaluate());payload.input.profile.weightKg=300;
  assert.equal(exportSnapshot(initial).input.profile.weightKg,80);
  assert.equal(exportSnapshot({...initial,revision:initial.revision+1}),null);
  const edited=number(initial,'weight','90');assert.equal(initial.input.profile.weightKg,80);
  assert.equal(edited.revision,1);assert.equal(edited.result.revision,edited.revision);
  assert.throws(()=>{edited.input.profile.weightKg=100;},TypeError);
});
test('optional unknowns and unchanged standard model retain honest input origins',()=>{
  let f=composition(createFormState(),false);
  assert.equal(f.origins.activity.restingModel,'example-default');
  f=composition(f,true);assert.equal(hasBodyFat(f),false);
  f=number(f,'bodyfat','20');f=choice(f,'restingModel','cunningham');f=number(f,'bodyfat','');
  assert.equal(f.input.activity.restingModel,'mifflin');assert.equal(hasBodyFat(f),false);
  assert.equal(exportSnapshot(f).inputOrigins.profile.bodyFatPercent,'unknown');
});
