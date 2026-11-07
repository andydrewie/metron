import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditH1} from './h1-audit.mjs';
import {auditH2A} from './h2a/audit.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
export function lookupClaim(corpus,matrix,{claimId,contextId,review}={}) {
  const claim=corpus.claims.find(x=>x.id===claimId);
  if(!claim) throw new Error('Unknown claim ID: '+claimId);
  if(contextId && !corpus.contexts.some(x=>x.id===contextId)) throw new Error('Unknown context ID: '+contextId);
  const cells=matrix.rows.find(x=>x.claimId===claimId)?.cells;
  if(!cells) throw new Error('Missing matrix row: '+claimId);
  const contexts=(contextId ? corpus.contexts.filter(x=>x.id===contextId) : corpus.contexts).map(context=>{
    const status=matrix.legend[cells[context.id]];
    if(!status) throw new Error('Missing matrix disposition: '+context.id);
    const evidenceReviews=(matrix.reviewOverlays ?? []).filter(x=>x.claimId===claimId&&x.contextId===context.id).map(overlay=>({
      ...overlay,details:review?.reviewId===overlay.reviewId ? review.claimReviews.find(x=>x.claimId===claimId) : null
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
    errors.push(...auditH2A(corpus,artifacts.matrix,plan,h2a,h2a.review.asOf));
    if(errors.length) throw new Error(errors.join('; '));
    const args=process.argv.slice(2);
    let result;
    if(!args.length) result={coverage:{claimFamilies:artifacts.inventory.claimFamilyCount,surfaces:artifacts.inventory.surfaceCount,contexts:artifacts.matrix.contextCount,cells:artifacts.matrix.cellCount},boundedReviews:[{id:h2a.review.reviewId,status:h2a.review.status,asOf:h2a.review.asOf,nextReviewBy:h2a.review.nextReviewBy}],nextTask:plan.nextTask,continuation:'docs/CONTINUE.md',clinicalReviewComplete:false,meaning:'Lookup reports recorded scope and dates; use audit.mjs with today’s date for review-age checks.'};
    else if((args.length===2 || args.length===4) && args[0]==='--claim' && (args.length===2 || args[2]==='--context')) result=lookupClaim(corpus,artifacts.matrix,{claimId:args[1],contextId:args[3],review:h2a.review});
    else throw new Error('Usage: node research/robustness/inspect.mjs [--claim C15 [--context renal-fluid]]');
    console.log(JSON.stringify(result,null,2));
  }catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
}
