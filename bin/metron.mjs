#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { stdin, stdout, stderr, argv } from 'node:process';
import { evaluate, DEFAULTS } from '../core/model.js';
const args=argv.slice(2);
const messages={arguments:'Use --help, --example, --file PATH, or JSON on stdin.',read:'Could not read the input file.',empty:'Pass a JSON object on stdin, or use --file / --example.',json:'Input must be valid JSON.',input:'Input does not match the Metron input contract.',size:'Input exceeds the 1 MiB limit.'};
let stage='arguments';
try {
  if(args.length===1 && ['--help','-h'].includes(args[0])) {
    stdout.write('METRON CLI: structured local estimates\nUsage: metron --example | metron --file PATH | metron < input.json\nErrors are JSON on stderr. No network calls.\n');
  } else if(args.length===1 && args[0]==='--example') stdout.write(JSON.stringify(DEFAULTS,null,2)+'\n');
  else {
    if(args.length && !(args.length===2 && args[0]==='--file' && args[1] && !args[1].startsWith('--'))) throw new Error();
    let source;
    const pieces=[];let bytes=0;stage=args.length?'read':'size';
    const stream=args.length?createReadStream(args[1]):stdin;
    for await(const chunk of stream){bytes+=chunk.length;if(bytes>1048576){stage='size';throw new Error();}pieces.push(chunk);}
    source=Buffer.concat(pieces).toString('utf8');
    stage='size';if(Buffer.byteLength(source)>1048576)throw new Error();
    stage='empty';if(!source.trim())throw new Error();
    stage='json';const input=JSON.parse(source);
    stage='input';const output=evaluate(input);
    stdout.write(JSON.stringify(output,null,2)+'\n');
  }
} catch {
  stderr.write(JSON.stringify({error:messages[stage]})+'\n');process.exitCode=1;
}
