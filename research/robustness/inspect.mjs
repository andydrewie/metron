import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditH1} from './h1-audit.mjs';
import {auditProgram} from './audit.mjs';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
export function lookupClaim(corpus,matrix,{claimId,contextId,review,reviews=[]}={}) {
  const claim=corpus.claims.find(x=>x.id===claimId);
  if(!claim) throw new Error('Unknown claim ID: '+claimId);
  if(contextId && !corpus.contexts.some(x=>x.id===contextId)) throw new Error('Unknown context ID: '+contextId);
  const cells=matrix.rows.find(x=>x.claimId===claimId)?.cells;
  if(!cells) throw new Error('Missing matrix row: '+claimId);
  const contexts=(contextId ? corpus.contexts.filter(x=>x.id===contextId) : corpus.contexts).map(context=>{
    const status=matrix.legend[cells[context.id]];
    if(!status) throw new Error('Missing matrix disposition: '+context.id);
    const evidenceReviews=(matrix.reviewOverlays ?? []).filter(x=>x.claimId===claimId&&x.contextId===context.id).map(overlay=>({
      ...overlay,details:[...reviews,review].find(x=>x?.reviewId===overlay.reviewId)?.claimReviews.find(x=>x.claimId===claimId) ?? null
    }));
    return {context,...status,evidenceReviews};
  });
  return {claim,sources:corpus.sources.filter(s=>claim.sources.includes(s.id)),contexts,reviewLayerMeaning:matrix.reviewLayers ?? null,meaning:'Inventory and documented boundaries only; not clinical advice or evidence of safety.'};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {
    const corpus=read('research/robustness/corpus.json');
    const artifacts={inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')};
    const errors=auditH1(corpus,artifacts,path=>existsSync(resolve(root,path)));
    const plan=read('research/robustness/plan.json');
    const h2a={review:read('research/robustness/h2a/review.json'),registry:read('research/robustness/h2a/sources.json'),searchLog:read('research/robustness/h2a/search-log.json'),queue:read('research/robustness/h2-review-queue.json')};
    const h2b={review:read('research/robustness/h2b/review.json'),registry:read('research/robustness/h2b/sources.json'),searchLog:read('research/robustness/h2b/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2b/equation-crosswalk.json')};
    const h2c={review:read('research/robustness/h2c/review.json'),registry:read('research/robustness/h2c/sources.json'),searchLog:read('research/robustness/h2c/search-log.json'),queue:read('research/robustness/h2-review-queue.json'),crosswalk:read('research/robustness/h2c/measurement-crosswalk.json')};
    const reviews=[h2a.review,h2b.review,h2c.review];
    errors.push(...auditProgram(plan,corpus,{asOf:plan.asOf,pathExists:p=>existsSync(resolve(root,p)),h1:artifacts,h2a,h2b,h2c,fileDigest:p=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')}).errors);
    if(errors.length) throw new Error(errors.join('; '));
    const args=process.argv.slice(2);
    let result;
    if(!args.length) result={coverage:{claimFamilies:artifacts.inventory.claimFamilyCount,surfaces:artifacts.inventory.surfaceCount,contexts:artifacts.matrix.contextCount,cells:artifacts.matrix.cellCount},boundedReviews:reviews.map(r=>({id:r.reviewId,status:r.status,asOf:r.asOf,nextReviewBy:r.nextReviewBy})),nextTask:plan.nextTask,continuation:'docs/CONTINUE.md',clinicalReviewComplete:false,meaning:'Lookup reports recorded scope and dates; use audit.mjs with today’s date for review-age checks.'};
    else if((args.length===2 || args.length===4) && args[0]==='--claim' && (args.length===2 || args[2]==='--context')) result=lookupClaim(corpus,artifacts.matrix,{claimId:args[1],contextId:args[3],reviews});
    else throw new Error('Usage: node research/robustness/inspect.mjs [--claim C15 [--context renal-fluid]]');
    console.log(JSON.stringify(result,null,2));
  }catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
}
