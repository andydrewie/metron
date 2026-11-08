import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {DEFAULTS,normalizeInput,mifflinStJeor,cunninghamRmr,fatFreeMassKg,evaluate} from '../core/model.js';
test('public defaults cannot be mutated across consumers',()=>{
 const before=evaluate();assert.throws(()=>{DEFAULTS.profile.weightKg=999;},TypeError);
 assert.throws(()=>{DEFAULTS.activity.steps=0;},TypeError);assert.deepEqual(evaluate(),before);
});
test('unknown prototype keys, accessors and non-data input are rejected without running getters',()=>{
 for(const key of ['__proto__','constructor','toString','private-health-marker']) {
  const input=JSON.parse('{"profile":{"'+key+'":1}}');
  assert.throws(()=>normalizeInput(input),e=>e instanceof TypeError&&!e.message.includes(key));
 }
 let calls=0;const input={get profile(){calls++;return {};}};
 assert.throws(()=>normalizeInput(input));assert.equal(calls,0);
 for(const v of [new Date(),[],Object.create({profile:{weightKg:90}})])assert.throws(()=>normalizeInput(v));
 const own=Object.create(null);own.profile={weightKg:90};assert.equal(normalizeInput(own).profile.weightKg,90);
});
test('direct exports validate finite units and equation categories',()=>{
 assert.equal(mifflinStJeor(DEFAULTS.profile),1748.75);
 for(const sex of ['unknown',null,1])assert.throws(()=>mifflinStJeor({...DEFAULTS.profile,equationSex:sex}));
 for(const n of [NaN,Infinity,'60',0,-1,351])assert.throws(()=>cunninghamRmr(n));
 assert.equal(cunninghamRmr(60),1820);
 assert.throws(()=>fatFreeMassKg({weightKg:'80',bodyFatPercent:20}));
 assert.equal(fatFreeMassKg({weightKg:80,bodyFatPercent:null}),null);
});
test('CLI errors do not disclose malformed JSON, unknown fields, arguments or private paths',()=>{
 const sentinel='PRIVATE_HEALTH_SENTINEL';
 for(const [args,input] of [[[],`{"${sentinel}":`],[[],`{"profile":{"${sentinel}":1}}`],[['--file','/missing/'+sentinel],null],[['--'+sentinel],null],[['--example','--file',sentinel],null]]) {
  const r=spawnSync(process.execPath,['bin/metron.mjs',...args],{input,encoding:'utf8'});
  assert.equal(r.status,1);assert.equal(r.stdout,'');assert.doesNotMatch(r.stderr,new RegExp(sentinel));assert.equal(typeof JSON.parse(r.stderr).error,'string');
 }
 const r=spawnSync(process.execPath,['bin/metron.mjs'],{input:' '.repeat(1048577),encoding:'utf8'});
 assert.equal(r.status,1);assert.match(JSON.parse(r.stderr).error,/limit/);
});
