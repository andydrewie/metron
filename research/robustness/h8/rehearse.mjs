/** Scripted navigation/maintenance rehearsal; does not impersonate a fresh agent. */
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {auditProgram} from '../audit.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const read=p=>JSON.parse(readFileSync(root+p,'utf8'));
const plan=read('research/robustness/plan.json'),corpus=read('research/robustness/corpus.json');
const records=l=>({review:read(`research/robustness/h2${l}/review.json`),registry:read(`research/robustness/h2${l}/sources.json`),searchLog:read(`research/robustness/h2${l}/search-log.json`),queue:read('research/robustness/h2-review-queue.json'),...(l==='b'?{crosswalk:read('research/robustness/h2b/equation-crosswalk.json')}:l==='c'?{crosswalk:read('research/robustness/h2c/measurement-crosswalk.json')}:{})});
const options={asOf:plan.asOf,pathExists:p=>existsSync(root+p),fileDigest:p=>createHash('sha256').update(readFileSync(root+p)).digest('hex'),h1:{inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')},...Object.fromEntries('abcde'.split('').map(l=>['h2'+l,records(l)]))};
const baseline=auditProgram(plan,corpus,options);if(!baseline.valid)throw new Error(baseline.errors.join('; '));
const stale=auditProgram(plan,corpus,{...options,asOf:'2027-11-10'});
const changed=structuredClone(corpus);changed.sources.find(s=>s.id==='h2d-nist-prediction').url='https://example.invalid/source-changed';
const update=auditProgram(plan,changed,options);
const contradictory={...options,h2d:structuredClone(options.h2d)};contradictory.h2d.review.contradictions[0].resolution='';
const contradiction=auditProgram(plan,corpus,contradictory);
const decisions=read('docs/adr/index.json').entries;
function invalidSuccessor(entries){return entries.some(e=>e.status==='Superseded'&&(!e.supersededBy||!entries.some(x=>x.id===e.supersededBy)));}
const fictitious=structuredClone(decisions);fictitious[0].status='Superseded';fictitious[0].supersededBy='ADR-9999';
if(!stale.warnings.some(w=>w.includes('due'))||update.valid||contradiction.valid||!invalidSuccessor(fictitious))throw new Error('Maintenance drill failed');
const nav=read('docs/navigation.json'),manifest=read('metron.manifest.json');
console.log(JSON.stringify({status:'passed',kind:'scripted-rehearsal-not-independent-cold-start',entrypoints:['docs/CONTINUE.md','AGENTS.md','docs/navigation.json','metron.manifest.json'],recovered:{resumeRoute:nav.routes.find(r=>r.id==='resume-work').entry,implemented:manifest.implemented,currentGate:plan.currentGate,nextTask:plan.nextTask,latestDecision:decisions.at(-1).id,tdeeEmpiricalValidation:corpus.claims.find(c=>c.id==='C03').empiricalValidation},drills:{staleReviewWarnings:stale.warnings.length,sourceVersionMismatchRejected:!update.valid,unadjudicatedContradictionRejected:!contradiction.valid,missingSupersessionSuccessorRejected:invalidSuccessor(fictitious)},automaticMonitoringEnabled:plan.freshnessPolicy.automaticMonitoringEnabled,independentAgentExercise:false},null,2));
