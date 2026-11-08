/** Replay the preserved study against its exact historical core, not today's API adapter. */
import {mkdtempSync,cpSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../../',import.meta.url));
export function frozenStudy() {
 const bytes=readFileSync(new URL('./frozen-core-0.1.0.js',import.meta.url));
 const lock=JSON.parse(readFileSync(join(root,'research/ree-validation/protocol.lock.json')));
 const hash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(hash!==lock.modelGitBlobSha)throw new Error('Historical core does not match study lock');
 const dir=mkdtempSync(join(tmpdir(),'metron-frozen-'));
 try {
  mkdirSync(join(dir,'core'));mkdirSync(join(dir,'research'));
  writeFileSync(join(dir,'core/model.js'),bytes);writeFileSync(join(dir,'package.json'),'{"type":"module"}\n');
  cpSync(join(root,'research/ree-validation'),join(dir,'research/ree-validation'),{recursive:true});
  return {root:dir,moduleUrl:pathToFileURL(join(dir,'research/ree-validation/benchmark.mjs')).href,command:join(dir,'research/ree-validation/run.mjs'),cleanup:()=>rmSync(dir,{recursive:true,force:true})};
 }catch(error){rmSync(dir,{recursive:true,force:true});throw error;}
}
