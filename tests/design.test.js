import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
const read=async(path)=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
test('Research Instrument theme has stable semantic values and generated CSS',async()=>{
 const tokens=JSON.parse(await read('design/tokens.json'));
 const css=await read('design/tokens.css');
 assert.equal(tokens.name,'Metron / Research Instrument');
 assert.equal(tokens.cssVariables['--background'],'#ffffff');
 assert.equal(tokens.cssVariables['--foreground'],'#252A30');
 assert.equal(tokens.cssVariables['--accent'],'#0072B2');
 for(const [name,value] of Object.entries(tokens.cssVariables))assert.ok(css.includes(`${name}: ${value};`),name);
});
test('README links source diagrams and describes actual vs planned features',async()=>{
 const readme=await read('README.md');
 assert.match(readme,/architecture\.svg/);
 assert.match(readme,/evidence-loop\.svg/);
 assert.match(readme,/Caloric Allowance[^\n]*\n?/);
 assert.match(readme,/Planned; not implemented/);
 for(const svg of ['docs/assets/architecture.svg','docs/assets/evidence-loop.svg']) {
  const content=await read(svg);
  assert.match(content,/<svg/);
  assert.match(content,/<title/);
 }
});
test('website uses source-generated tokens before interface styles',async()=>{
 const html=await read('index.html');
 assert.match(html,/design\/tokens\.css/);
 assert.ok(html.indexOf('design/tokens.css')<html.indexOf('styles.css'));
});

test('V4.1 is a centered color-vision-aware instrument with no promotional hero or bundled proprietary font',async()=>{
 const html=await read('index.html');
 const css=await read('styles.css');
 const tokens=JSON.parse(await read('design/tokens.json'));
 assert.match(html,/class="page-intro"/);
 assert.match(html,/class="brand"/);
 assert.doesNotMatch(html,/class="story"|brand-symbol|class="below"/);
 assert.match(html,/id="tab-tdee"/);
 assert.match(html,/id="tab-recovery"/);
 assert.match(html,/id="tab-body"/);
 assert.match(css,/grid-template-columns:1fr auto 1fr/);
 assert.match(tokens.cssVariables['--font-sans'],/system-ui/);
 assert.deepEqual([tokens.cssVariables['--chart-baseline'],tokens.cssVariables['--chart-walk'],tokens.cssVariables['--chart-workout']],['#586674','#0072B2','#B45309']);
 assert.match(css,/--chart-walk/);
 assert.match(css,/--chart-workout/);
 assert.match(await read('docs/DESIGN.md'),/Never communicate readiness as red versus green alone/);
});

test('V4.1 semantic data colors meet AA text contrast against white',async()=>{
 const t=JSON.parse(await read('design/tokens.json')).cssVariables;
 const rgb=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 const lum=x=>{const c=rgb(x);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 for(const k of ['--foreground','--chart-baseline','--chart-walk','--chart-workout'])
  assert.ok(1.05/(lum(t[k])+.05)>=4.5,`${k} requires AA normal text contrast on white`);
});
