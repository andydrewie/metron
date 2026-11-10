import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {evaluate} from '../core/model.js';
import {wilson,difference,planningCalculations,compareAggregates} from '../research/robustness/h6/analysis.mjs';
import {allocate,participantPacket} from '../research/robustness/h6/packet.mjs';
import {checkProtocol,inspectProtocol} from '../research/robustness/h6/check.mjs';
const base=new URL('../research/robustness/h6/',import.meta.url),bytes=f=>readFileSync(new URL(f,base)),read=f=>JSON.parse(bytes(f));
const plan=read('evaluation-plan.json'),tasks=read('tasks.json').tasks,rules=plan.comprehension.decisionRules;
const near=(a,b,t=1e-5)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function aggregates(){return {dataKind:'synthetic',quotasMet:true,codingComplete:true,
  H:{assigned:20,critical:10,unknownCritical:0,decisionSuccess:5,unknownDecision:0,criticalByTask:{T1:6,T2:4,T5:4},boundaryCorrect:{T1:10,T2:10,T5:10}},
  R:{assigned:20,critical:0,unknownCritical:0,decisionSuccess:19,unknownDecision:0,criticalByTask:{T1:0,T2:0,T5:0},boundaryCorrect:{T1:19,T2:19,T5:19}}};}
test('protocol integrity is distinct from actual review, enrollment and H6 closure',()=>{
  const r=inspectProtocol();assert.deepEqual(r.errors,[]);assert.equal(r.valid,true);assert.equal(r.observationsCollected,0);assert.equal(r.readyToCollect,false);assert.equal(r.actualHumanReviewRecorded,false);assert.equal(r.automaticGateClosure,false);
  const p=JSON.parse(readFileSync(new URL('../research/robustness/plan.json',import.meta.url)));
  assert.equal(p.gates.find(g=>g.id==='H6').state,'blocked');assert.equal(p.gates.find(g=>g.id==='H6').closure,null);
  const fixture={plan:structuredClone(plan),tasks:read('tasks.json'),lock:read('protocol-lock.json'),run:read('run-template.json')};
  fixture.plan.comprehension.observationsCollected=40;
  assert.equal(checkProtocol(fixture,bytes).valid,false);
  assert.equal(checkProtocol({...fixture,plan},f=>f==='tasks.json'?Buffer.from('changed'):bytes(f)).valid,false);
});
test('sample planning and interval arithmetic agree with independent reference cases',()=>{
  near(wilson(0,20).upper,0.16112515805281938,1e-12);near(wilson(20,20).lower,1-wilson(0,20).upper,1e-12);
  const w=wilson(10,20);near(w.lower,0.2992980081982123,1e-12);near(w.upper,0.7007019918017877,1e-12);
  // NIST worked example: 8/40 minus 11/30, 95% adjusted-Wald interval.
  const d=difference(8,40,11,30);near(d.estimate,-1/6,1e-12);near(d.lower,-0.36936,1e-5);near(d.upper,0.04794,1e-5);
  const swapped=difference(11,30,8,40);near(d.lower,-swapped.upper,1e-12);
  assert.equal(planningCalculations().kind,'planning-calculation-not-observations');
  for(const [x,n] of [[0,0],[2,1],[-1,20],[1.2,20],[1,Infinity]])assert.throws(()=>wilson(x,n));
});
test('synthetic success cannot become human evidence or close a gate',()=>{
  const r=compareAggregates(aggregates(),rules);assert.equal(r.ruleEvaluation,'promising-pilot-signal');assert.equal(r.interpretation,'synthetic-only');assert.equal(r.humanEvidenceVerified,false);assert.equal(r.automaticGateClosure,false);
});
test('missingness, repeated errors and incomplete coverage defeat a positive reading',()=>{
  const a=aggregates();a.R.decisionSuccess=15;a.R.unknownDecision=5;a.R.unknownCritical=5;assert.equal(compareAggregates(a,rules).ruleEvaluation,'inconclusive');
  const b=aggregates();b.R.critical=2;b.R.criticalByTask.T5=2;b.R.decisionSuccess=18;b.R.boundaryCorrect.T5=18;assert.equal(compareAggregates(b,rules).ruleEvaluation,'revise');
  const c=aggregates();c.quotasMet=false;assert.equal(compareAggregates(c,rules).ruleEvaluation,'inconclusive');
  const d=aggregates();d.H.critical=4;d.H.criticalByTask={T1:2,T2:2,T5:0};d.R.unknownCritical=2;d.R.decisionSuccess=18;
  const r=compareAggregates(d,rules);assert.equal(r.criticalReduction.estimate,0.2);assert.equal(r.leastFavorableMissingness.criticalReduction.estimate,0.1);assert.equal(r.ruleEvaluation,'improvement-not-demonstrated');
  const e=aggregates();e.R.critical=3;assert.throws(()=>compareAggregates(e,rules));
  const f=aggregates();f.H.participantName='SYNTHETIC_PRIVATE_SENTINEL';assert.throws(()=>compareAggregates(f,rules),err=>!err.message.includes('SYNTHETIC_PRIVATE_SENTINEL'));
  const g=aggregates();g.R.unknownCritical=2;assert.throws(()=>compareAggregates(g,rules));
});
test('an early interpretation stop remains reportable with an empty comparison arm',()=>{
  const a=aggregates();
  a.H={assigned:0,critical:0,unknownCritical:0,decisionSuccess:0,unknownDecision:0,criticalByTask:{T1:0,T2:0,T5:0},boundaryCorrect:{T1:0,T2:0,T5:0}};
  a.R={assigned:2,critical:2,unknownCritical:0,decisionSuccess:0,unknownDecision:0,criticalByTask:{T1:0,T2:0,T5:2},boundaryCorrect:{T1:2,T2:2,T5:0}};
  a.quotasMet=false;const r=compareAggregates(a,rules);assert.equal(r.ruleEvaluation,'revise');assert.equal(r.criticalReduction,null);assert.equal(r.automaticGateClosure,false);
});
test('concealed allocation balances each stratum and rejects malformed blocks',()=>{
  const results=allocate(plan.comprehension.sample.quotaStrata,()=>0);
  assert.equal(results.reduce((n,r)=>n+r.assignments.length,0),40);
  for(const r of results){assert.equal(r.assignments.filter(x=>x==='H').length,r.assignments.length/2);for(let i=0;i<r.assignments.length;i+=4)assert.equal(r.assignments.slice(i,i+4).filter(x=>x==='R').length,2);}
  assert.throws(()=>allocate([{id:'bad',target:5}]));assert.throws(()=>allocate([{id:'bad',target:4}],()=>9));
});
test('participant packets keep the answer key and preferred-arm label out of display',()=>{
  for(const condition of ['H','R']) {
    const p=participantPacket(tasks,condition);assert.doesNotMatch(p,/comprehension2|rubric|criticalReductionMargin|Selected historical wording|Restricted wording/);
    assert.ok(p.indexOf('## Readiness wording')<p.indexOf('## A cohort interval'));
    assert.ok(p.includes(tasks[0].wording[condition][0]));assert.ok(!p.includes(tasks[0].wording[condition==='H'?'R':'H'][0]));
  }
  assert.throws(()=>participantPacket(tasks,'unknown'));
  const c=spawnSync(process.execPath,['research/robustness/h6/packet.mjs','--condition','R'],{encoding:'utf8'});assert.equal(c.status,0);assert.equal(c.stdout,participantPacket(tasks,'R'));
});
test('hypothetical stimulus numbers reproduce the frozen unchanged model',()=>{
  const t2=evaluate(tasks.find(t=>t.id==='T2').syntheticInput).energy.derived;
  assert.equal(Math.round(t2.mifflinKcal),1749);assert.equal(Math.round(t2.cunninghamKcal),1750);
  const t5=evaluate(tasks.find(t=>t.id==='T5').syntheticInput).recovery;
  assert.equal(t5.status,'full-session');assert.equal(t5.recommendation.minSets,13);assert.equal(t5.recommendation.maxSets,14);
});
