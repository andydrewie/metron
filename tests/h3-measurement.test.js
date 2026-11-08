import test from 'node:test';
import assert from 'node:assert/strict';
import {compareObservations,inspectCoverage} from '../research/robustness/h3/inspect.mjs';
import {estimateEnergy} from '../core/model.js';
const observation={quantity:'hrv-rmssd',unit:'ms',method:'ECG-5min-supine',reference:'normal-intervals',windowStart:'2026-11-01T00:00:00Z',windowEnd:'2026-11-01T00:05:00Z',algorithmVersion:'synthetic-1',origin:'observed'};
test('same-unit metrics, missing methods and defaults do not become interchangeable observations',()=>{
 assert.equal(compareObservations(observation,{...observation,quantity:'hrv-sdnn'}).state,'not-comparable');
 assert.equal(compareObservations(observation,{...observation,method:null}).state,'not-comparable');
 assert.equal(compareObservations(observation,{...observation,origin:'defaulted'}).state,'not-comparable');
 assert.equal(compareObservations(observation,observation).accuracyEstablished,false);
});
test('midnight and DST windows retain real elapsed time without inferring step membership',()=>{
 const r=inspectCoverage({start:'2026-11-01T00:00:00-04:00',end:'2026-11-02T00:00:00-05:00',sampleStart:'2026-11-01T23:45:00-05:00',sampleEnd:'2026-11-02T00:15:00-05:00'});
 assert.equal(r.windowHours,25);assert.equal(r.overlapMinutes,15);assert.equal(r.membership,'unknown');assert.equal(r.automaticSubtractionPermitted,false);assert.equal(r.completeObservation,false);
 const spring=inspectCoverage({start:'2026-03-08T00:00:00-05:00',end:'2026-03-09T00:00:00-04:00',sampleStart:'2026-03-08T03:00:00-04:00',sampleEnd:'2026-03-08T03:30:00-04:00',historyComplete:true,readAccessKnown:true,capped:true});
 assert.equal(spring.windowHours,23);assert.equal(spring.completeObservation,false);
});
test('gross/net reference and baseline plateau remain explicit arithmetic assumptions',()=>{
 const a=estimateEnergy({activity:{steps:0,workoutMinutes:0}}),b=estimateEnergy({activity:{steps:2000,workoutMinutes:0}});
 assert.equal(a.estimatedTdeeKcal,b.estimatedTdeeKcal);
 const c=estimateEnergy();
 assert.equal(c.components.workoutKcal,Math.max(0,c.derived.sessionMet*80-c.components.baselineKcal/24));
 // Joint composition errors can cancel or compound. This is not a distribution.
 const base=500+22*80*(1-.2),changed=500+22*82*(1-.22);
 assert.notEqual(changed-base,-.22*80*2);
});
