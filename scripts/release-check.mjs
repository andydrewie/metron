/** No-network preflight for a public GitHub Pages source release. */
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
const read = file => readFile(resolve(root,file),'utf8');
const exists = async file => (await stat(resolve(root,file))).isFile();
function check(condition,message){if(!condition)throw new Error('Release preflight: '+message);}
const [pkg,manifest,tokens,html,css,generated,pages,readme,agent]=await Promise.all([
  read('package.json').then(JSON.parse),read('metron.manifest.json').then(JSON.parse),
  read('design/tokens.json').then(JSON.parse),read('index.html'),read('styles.css'),
  read('design/tokens.css'),read('.github/workflows/pages.yml'),read('README.md'),read('AGENTS.md')]);
check(pkg.version===manifest.project.packageVersion,'package and manifest versions disagree');
check(typeof manifest.project.repositoryPublished==='boolean' && typeof manifest.project.pagesVerifiedLive==='boolean','publication flags must be explicit booleans');
check(!manifest.project.pagesVerifiedLive || manifest.project.repositoryPublished,'Pages cannot be marked live before repository publication');
check(manifest.project.maturity === (manifest.project.repositoryPublished ? 'public-exploratory-alpha' : 'pre-publication-exploratory'),'maturity must reflect declared publication state');
check(tokens.name==='Metron / Research Instrument','unexpected visual theme');
check(Object.keys(tokens.cssVariables).length>=30,'shared design tokens missing');
for(const [key,value] of Object.entries(tokens.cssVariables))check(generated.includes(`${key}: ${value};`),`generated CSS out of sync: ${key}`);
check(html.includes('href="design/tokens.css"')&&html.includes('href="styles.css"'),'website must use canonical generated tokens');
check(html.indexOf('design/tokens.css')<html.indexOf('styles.css'),'load token layer before components');
check(/var\(--foreground\)|var\(--ink\)/.test(css),'website not using design variables');
check(/actions\/upload-pages-artifact@v4/.test(pages)&&/actions\/deploy-pages@v4/.test(pages)&&/path: dist/.test(pages),'GitHub Pages workflow incomplete');
check(readme.includes('Two front doors')&&agent.includes('instructions for coding agents'),'missing dual-audience README/agent guidance');
check(readme.includes('Planned; not implemented')&&readme.includes('Software tests are not physiological validation'),'release may overclaim capabilities');
for(const [name,path] of Object.entries(manifest.entrypoints))check(await exists(path),`broken manifest entry ${name}: ${path}`);
for(const path of [
 'index.html','styles.css','app.js','og.png','og.svg','favicon.svg','design/tokens.css',
 'docs/assets/mobile.png','docs/assets/desktop.png','docs/assets/recovery.png','docs/assets/body.png',
 'docs/assets/architecture.svg','docs/assets/evidence-loop.svg',
 '.github/workflows/ci.yml','.github/workflows/pages.yml','docs/DEPLOYMENT.md','LICENSE'
]) check(await exists(path),`required source artifact missing: ${path}`);
for(const path of ['dist/index.html','dist/styles.css','dist/design/tokens.css','dist/app.js','dist/ui/form-state.js','dist/core/model.js','dist/og.png','dist/.nojekyll']) check(await exists(path),`Pages build missing: ${path}`);
const allText=[readme,agent,html,pages,await read('docs/DESIGN.md'),await read('docs/DEPLOYMENT.md')].join('\n').toLowerCase();
check(!allText.includes(['set','state'].join('')),'retired project name appears in release-facing text');
console.log(`Metron ${pkg.version} — release preflight PASS (${Object.keys(manifest.entrypoints).length} manifest paths, ${Object.keys(tokens.cssVariables).length} tokens, GitHub Pages build complete).`);
console.log('Manifest publication status checked locally; independently verify remote GitHub and Pages deployment.');
