import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {assessFreshness,assessSourceFreshness} from '../research/robustness/freshness.mjs';
import {lookupClaim} from '../research/robustness/inspect.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const fixture=()=>({corpus:read('research/robustness/corpus.json'),matrix:read('research/robustness/applicability.json'),plan:read('research/robustness/plan.json'),reviews:'abcde'.split('').map(l=>read(`research/robustness/h2${l}/review.json`))});
const policy={sourceReviewWindowsDays:{provider:30}};
const source={id:'synthetic',freshnessClass:'provider',sourceContentReviewedAt:'2026-11-09',reviewScope:'Synthetic fixture'};
test('one source-age rule reaches due exactly at the policy boundary',()=>{
  assert.equal(assessSourceFreshness(source,policy,'2026-12-08').state,'within-policy-window');
  const due=assessSourceFreshness(source,policy,'2026-12-09');assert.equal(due.state,'due');assert.equal(due.ageDays,30);assert.equal(due.nextReviewBy,'2026-12-09');
  assert.equal(assessSourceFreshness({...source,sourceContentReviewedAt:null},policy,'2026-12-09').state,'unreviewed');
  for(const date of ['2026-02-30','yesterday','2026-11-08'])assert.throws(()=>assessSourceFreshness(source,policy,date));
});
test('a claim reports source and bounded-review deadlines without refreshing history',()=>{
  const f=fixture(),before=JSON.stringify(f);
  const r=lookupClaim(f.corpus,f.matrix,{claimId:'C30',contextId:'general-adult',...f,asOf:'2026-12-09'});
  assert.equal(r.freshness.state,'review-due');assert.equal(r.freshness.asOf,'2026-12-09');
  assert.ok(r.freshness.reasons.dueSources.includes('h2c-apple-auth'));
  assert.ok(r.freshness.reasons.dueReviews.includes('H2-C'));
  assert.equal(r.contexts[0].evidenceStatus,'not-a-population-performance-claim');assert.equal(r.claim.empiricalValidation,'none');
  assert.equal(JSON.stringify(f),before);
});
test('context without a bounded review cannot inherit general-adult review completion',()=>{
  const f=fixture();const r=lookupClaim(f.corpus,f.matrix,{claimId:'C15',contextId:'renal-fluid',...f,asOf:'2026-11-10'});
  assert.equal(r.contexts[0].freshness.state,'unreviewed');assert.equal(r.contexts[0].freshness.reasons.missingBoundedReview,true);
  assert.deepEqual(r.contexts[0].evidenceReviews,[]);assert.equal(r.contexts[0].evidenceStatus,'unreviewed');
  const all=lookupClaim(f.corpus,f.matrix,{claimId:'C15',...f,asOf:'2026-11-10'});
  assert.equal(all.freshness.state,'unreviewed');assert.ok(all.freshness.reasons.unreviewedContexts.includes('renal-fluid'));
});
test('undated lookup stays explicitly not assessed; missing review details stay unknown',()=>{
  const f=fixture();
  assert.equal(lookupClaim(f.corpus,f.matrix,{claimId:'C30',...f}).freshness.state,'not-assessed');
  const r=lookupClaim(f.corpus,f.matrix,{claimId:'C30',contextId:'general-adult',plan:f.plan,asOf:'2026-11-10'});
  assert.ok(r.freshness.reasons.missingReviews.includes('H2-C'));assert.equal(r.freshness.state,'unreviewed');
});
test('review deadlines, unreviewed sources and source age remain separate reasons',()=>{
  const review={id:'bounded',reviewedAt:'2026-11-09',nextReviewBy:'2026-11-10'};
  const r=assessFreshness({sources:[source,{...source,id:'unknown',sourceContentReviewedAt:null}],reviews:[review],policy,asOf:'2026-11-10'});
  assert.equal(r.state,'review-due');assert.deepEqual(r.reasons.dueSources,[]);assert.deepEqual(r.reasons.dueReviews,['bounded']);assert.deepEqual(r.reasons.unreviewedSources,['unknown']);
  assert.equal(assessFreshness({asOf:'2026-11-10'}).state,'unreviewed');
  assert.throws(()=>assessFreshness({reviews:[{...review,reviewedAt:'2026-11-11'}],asOf:'2026-11-10'}));
});
test('CLI exposes dated and snapshot modes and rejects ambiguous date arguments',()=>{
  const run=args=>spawnSync(process.execPath,['research/robustness/inspect.mjs',...args],{encoding:'utf8',cwd:new URL('..',import.meta.url)});
  const dated=run(['--as-of','2026-12-10','--claim','C30','--context','general-adult']);
  assert.equal(dated.status,0,dated.stderr);assert.equal(JSON.parse(dated.stdout).freshness.state,'review-due');
  const snapshot=run([]);assert.equal(snapshot.status,0);assert.equal(JSON.parse(snapshot.stdout).freshness.state,'not-assessed');
  for(const args of [['--as-of','2026-02-30'],['--as-of'],['--as-of','2026-11-10','--as-of','2026-11-11'],['--context','general-adult']]) {
    const r=run(args);assert.equal(r.status,1);assert.equal(r.stdout,'');assert.equal(typeof JSON.parse(r.stderr).error,'string');
  }
});
