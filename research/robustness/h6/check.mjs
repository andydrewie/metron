import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {planningCalculations} from './analysis.mjs';
const directory=new URL('./',import.meta.url);
export function checkProtocol({plan,tasks,lock,run},readBytes) {
  const errors=[];
  if([tasks,lock,run].some(x=>x.protocolId!==plan.protocolId||x.protocolVersion!==plan.protocolVersion))errors.push('Protocol identity/version mismatch');
  if(plan.status!=='prepared-not-run'||plan.comprehension.status!=='not-run'||plan.comprehension.participantsEnrolled!==0||plan.comprehension.observationsCollected!==0||plan.automaticGateClosure!==false)errors.push('Prepared protocol must not claim observations or gate closure');
  if(!run.templateOnly||run.actualStudyRun!==false||run.observationsCollected!==0||run.participantsRandomized!==0)errors.push('Run template must remain unfilled and unrun');
  const c=plan.comprehension,s=c.sample;
  if(s.targetRandomized!==40||s.perArm!==20||s.quotaStrata.reduce((n,x)=>n+x.target,0)!==40||s.quotaStrata.some(x=>x.target%4))errors.push('Frozen pilot sample/quota mismatch');
  if(tasks.tasks.map(t=>t.id).join(',')!==c.taskOrder.join(',')||c.taskOrder.join(',')!=='T1,T2,T5,T3,T4')errors.push('Primary tasks must precede common diagnostics');
  for(const t of tasks.tasks) {
    if(!t.rubric?.critical||!t.questions?.length||!t.claims?.length)errors.push('Incomplete task/rubric');
    if(t.kind==='primary'&&(!t.wording.H?.length||!t.wording.R?.length||!t.rubric.decision2))errors.push('Incomplete comparison task');
    if(t.kind==='diagnostic'&&!t.wording.common?.length)errors.push('Diagnostic must be shared');
  }
  const required=['evaluation-plan.json','tasks.json','PROTOCOL.md','run-template.json','analysis.mjs','packet.mjs'];
  for(const file of required) {
    if(!Object.hasOwn(lock.sha256,file))errors.push('Missing frozen artifact');
    else try {if(createHash('sha256').update(readBytes(file)).digest('hex')!==lock.sha256[file])errors.push('Frozen artifact changed: '+file);}catch{errors.push('Frozen artifact unavailable: '+file);}
  }
  if(JSON.stringify(lock.sourcePins)!==JSON.stringify(c.sourcePins))errors.push('Source pins differ');
  return {valid:!errors.length,errors,protocolId:plan.protocolId,protocolVersion:plan.protocolVersion,
    protocolPreparation:'specified',actualHumanReviewRecorded:c.operations.actualHumanReviewRecorded,
    recruitmentPerformed:c.operations.recruitmentPerformed,observationsCollected:c.observationsCollected,
    readyToCollect:false,remaining:['Independent human methods/accessibility review','Named study operation and completed private run manifest','Consenting actual participants'],automaticGateClosure:false,
    planningCalculations:planningCalculations(s.perArm)};
}
export function inspectProtocol() {
  const read=p=>JSON.parse(readFileSync(new URL(p,directory),'utf8'));
  return checkProtocol({plan:read('evaluation-plan.json'),tasks:read('tasks.json'),lock:read('protocol-lock.json'),run:read('run-template.json')},p=>readFileSync(new URL(p,directory)));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {if(process.argv.length!==2)throw new Error('Usage: check.mjs');const report=inspectProtocol();console.log(JSON.stringify(report,null,2));if(!report.valid)process.exitCode=1;}
  catch {console.error(JSON.stringify({error:'Protocol inspection failed'}));process.exitCode=1;}
}
