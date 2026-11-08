import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {auditProgram} from '../research/robustness/audit.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(root+p,'utf8'));
function fixture(){return [read('research/robustness/plan.json'),read('research/robustness/corpus.json')];}
const options={asOf:'2026-11-09',pathExists:p=>existsSync(root+p),h1:{inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')},h2a:{review:read('research/robustness/h2a/review.json'),registry:read('research/robustness/h2a/sources.json'),searchLog:read('research/robustness/h2a/search-log.json'),queue:read('research/robustness/h2-review-queue.json')},h2d:{review:read('research/robustness/h2d/review.json'),registry:read('research/robustness/h2d/sources.json'),searchLog:read('research/robustness/h2d/search-log.json'),queue:read('research/robustness/h2-review-queue.json')},h2e:{review:read('research/robustness/h2e/review.json'),registry:read('research/robustness/h2e/sources.json'),searchLog:read('research/robustness/h2e/search-log.json'),queue:read('research/robustness/h2-review-queue.json')},h2c:{review:read('research/robustness/h2c/review.json'),registry:read('research/robustness/h2c/sources.json'),searchLog:read('research/robustness/h2c/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2c/measurement-crosswalk.json')},h2b:{review:read('research/robustness/h2b/review.json'),registry:read('research/robustness/h2b/sources.json'),searchLog:read('research/robustness/h2b/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2b/equation-crosswalk.json')}};

test('durable corpus resolves locally while exposing unreviewed sources and open weaknesses',()=>{
 const [p,c]=fixture(), r=auditProgram(p,c,options);
 assert.deepEqual(r.errors,[]);assert.equal(r.valid,true);
 assert.ok(r.openWeaknesses.length>0);
 assert.ok(r.sourceReviews.some(s=>s.state==='unreviewed'));
 assert.equal(c.comprehensiveClinicalReviewCompleted,false);
 assert.ok(read('research/ree-validation/plan.json').phases.every(g=>g.state==='complete'));
});
test('missing references, unsafe paths and false gate closure fail',()=>{
 const [p,c]=fixture();c.claims[0].sources.push('invented-source');c.sources[0].path='../outside';
 const gate=p.gates.find(g=>g.id==='H4');gate.state='complete';gate.closure=null;p.gates.find(g=>g.id==='H3').state='in-progress';
 const r=auditProgram(p,c,options);
 assert.equal(r.valid,false);
 assert.ok(r.errors.some(e=>e.includes('invented-source')));
 assert.ok(r.errors.some(e=>e.includes('unsafe')));
 assert.ok(r.errors.some(e=>e.includes('closure lacks')));
 assert.ok(r.errors.some(e=>e.includes('before prerequisite')));
});
test('dependency cycles and unsupported completeness cannot pass',()=>{
 const [p,c]=fixture();p.gates[0].dependsOn=['H8'];c.comprehensiveClinicalReviewCompleted=true;
 const r=auditProgram(p,c,options);
 assert.ok(r.errors.some(e=>e.includes('cycle')));
 assert.ok(r.errors.some(e=>e.includes('unreviewed contexts')));
});
test('whole uncertainty gate cannot close while a required evaluation track remains open',()=>{
 const [p,c]=fixture();const gate=p.gates.find(g=>g.id==='H6');gate.state='complete';p.gates.find(g=>g.id==='H4').state='in-progress';p.gates.find(g=>g.id==='H5').state='in-progress';
 const r=auditProgram(p,c,options);
 assert.ok(r.errors.some(e=>e.includes('energy prerequisite H4')));
 assert.ok(r.errors.some(e=>e.includes('readiness prerequisite H5')));
});
test('freshness becomes due at the policy boundary and never becomes scientific validation',()=>{
 const [p,c]=fixture(),s=c.sources[0];s.sourceContentReviewedAt='2026-10-10';s.reviewScope='Synthetic review fixture';s.freshnessClass='provider-or-access';
 const r=auditProgram(p,c,options);assert.equal(r.sourceReviews[0].state,'due');assert.equal(r.sourceReviews[0].ageDays,30);
 assert.equal(r.valid,true);assert.ok(r.warnings.some(w=>w.includes('due')));
 assert.equal(c.claims.find(x=>x.id==='C03').empiricalValidation,'none');
 s.sourceContentReviewedAt='2026-10-11';assert.equal(auditProgram(p,c,options).sourceReviews[0].state,'within-policy-window');
});
test('future, malformed and impossible review dates fail instead of claiming freshness',()=>{
 for(const value of ['2026-11-10','2026-02-30','not-a-date']){
  const [p,c]=fixture();c.sources[0].sourceContentReviewedAt=value;c.sources[0].reviewScope='Fixture';
  assert.equal(auditProgram(p,c,options).valid,false,value);
 }
 const [p,c]=fixture();assert.equal(auditProgram(p,c,{...options,asOf:'2026-02-30'}).valid,false);
});
