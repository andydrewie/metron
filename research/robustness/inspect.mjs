import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditH1} from './h1-audit.mjs';
import {auditProgram} from './audit.mjs';
import {createHash} from 'node:crypto';
import {assessFreshness} from './freshness.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
export function lookupClaim(corpus,matrix,{claimId,contextId,review,reviews=[],plan,asOf}={}) {
  const claim=corpus.claims.find(x=>x.id===claimId);
  if(!claim) throw new Error('Unknown claim ID: '+claimId);
  if(contextId && !corpus.contexts.some(x=>x.id===contextId)) throw new Error('Unknown context ID: '+contextId);
  const cells=matrix.rows.find(x=>x.claimId===claimId)?.cells;
  if(!cells) throw new Error('Missing matrix row: '+claimId);
  const sources=corpus.sources.filter(s=>claim.sources.includes(s.id));
  if(sources.length!==new Set(claim.sources).size)throw new Error('Claim source records are missing');
  const freshnessFor=(entries,unreviewedContexts=[])=>assessFreshness({sources,policy:plan?.freshnessPolicy,asOf,requireReview:true,unreviewedContexts,
    reviews:[...new Map(entries.filter(e=>e.details).map(e=>[e.reviewId,{id:e.reviewId,reviewedAt:e.details.reviewedAt,nextReviewBy:e.details.nextReviewBy}])).values()],
    missingReviews:[...new Set(entries.filter(e=>!e.details).map(e=>e.reviewId))]});
  const contexts=(contextId ? corpus.contexts.filter(x=>x.id===contextId) : corpus.contexts).map(context=>{
    const status=matrix.legend[cells[context.id]];
    if(!status) throw new Error('Missing matrix disposition: '+context.id);
    const evidenceReviews=(matrix.reviewOverlays ?? []).filter(x=>x.claimId===claimId&&x.contextId===context.id).map(overlay=>({
      ...overlay,details:[...reviews,review].find(x=>x?.reviewId===overlay.reviewId)?.claimReviews.find(x=>x.claimId===claimId) ?? null
    }));
    return {context,...status,evidenceReviews,freshness:freshnessFor(evidenceReviews)};
  });
  return {claim,sources,contexts,freshness:freshnessFor(contexts.flatMap(c=>c.evidenceReviews),contexts.filter(c=>!c.evidenceReviews.length).map(c=>c.context.id)),reviewLayerMeaning:matrix.reviewLayers ?? null,meaning:'Inventory and documented boundaries only; not clinical advice or evidence of safety.'};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {
    const args=process.argv.slice(2),options={};
    for(let i=0;i<args.length;i+=2) {
      const key=args[i],value=args[i+1];
      if(!['--claim','--context','--as-of'].includes(key)||!value||value.startsWith('--')||Object.hasOwn(options,key))throw new Error('Usage: inspect.mjs [--claim C15 [--context renal-fluid]] [--as-of YYYY-MM-DD]');
      options[key]=value;
    }
    if(options['--context']&&!options['--claim'])throw new Error('--context requires --claim');
    const asOf=options['--as-of'];
    const corpus=read('research/robustness/corpus.json');
    const artifacts={inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')};
    const errors=auditH1(corpus,artifacts,path=>existsSync(resolve(root,path)));
    const plan=read('research/robustness/plan.json');
    const h2a={review:read('research/robustness/h2a/review.json'),registry:read('research/robustness/h2a/sources.json'),searchLog:read('research/robustness/h2a/search-log.json'),queue:read('research/robustness/h2-review-queue.json')};
    const h2b={review:read('research/robustness/h2b/review.json'),registry:read('research/robustness/h2b/sources.json'),searchLog:read('research/robustness/h2b/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2b/equation-crosswalk.json')};
    const h2c={review:read('research/robustness/h2c/review.json'),registry:read('research/robustness/h2c/sources.json'),searchLog:read('research/robustness/h2c/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2c/measurement-crosswalk.json')};
    const h2d={review:read('research/robustness/h2d/review.json'),registry:read('research/robustness/h2d/sources.json'),searchLog:read('research/robustness/h2d/search-log.json'),queue:read('research/robustness/h2-review-queue.json')};
    const h2e={review:read('research/robustness/h2e/review.json'),registry:read('research/robustness/h2e/sources.json'),searchLog:read('research/robustness/h2e/search-log.json'),queue:read('research/robustness/h2-review-queue.json')};
    const reviews=[h2a.review,h2b.review,h2c.review,h2d.review,h2e.review];
    errors.push(...auditProgram(plan,corpus,{asOf:asOf??plan.asOf,pathExists:p=>existsSync(resolve(root,p)),h1:artifacts,h2a,h2b,h2c,h2d,h2e,fileDigest:p=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')}).errors);
    if(errors.length) throw new Error(errors.join('; '));
    let result;
    if(!options['--claim']) result={coverage:{claimFamilies:artifacts.inventory.claimFamilyCount,surfaces:artifacts.inventory.surfaceCount,contexts:artifacts.matrix.contextCount,cells:artifacts.matrix.cellCount},boundedReviews:reviews.map(r=>({id:r.reviewId,status:r.status,asOf:r.asOf,nextReviewBy:r.nextReviewBy})),freshness:assessFreshness({sources:corpus.sources,reviews:reviews.map(r=>({id:r.reviewId,reviewedAt:r.asOf,nextReviewBy:r.nextReviewBy})),policy:plan.freshnessPolicy,asOf}),nextTask:plan.nextTask,continuation:'docs/CONTINUE.md',clinicalReviewComplete:false,meaning:'Recorded completion and assessment-date freshness are separate. No automatic review or clinical promotion.'};
    else result=lookupClaim(corpus,artifacts.matrix,{claimId:options['--claim'],contextId:options['--context'],reviews,plan,asOf});
    console.log(JSON.stringify(result,null,2));
  }catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
}
