import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {after} from 'node:test';
import {frozenStudy} from '../research/robustness/h8/frozen-study.mjs';
const replay=frozenStudy();
after(()=>replay.cleanup());
const frozen=await import(replay.moduleUrl);
const {G1_COMMIT,parseCsv,numberOrNull,loadLockedProtocol,sha256,evaluateCsv}=frozen;

const fixturePath=new URL('../research/ree-validation/fixtures/synthetic-rmr.csv',import.meta.url);
const fixture=readFileSync(fixturePath,'utf8');
const {protocol,lock}=loadLockedProtocol();
const analyze=(text=fixture)=>evaluateCsv(text,{protocol,lock,synthetic:true});
const near=(a,b,delta=1e-7)=>assert.ok(Math.abs(a-b)<delta,String(a)+' is not '+String(b));

test('G1 commit, model source and file hashes are pinned and verified',()=>{
  assert.equal(G1_COMMIT,'6028a80fb7070b354dec68feeb7153ce0a4cbef9');
  assert.equal(protocol.protocolId,'RMR-EXT-001-G1-v1');
  assert.equal(protocol.resampling.replicateCount,5000);
  assert.equal(protocol.resampling.seed,20261106);
  assert.equal(lock.protocolGitBlobSha,'2a40beada8abfec0c778e1c64da256836ed735db');
  assert.match(sha256(Buffer.from(fixture)),/^[a-f0-9]{64}$/);
});

test('CSV reader handles quoted comma, CRLF and UTF-8 BOM without guessing delimiters',()=>{
  const text='\uFEFF"x,y",Site,code\r\n"a""b",nuernber,c\r\n';
  const parsed=parseCsv(text);
  assert.deepEqual(parsed.headers,['x,y','Site','code']);
  assert.equal(parsed.rows[0][0].value,'a"b');
  assert.equal(parsed.rows[0][0].quoted,true);
  assert.equal(numberOrNull({value:'"80,5"',quoted:true},[]),null);
  near(numberOrNull({value:'80,5',quoted:true},[]),80.5);
  assert.equal(numberOrNull({value:'1,234',quoted:true},[]),null);
  assert.throws(()=>parseCsv('a,b\n"unterminated'),/Unterminated/);
  assert.throws(()=>parseCsv('a,a\n1,2\n'),/duplicate/);
  assert.throws(()=>parseCsv('a,b\n1,2,3\n'),/row width/);
  assert.throws(()=>parseCsv('a,b\n"one"x,2\n'),/Non-delimiter/);
});

test('synthetic golden cases produce independently checked error metrics',()=>{
  const result=analyze();
  assert.equal(result.evidenceType,'synthetic-engineering-only');
  assert.equal(result.empiricalValidation,'not-applicable-synthetic');
  assert.equal(result.endpoint,'RMR/REE');
  assert.deepEqual(result.cohortFlow.excludedByFirstReason,{sex:0,age:1,height:0,weight:0,reference:1});
  assert.equal(result.cohortFlow.rawRows,5);
  assert.equal(result.cohortFlow.eligible,3);
  assert.equal(result.cohortFlow.pairedEligible,2);
  assert.equal(result.cohortFlow.pairedExcludedForFfm,1);
  near(result.primary.summary.mae,210);
  near(result.primary.summary.bias,430/3);
  near(result.primary.summary.rmse,Math.sqrt(290900/3));
  near(result.primary.summary.medianAbsError,100);
  near(result.primary.summary.within10Percent,200/3);
  near(result.paired.mifflin.mae,50);
  near(result.paired.cunningham.mae,70.5);
  near(result.paired.cunninghamMinusMifflinMae,20.5);
  assert.equal(result.sourceSha256,'synthetic-fixture-not-real-source');
});

test('bootstrap is repeatable, stratified, bounded and paired on identical participants',()=>{
  const result=analyze();
  const again=analyze();
  assert.deepEqual(result.primary.ci95,again.primary.ci95);
  assert.deepEqual(result.paired.ci95,again.paired.ci95);
  for (const ci of Object.values(result.primary.ci95)){
    assert.ok(ci.lower<=ci.upper);
    assert.ok(Number.isFinite(ci.lower) && Number.isFinite(ci.upper));
  }
  assert.ok(result.paired.ci95.pairedMaeDelta);
  assert.ok(result.paired.ci95.pairedMaeDelta.lower<=20.5);
  assert.ok(result.paired.ci95.pairedMaeDelta.upper>=20.5);
  assert.equal(result.prng,'mulberry32-v1');
});

