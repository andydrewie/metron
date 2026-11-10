import {readFileSync} from 'node:fs';
import {randomInt} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
export function participantPacket(tasks,condition) {
  if(!['H','R'].includes(condition))throw new TypeError('Choose H or R');
  return '# Metron review session\n\nWe are testing the communication, not you. Use only the fictional profiles. Please explain your interpretation and choices; no exercise or diet action is requested.\n\n'+tasks.map(t=>[
    `## ${t.title}`,t.scenario,...(t.wording[condition]??t.wording.common),...t.questions.map((q,i)=>`${i+1}. ${q}`)
  ].join('\n\n')).join('\n\n---\n\n')+'\n';
}
export function allocate(strata,choose=randomInt) {
  return strata.map(s=>{
    if(!Number.isSafeInteger(s.target)||s.target<4||s.target%4)throw new TypeError('Quota must contain whole blocks');
    const assignments=[];
    for(let b=0;b<s.target/4;b++) {
      const block=['H','H','R','R'];
      for(let i=3;i>0;i--){const j=choose(i+1);if(!Number.isInteger(j)||j<0||j>i)throw new TypeError('Invalid allocation draw');[block[i],block[j]]=[block[j],block[i]];}
      assignments.push(...block);
    }
    return {stratum:s.id,assignments};
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    if(args.length===2&&args[0]==='--condition')process.stdout.write(participantPacket(read('tasks.json').tasks,args[1]));
    else if(args.length===1&&args[0]==='--allocation')console.log(JSON.stringify({purpose:'private concealed allocation; not enrollment or outcomes',allocations:allocate(read('evaluation-plan.json').comprehension.sample.quotaStrata)},null,2));
    else throw new TypeError('Usage: packet.mjs --condition H|R OR --allocation');
  }catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
}
