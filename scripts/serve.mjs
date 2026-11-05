import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root = resolve('.'); const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const port = Number(process.env.PORT || 4173);
createServer(async (req,res)=>{
  const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = resolve(root, '.'+path.replace(/\/$/,'/index.html'));
  if (file!==root && !file.startsWith(root+sep)) {res.writeHead(403);res.end();return;}
  try {const body=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);}
  catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`METRON → http://127.0.0.1:${port}`));
