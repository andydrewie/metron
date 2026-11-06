import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inspectSensitivity,KNOBS,STRESS_FACTORS} from '../research/assumption-sensitivity/sensitivity.mjs';
import {estimateEnergy} from '../core/model.js';
const fixtures=JSON.parse(readFileSync(new URL('../research/assumption-sensitivity/fixtures.json',import.meta.url),'utf8'));
const inspect=id=>{const c=fixtures.cases.find(x=>x.id===id);assert.ok(c);return inspectSensitivity({profile:c.profile,activity:c.activity})};
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,actual+' != '+expected);

test('ordinary energy estimate is exactly reproducible in the research baseline',()=>{
 const c=fixtures.cases[0];
 const original=estimateEnergy({profile:c.profile,activity:c.activity});
 const before=JSON.stringify(c);
 const result=inspect('typical');
 close(result.referenceKcal,original.estimatedTdeeKcal);
 close(result.referenceKcal,2523.4625);
 assert.equal(result.methods.notEmpiricalUncertainty,true);
 assert.equal(result.methods.notPhysiologicallyValidated,true);
 assert.equal(JSON.stringify(c),before);
});

test('selected 10% parameter perturbations expose mathematical rather than empirical effects',()=>{
 const result=inspect('typical');
 assert.deepEqual(result.cases.map(x=>x.parameter),KNOBS);
 assert.deepEqual(STRESS_FACTORS,[0.9,1.1]);
 const byName=Object.fromEntries(result.cases.map(x=>[x.parameter,x.perturbations]));
 close(byName.sedentaryMultiplier[0].changeFromReferenceKcal,-201.10625);
 close(byName.sedentaryMultiplier[1].changeFromReferenceKcal,201.10625);
 close(byName.walkingNetKcalPerKgKm[0].changeFromReferenceKcal,-23.24);
 close(byName.walkingNetKcalPerKgKm[1].changeFromReferenceKcal,23.24);
 close(byName.strideHeightRatio[0].changeFromReferenceKcal,-23.24);
 close(byName.strideHeightRatio[1].changeFromReferenceKcal,23.24);
 close(byName.wholeSessionMET[0].changeFromReferenceKcal,-28);
 close(byName.wholeSessionMET[1].changeFromReferenceKcal,28);
});

test('zero walking and workout expose the baseline without fake activity responses',()=>{
 const result=inspect('no-walk-no-workout');
 close(result.referenceKcal,2098.5);
 for(const row of result.cases){
   if(row.parameter==='sedentaryMultiplier')continue;
   for(const p of row.perturbations)close(p.changeFromReferenceKcal,0);
 }
});

test('every synthetic outcome is finite, nonnegative and sum of components',()=>{
 for(const c of fixtures.cases){
   const result=inspect(c.id);
   for(const row of result.cases){
     for(const r of row.perturbations){
       assert.ok(Number.isFinite(r.estimatedTdeeKcal));
       assert.ok(r.estimatedTdeeKcal>=0);
       close(r.estimatedTdeeKcal,Object.values(r.components).reduce((a,b)=>a+b,0));
     }
   }
 }
});

test('headless runner prints correctly labeled synthetic JSON with no model changes',()=>{
 const path=new URL('../research/assumption-sensitivity/run.mjs',import.meta.url);
 const stdout=execFileSync(process.execPath,[path.pathname],{encoding:'utf8'});
 const output=JSON.parse(stdout);
 assert.equal(output.status,'synthetic-only');
 assert.equal(output.modelUpdated,false);
 assert.equal(output.results.length,3);
 assert.ok(output.results.every(x=>x.analysis.methods.notEmpiricalUncertainty));
});
