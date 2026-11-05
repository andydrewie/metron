import { mkdir, cp, rm, writeFile } from 'node:fs/promises';
const to = 'dist'; await rm(to,{recursive:true,force:true}); await mkdir(`${to}/core`,{recursive:true});
for (const asset of ['index.html','styles.css','app.js','favicon.svg','og.svg','og.png']) await cp(asset,`${to}/${asset}`);
await mkdir(`${to}/design`,{recursive:true});
await cp('design/tokens.css',`${to}/design/tokens.css`);
await cp('core/model.js',`${to}/core/model.js`);
await writeFile(`${to}/.nojekyll`,'');
console.log('Built dependency-free static site in dist/');