test('subgroups with too few people suppress error metrics but report counts',()=>{
  const result=analyze();
  for (const groups of Object.values(result.subgroups)){
    for(const group of Object.values(groups)){
      assert.equal(group.metrics,null);
      assert.equal(group.ci95,null);
      assert.equal(group.status,'suppressed-small-n');
    }
  }
  assert.equal(result.age19To78Sensitivity.n,3);
  assert.equal(result.age19To78Sensitivity.metrics,null);
});

test('entire run aborts on duplicate/missing coded IDs or invalid header and never prints records',()=>{
  const duplicate=fixture.replace('SYN-003','SYN-001');
  assert.throws(()=>analyze(duplicate),/duplicate participant/);
  const missingId=fixture.replace('SYN-003,freising',',freising');
  assert.throws(()=>analyze(missingId),/Missing or duplicate/);
  assert.throws(()=>analyze(fixture.replace('RMR.KJ','BMR.KJ')),/column missing/);
  const result=JSON.stringify(analyze());
  assert.ok(!result.includes('SYN-001'));
  assert.ok(!result.includes('SYN-002'));
  assert.ok(!result.includes('7316'));
});

test('eligibility excludes out-of-domain records without outcome-dependent trimming',()=>{
  const withBadSex=fixture.replace('SYN-002,nuernber,weiblich','SYN-002,nuernber,unmapped');
  const r=analyze(withBadSex);
  assert.equal(r.cohortFlow.excludedByFirstReason.sex,1);
  assert.equal(r.cohortFlow.eligible,2);
  const withLowAge=fixture.replace('SYN-003,freising,männlich,40','SYN-003,freising,männlich,17');
  assert.equal(analyze(withLowAge).cohortFlow.excludedByFirstReason.age,2);
  const withNegative=fixture.replace('SYN-003,freising,männlich,40,180,90','SYN-003,freising,männlich,40,180,-90');
  assert.equal(analyze(withNegative).cohortFlow.excludedByFirstReason.weight,1);
  const withUnreliableFfm=fixture.replace('SYN-001,freising,männlich,30,175,80,7316.77,60','SYN-001,freising,männlich,30,175,80,7316.77,100');
  assert.equal(analyze(withUnreliableFfm).cohortFlow.pairedEligible,1);
});

test('synthetic CLI is offline, JSON-only; real-data path is blocked without G3 controls',()=>{
  const cmd=replay.command;
  const ok=spawnSync(process.execPath,[cmd,'--synthetic'],{encoding:'utf8'});
  assert.equal(ok.status,0,ok.stderr);
  const d=JSON.parse(ok.stdout);
  assert.equal(d.evidenceType,'synthetic-engineering-only');
  const pretty=spawnSync(process.execPath,[cmd,'--synthetic','--format','markdown'],{encoding:'utf8'});
  assert.equal(pretty.status,0,pretty.stderr);
  assert.match(pretty.stdout,/SYNTHETIC TEST ONLY/);
  assert.match(pretty.stdout,/Eligible observations/);
  assert.match(pretty.stdout,/210.0 kcal\/day/);
  assert.ok(!pretty.stdout.includes('SYN-001'));
  const denied=spawnSync(process.execPath,[cmd,'--file',fixturePath.pathname],{encoding:'utf8'});
  assert.equal(denied.status,2);
  assert.equal(JSON.parse(denied.stderr).status,'blocked');
  assert.equal(denied.stderr.includes('SYN-'),false);
  const invalidHash=spawnSync(process.execPath,[cmd,'--file',fixturePath.pathname,'--execute-g3','--g1-commit',G1_COMMIT],{encoding:'utf8'});
  assert.equal(invalidHash.status,2);
  assert.equal(JSON.parse(invalidHash.stderr).errorType,'verification-or-eligibility-failure');
});

test('bootstrap preserves fixed site contributions instead of pooling independent records',async()=>{
  const {bootstrap}=frozen;
  const a={site:'freising',measured:1000,mifflin:900,cunningham:930};
  const b={site:'nuernber',measured:1000,mifflin:1300,cunningham:1150};
  const fixed=bootstrap([a,b],{replicates:300,seed:6,paired:true});
  // Exactly one observation per site means every within-site resample is
  // identical to the original, and all interval endpoints collapse.
  assert.equal(fixed.mae.lower,200);
  assert.equal(fixed.mae.upper,200);
  assert.equal(fixed.pairedMaeDelta.lower,-90);
  assert.equal(fixed.pairedMaeDelta.upper,-90);
});
