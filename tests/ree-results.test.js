import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const root=new URL('../',import.meta.url);
const bytes=path=>readFileSync(new URL(path,root));
const read=path=>JSON.parse(bytes(path));
const base='research/ree-validation/';
const result=read(base+'results/g3-enable-v1.json');
const run=read(base+'results/G3_RUN.json');
const audit=read(base+'results/g3-audit-v1.json');
const lock=read(base+'protocol.lock.json');

test('published G3 aggregates retain source identity, complete flow and audit integrity',()=>{
  assert.equal(result.evidenceType,'measured-RMR-dataset-analysis');
  assert.equal(result.sourceSha256,lock.sourceDataSha256);
  assert.equal(result.provenance.protocolGitBlobSha,lock.protocolGitBlobSha);
  assert.equal(result.provenance.modelGitBlobSha,lock.modelGitBlobSha);
  const digest=createHash('sha256').update(bytes(base+'results/g3-enable-v1.json')).digest('hex');
  assert.equal(digest,run.reportSha256);
  assert.equal(digest,audit.reportSha256);
  assert.equal(audit.status,'passed');
  const flow=result.cohortFlow;
  assert.equal(flow.rawRows,flow.eligible+Object.values(flow.excludedByFirstReason).reduce((a,b)=>a+b,0));
  assert.equal(flow.eligible,flow.pairedEligible+flow.pairedExcludedForFfm);
  assert.equal(flow.eligible,result.primary.summary.n);
  assert.equal(flow.pairedEligible,result.paired.mifflin.n);
  assert.equal(flow.pairedEligible,result.paired.cunningham.n);
  assert.equal(run.productionModelChanged,false);
  assert.equal(result.provenance.personalizedUncertainty,false);
  assert.equal(result.provenance.modelReestimated,false);
});

test('published report has no record arrays or arbitrary participant strings; sparse groups stay suppressed',()=>{
  const allowed=new Set([
    '1.0.0','RMR-EXT-001','RMR-EXT-001-G1-v1','mulberry32-v1','measured-RMR-dataset-analysis',
    'single-source-reanalysis','RMR/REE','kcal/day','0.1.0','exploratory','suppressed-small-n',
    lock.sourceDataSha256,lock.protocolGitBlobSha,lock.modelGitBlobSha,
    '6028a80fb7070b354dec68feeb7153ce0a4cbef9','v1','10.5281/zenodo.17735477',
    'Cohort-level resting-rate error only; never a TDEE or individual prediction interval.'
  ]);
  const inspect=value=>{
    assert.ok(!Array.isArray(value),'participant/measurement arrays must never enter published results');
    if(typeof value==='string')assert.ok(allowed.has(value),'unexpected free text in aggregate output');
    if(value&&typeof value==='object')Object.values(value).forEach(inspect);
  };
  inspect(result);
  for(const groups of Object.values(result.subgroups)){
    assert.equal(Object.values(groups).reduce((n,g)=>n+g.n,0),result.cohortFlow.eligible);
    for(const g of Object.values(groups))if(g.n<30){
      assert.equal(g.metrics,null);assert.equal(g.ci95,null);
    }
  }
});

test('independent auditor rejects unadmitted input without echoing file content or paths',()=>{
  const task=spawnSync('python3',[
    'research/ree-validation/tools/audit_g3.py',
    '--file','research/ree-validation/fixtures/synthetic-rmr.csv',
    '--report','research/ree-validation/results/g3-enable-v1.json'
  ],{cwd:root,encoding:'utf8'});
  assert.equal(task.status,2);
  assert.equal(task.stdout,'');
  assert.deepEqual(JSON.parse(task.stderr),{
    status:'failed',error:'aggregate-audit-verification-failure',noRowsExported:true
  });
});
