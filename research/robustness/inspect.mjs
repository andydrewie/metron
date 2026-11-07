import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditH1} from './h1-audit.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
export function lookupClaim(corpus,matrix,{claimId,contextId}={}) {
  const claim=corpus.claims.find(x=>x.id===claimId);
  if(!claim) throw new Error('Unknown claim ID: '+claimId);
  if(contextId && !corpus.contexts.some(x=>x.id===contextId)) throw new Error('Unknown context ID: '+contextId);
  const cells=matrix.rows.find(x=>x.claimId===claimId)?.cells;
  if(!cells) throw new Error('Missing matrix row: '+claimId);
  const contexts=(contextId ? corpus.contexts.filter(x=>x.id===contextId) : corpus.contexts).map(context=>{
    const status=matrix.legend[cells[context.id]];
    if(!status) throw new Error('Missing matrix disposition: '+context.id);
    return {context,...status};
  });
  return {claim,sources:corpus.sources.filter(s=>claim.sources.includes(s.id)),contexts,meaning:'Inventory and documented boundaries only; not clinical advice or evidence of safety.'};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {
    const corpus=read('research/robustness/corpus.json');
    const artifacts={inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')};
    const errors=auditH1(corpus,artifacts,path=>existsSync(resolve(root,path)));
    if(errors.length) throw new Error(errors.join('; '));
    const args=process.argv.slice(2);
    let result;
    if(!args.length) result={coverage:{claimFamilies:artifacts.inventory.claimFamilyCount,surfaces:artifacts.inventory.surfaceCount,contexts:artifacts.matrix.contextCount,cells:artifacts.matrix.cellCount},nextTask:read('research/robustness/plan.json').nextTask,continuation:'docs/CONTINUE.md',clinicalReviewComplete:false};
    else if((args.length===2 || args.length===4) && args[0]==='--claim' && (args.length===2 || args[2]==='--context')) result=lookupClaim(corpus,artifacts.matrix,{claimId:args[1],contextId:args[3]});
    else throw new Error('Usage: node research/robustness/inspect.mjs [--claim C15 [--context renal-fluid]]');
    console.log(JSON.stringify(result,null,2));
  }catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
}
