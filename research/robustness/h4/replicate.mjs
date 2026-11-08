/** Separate JS calculation and paired bootstrap. Input/output stay in the private caller pipe. */
import {estimateEnergy} from '../../../core/model.js';
const chunks=[];for await(const c of process.stdin) chunks.push(c);
const {rows,seed,replicates}=JSON.parse(Buffer.concat(chunks));
const predictions=rows.map(r=>{
 const input={profile:{weightKg:r.weight,heightCm:r.height,ageYears:r.age,equationSex:r.sex,bodyFatPercent:r.bf}};
 const e=estimateEnergy(input);return [e.derived.mifflinKcal,e.derived.cunninghamKcal];
});
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const quantile=(a,p)=>{const x=(a.length-1)*p,i=Math.floor(x);return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(x-i);};
function statistics(indices) {
 const m=indices.map(i=>predictions[i][0]-rows[i].reference),c=indices.map(i=>predictions[i][1]-rows[i].reference);
 const da=m.map((x,j)=>Math.abs(c[j])-Math.abs(x));
 const dp=m.map((x,j)=>Number(Math.abs(c[j])<=.1*rows[indices[j]].reference)-Number(Math.abs(x)<=.1*rows[indices[j]].reference));
 let state=seed>>>0;const next=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 const draws=[],proportions=[];
 for(let b=0;b<replicates;b++){let total=0,p=0;for(let j=0;j<indices.length;j++){const k=Math.floor(next()*indices.length);total+=da[k];p+=dp[k];}draws.push(total/indices.length);proportions.push(p/indices.length);}
 draws.sort((a,b)=>a-b);proportions.sort((a,b)=>a-b);
 return {n:indices.length,deltaMae:mean(da),deltaMaeCI:[quantile(draws,.025),quantile(draws,.975)],deltaWithin10:mean(dp),deltaWithin10CI:[quantile(proportions,.025),quantile(proportions,.975)]};
}
const groups={all:rows.map((_,i)=>i),female:rows.flatMap((r,i)=>r.sex==='female'?[i]:[]),male:rows.flatMap((r,i)=>r.sex==='male'?[i]:[])};
process.stdout.write(JSON.stringify({predictions,groups:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,statistics(v)]))}));
