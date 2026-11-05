import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
const read=async(path)=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
test('Research Instrument theme has stable semantic values and generated CSS',async()=>{
 const tokens=JSON.parse(await read('design/tokens.json'));
 const css=await read('design/tokens.css');
 assert.equal(tokens.name,'Metron / Research Instrument');
 assert.equal(tokens.cssVariables['--background'],'#ffffff');
 assert.equal(tokens.cssVariables['--foreground'],'#171717');
 assert.equal(tokens.cssVariables['--accent'],'#171717');
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

test('V4 is a centered monochrome instrument with no promotional hero or bundled proprietary font',async()=>{
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
 for(const [key,value] of Object.entries(tokens.cssVariables)){
  if(/^#[0-9a-f]{6}$/i.test(value)){
   const rgb=[value.slice(1,3),value.slice(3,5),value.slice(5,7)];
   assert.deepEqual(rgb,[rgb[0],rgb[0],rgb[0]],`${key} must be grayscale`);
  }
 }
});
