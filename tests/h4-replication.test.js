import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base=new URL('../research/robustness/h4/',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,base)));
test('H4 retains the two pre-result freezes and admitted source identity',()=>{
 const lock=read('protocol.lock.json'),result=read('results.json');
 for(const key of ['protocol','admission'])assert.equal(createHash('sha256').update(readFileSync(new URL(lock[key],base))).digest('hex'),lock[key+'Sha256']);
 assert.equal(lock.freezeCommit,'d5250bec8bfa29157c7e6eb0dd0a0a271750b561');
 assert.equal(result.protocolSha256,lock.protocolSha256);assert.equal(result.sourceSha256,lock.sourceSha256);
 assert.equal(result.analyzedN+result.excludedN,result.admittedN);assert.equal(result.excludedN,1);
 assert.equal(result.groups.female.n+result.groups.male.n,result.analyzedN);
 assert.equal(result.allRecordEquationOnly.n,result.admittedN);
 assert.ok(result.independentImplementation.maximumPredictionDifferenceKcal<1e-9);
 assert.ok(result.independentImplementation.maximumAggregateDifference<1e-9);
 assert.equal(result.independentImplementation.separatePersonnel,false);
 assert.equal(result.decision,'retain-general-default-and-inspectable-alternative');
 assert.ok(!('rows' in result)&&!('predictions' in result));
});
test('H4 failure does not echo a sensitive input path or contents',()=>{
 const r=spawnSync('python3',['research/robustness/h4/analyze.py','--source','/missing/PRIVATE_HEALTH_SENTINEL','--output','/tmp/unused-h4-result.json'],{encoding:'utf8'});
 assert.equal(r.status,1);assert.equal(r.stdout,'');assert.doesNotMatch(r.stderr,/PRIVATE_HEALTH_SENTINEL/);assert.match(JSON.parse(r.stderr).error,/failed/);
});
