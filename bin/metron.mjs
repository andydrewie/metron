#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { stdin, stdout, stderr, argv } from 'node:process';
import { evaluate, DEFAULTS } from '../core/model.js';
if (argv.includes('--help') || argv.includes('-h')) {
  stdout.write('METRON CLI — structured, dependency-free fitness estimates\n\nUsage:\n  metron --example\n  metron < examples/beginner.json\n  metron --file examples/beginner.json\n\nAll outputs are JSON. Errors exit non-zero. No network calls.\n');
  process.exit(0);
}
if (argv.includes('--example')) { stdout.write(JSON.stringify(DEFAULTS,null,2)+'\n'); process.exit(0); }
try {
  let source;
  const index = argv.indexOf('--file');
  if (index >= 0) {
    if (!argv[index+1]) throw new Error('--file requires a path');
    source = await readFile(argv[index+1], 'utf8');
  } else {
    const pieces = []; for await (const chunk of stdin) pieces.push(chunk); source = Buffer.concat(pieces).toString('utf8');
  }
  if (!source.trim()) throw new Error('Pass a JSON object on stdin, or use --file / --example');
  stdout.write(JSON.stringify(evaluate(JSON.parse(source)),null,2)+'\n');
} catch (error) {
  stderr.write(JSON.stringify({error:error.message})+'\n'); process.exitCode = 1;
}
