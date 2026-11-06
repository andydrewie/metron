#!/usr/bin/env node
/** G2 runner. Real-data invocation is an explicit G3-only action. No network. */
import {readFileSync} from 'node:fs';
import {loadLockedProtocol,evaluateCsv,sha256,G1_COMMIT} from './benchmark.mjs';

function main(args){
  const isSynthetic=args.length===1&&args[0]==='--synthetic';
  const fileIndex=args.indexOf('--file');
  const real=fileIndex!==-1;
  if(!isSynthetic&&!real)throw new Error('Specify --synthetic or --file PATH with explicit G3 authorization');
  if(real){
    if(args.length!==5 || fileIndex!==0 || args[2]!=='--execute-g3' || args[3]!=='--g1-commit' || args[4]!==G1_COMMIT) {
      throw new Error('Real source analysis is G3-only: --file PATH --execute-g3 --g1-commit FROZEN_G1_SHA');
    }
  }
  const {protocol,lock}=loadLockedProtocol();
  const bytes=isSynthetic ?
    readFileSync(new URL('./fixtures/synthetic-rmr.csv',import.meta.url)) :
    readFileSync(args[1]);
  if(bytes.length>5_000_000)throw new Error('Dataset exceeds 5 MB analysis input limit');
  const digest=sha256(bytes);
  if(real&&digest!==lock.sourceDataSha256)throw new Error('Dataset hash differs from G1 freeze');
  const report=evaluateCsv(bytes.toString('utf8'),{
    protocol,lock,synthetic:isSynthetic,sourceSha256:digest
  });
  console.log(JSON.stringify(report,null,2));
}
try{main(process.argv.slice(2));}
catch(error){
  // Never echo source data/participant identifiers, input file paths or URL
  // response contents. Only stable error classifications go to stderr.
  console.error(JSON.stringify({status:'blocked',errorType:error instanceof SyntaxError?'invalid-csv':error instanceof RangeError?'invalid-domain':'verification-or-eligibility-failure',stage:'G2/G3-benchmark',noRowsExported:true}));
  process.exitCode=2;
}
