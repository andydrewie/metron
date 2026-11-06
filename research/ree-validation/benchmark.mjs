/**
 * RMR-EXT-001 · G2 headless benchmark engine.
 * Strictly synthetic in CI. Real-data analysis requires an explicit G3 CLI gate.
 * Imports frozen, public Metron equations rather than re-implementing physiology.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mifflinStJeor, cunninghamRmr, MODEL_VERSION } from '../../core/model.js';

export const G1_COMMIT = '6028a80fb7070b354dec68feeb7153ce0a4cbef9';
export const ENGINE_VERSION = '1.0.0';
export const RNG_ALGORITHM = 'mulberry32-v1';
const ROOT = new URL('../../', import.meta.url);

function fileBuffer(path) { return readFileSync(new URL(path, ROOT)); }
function gitBlobSha(bytes) {
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}
export function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

export function loadLockedProtocol() {
  const protocolBytes = fileBuffer('research/ree-validation/protocol.v1.json');
  const lock = JSON.parse(fileBuffer('research/ree-validation/protocol.lock.json').toString('utf8'));
  if (gitBlobSha(protocolBytes) !== lock.protocolGitBlobSha) throw new Error('Frozen G1 protocol content changed');
  const protocol = JSON.parse(protocolBytes.toString('utf8'));
  if (protocol.protocolId !== lock.protocolId || lock.studyId !== 'RMR-EXT-001') {
    throw new Error('Frozen G1 study identity mismatch');
  }
  if (lock.modelGitBlobSha !== protocol.models.originalCoreBlobSha ||
      gitBlobSha(fileBuffer('core/model.js')) !== lock.modelGitBlobSha ||
      protocol.models.modelVersion !== MODEL_VERSION) {
    throw new Error('Frozen Metron core version/hash mismatch');
  }
  const evidence = JSON.parse(fileBuffer('research/ree-validation/G0_FILE_VERIFICATION.json').toString('utf8'));
  const source = evidence.files.find(f => f.name === protocol.source.file);
  if (!source || source.sha256 !== lock.sourceDataSha256 ||
      lock.sourceDataSha256 !== protocol.source.fileSha256) {
    throw new Error('G0 source hash does not match frozen G1 evidence');
  }
  if (protocol.status !== 'frozen-before-model-error-analysis' ||
      protocol.resampling.replicateCount !== 5000 ||
      protocol.resampling.seed !== 20261106) {
    throw new Error('Unexpected G1 protocol semantics');
  }
  return { protocol, lock };
}

/** Strict RFC4180-style comma-separated reader with quoted-field metadata. */
export function parseCsv(input) {
  if (typeof input !== 'string') throw new TypeError('CSV must be text');
  const text = input.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false, inQuotes = false, quoteClosed = false;
  function pushField() {
    row.push({value: field, quoted});
    field = ''; quoted = false; quoteClosed = false;
  }
  function pushRow() {
    if (row.length === 1 && row[0].value === '' && !row[0].quoted) { row = []; return; }
    rows.push(row); row = [];
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; quoteClosed = true; }
      } else field += ch;
    } else if (ch === '"') {
      if (field !== '' || quoteClosed || quoted) throw new SyntaxError('Malformed CSV quoting');
      quoted = true; inQuotes = true;
    } else if (ch === ',') {
      pushField();
    } else if (ch === '\n' || ch === '\r') {
      pushField(); pushRow();
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else {
      if (quoteClosed) throw new SyntaxError('Non-delimiter after CSV closing quote');
      field += ch;
    }
  }
  if (inQuotes) throw new SyntaxError('Unterminated CSV quoted field');
  if (field !== '' || quoted || row.length) { pushField(); pushRow(); }
  if (!rows.length) throw new Error('Missing CSV header');
  const headers = rows.shift().map(x => x.value.trim().normalize('NFC'));
  if (headers.some(x => !x) || headers.length !== new Set(headers).size) {
    throw new Error('Empty or ambiguous duplicate CSV header');
  }
  for (const record of rows) if (record.length !== headers.length) {
    throw new Error('Malformed CSV row width; no automatic repairs');
  }
  return {headers, rows};
}

function isMissing(entry, missing) {
  return !entry || missing.includes(entry.value.trim().toLowerCase());
}
/** Parse only documented decimal values, never guessed thousands separators. */
export function numberOrNull(entry, missingTokens) {
  if (isMissing(entry, missingTokens)) return null;
  const text = entry.value.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
  if (text.includes(',') && !entry.quoted) return null;
  // 3-digit comma fractional could equally be a thousands separator. G1
  // explicitly rules out ambiguous numeric grammar.
  if (/^[+-]?\d{1,3},\d{3}$/.test(text)) return null;
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
const validRange = (v, min, max) => v !== null && v >= min && v <= max;
const code = v => v?.value.trim().normalize('NFC') ?? '';

function quantile(values, q) {
  if (!values.length) return null;
  const sorted = [...values].sort((a,b) => a-b);
  const x = (sorted.length - 1) * q;
  const lo = Math.floor(x), hi = Math.ceil(x);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (x - lo);
}
export function metrics(rows, model='mifflin') {
  if (!rows.length) return null;
  const errors = rows.map(x => x[model] - x.measured);
  const n = errors.length, abs = errors.map(Math.abs);
  return {
    n, mae: abs.reduce((s,e)=>s+e,0)/n,
    bias: errors.reduce((s,e)=>s+e,0)/n,
    rmse: Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/n),
    medianAbsError: quantile(abs,0.5),
    within10Percent: rows.reduce((s,r)=>s+(Math.abs(r[model]-r.measured)/r.measured<=0.10?1:0),0)*100/n
  };
}
export function deltaPaired(rows) {
  if (!rows.length) return null;
  return metrics(rows,'cunningham').mae - metrics(rows,'mifflin').mae;
}
function rngMulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), a | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function siteStrata(rows) {
  const sites = new Map();
  for (const row of rows) {
    const key = row.site;
    if (!sites.has(key)) sites.set(key, []);
    sites.get(key).push(row);
  }
  return [...sites.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>v);
}
/** Bootstrap participant-level within study Site, preserving site sample size. */
export function bootstrap(rows, {replicates=5000, seed=20261106, paired=false}={}) {
  if (!rows.length) return null;
  if (!Number.isSafeInteger(replicates)||replicates<1||!Number.isSafeInteger(seed)) throw new RangeError('Invalid bootstrap parameters');
  const strata = siteStrata(rows), random=rngMulberry32(seed);
  const metricsNames=['mae','bias','rmse','medianAbsError','within10Percent'];
  const draws=Object.fromEntries(metricsNames.map(k=>[k,[]]));
  if (paired) draws.pairedMaeDelta=[];
  for (let iteration=0;iteration<replicates;iteration++){
    const sampled=[];
    for(const group of strata){
      for(let i=0;i<group.length;i++) sampled.push(group[Math.floor(random()*group.length)]);
    }
    const statistic=metrics(sampled,'mifflin');
    for(const key of metricsNames) draws[key].push(statistic[key]);
    if(paired) draws.pairedMaeDelta.push(deltaPaired(sampled));
  }
  return Object.fromEntries(Object.entries(draws).map(([name,values])=>
    [name,{lower:quantile(values,0.025),upper:quantile(values,0.975)}]));
}
function subgroupLabel(field, row) {
  if(field==='Site') return ['freising','nuernber'].includes(row.site)?row.site:'unknown';
  if(field==='equationSex') return row.equationSex;
  if(field==='ageYears') return row.age<40?'18-39':row.age<60?'40-59':'60-105';
  if(field==='BMI'){
    const bmi=row.weightKg / Math.pow(row.heightCm/100,2);
    return bmi<25?'<25':bmi<30?'25-<30':'>=30';
  }
  throw new Error('Unsupported subgroup');
}
/** Parse, validate G1 eligibility, then summarize. No IDs or row values leave memory. */
export function evaluateCsv(text,{protocol,lock,synthetic=false,sourceSha256=null}={}){
  if(!protocol||!lock) throw new Error('Frozen protocol and lock required');
  if(!synthetic && sourceSha256!==lock.sourceDataSha256) throw new Error('Dataset SHA-256 mismatch');
  const parsed=parseCsv(text);
  const v=protocol.variables, rules=protocol.primaryEligibility.orderedRules;
  const required=[v.participantId,v.site,v.sexCode,v.ageYears,v.heightCm,v.weightKg,v.measuredRmrKjDay,v.ffmKg];
  for(const h of required)if(!parsed.headers.includes(h))throw new Error('Required G1 column missing');
  const index=Object.fromEntries(parsed.headers.map((name,i)=>[name,i]));
  const seen=new Set();
  for(const row of parsed.rows){
    const id=code(row[index[v.participantId]]);
    if(!id || seen.has(id)) throw new Error('Missing or duplicate participant identifier; abort entire benchmark');
    seen.add(id);
  }
  const included=[], paired=[];
  const stage=Object.fromEntries(rules.filter(r=>!['file-integrity','headers','id'].includes(r.id)).map(x=>[x.id,0]));
  const multi=Object.fromEntries(Object.keys(stage).map(x=>[x,0]));
  const fieldQuality=Object.fromEntries([v.sexCode,v.ageYears,v.heightCm,v.weightKg,v.measuredRmrKjDay,v.ffmKg].map(x=>[x,{available:0,invalidOrMissing:0}]));
  let ffmExcluded=0, unknownSite=0;
  for(const row of parsed.rows){
    const at=k=>row[index[k]];
    const equ=protocol.variables.equationSexMapping[code(at(v.sexCode))]??null;
    const age=numberOrNull(at(v.ageYears),v.missingTokens),
      heightCm=numberOrNull(at(v.heightCm),v.missingTokens),
      weightKg=numberOrNull(at(v.weightKg),v.missingTokens),
      observedKj=numberOrNull(at(v.measuredRmrKjDay),v.missingTokens),
      ffm=numberOrNull(at(v.ffmKg),v.missingTokens);
    const good={
      sex:equ!==null,age:validRange(age,18,105),height:validRange(heightCm,100,250),
      weight:validRange(weightKg,25,350),reference:observedKj!==null&&observedKj>0
    };
    for(const [name,key] of [['sex',v.sexCode],['age',v.ageYears],['height',v.heightCm],['weight',v.weightKg],['reference',v.measuredRmrKjDay]]){
      fieldQuality[key][good[name]?'available':'invalidOrMissing']++;
    }
    const validFfm=validRange(ffm,5,150) && ffm<=weightKg;
    fieldQuality[v.ffmKg][validFfm?'available':'invalidOrMissing']++;
    const first=Object.keys(stage).find(k=>!good[k]);
    for(const key of Object.keys(stage))if(!good[key])multi[key]++;
    if(first){stage[first]++;continue;}
    const rawSite=code(at(v.site));
    const site=['freising','nuernber'].includes(rawSite)?rawSite:'unknown';
    if(site==='unknown')unknownSite++;
    const item={
      site,equationSex:equ,age,heightCm,weightKg,
      measured:observedKj/4.184,
      mifflin:mifflinStJeor({weightKg,heightCm,ageYears:age,equationSex:equ}),
    };
    // Never expose participant IDs or raw rows beyond this function.
    included.push(item);
    if(validFfm)paired.push({...item,cunningham:cunninghamRmr(ffm)});
    else ffmExcluded++;
  }
  const n=included.length, withinOriginal=included.filter(r=>r.age>=19&&r.age<=78);
  const subgroups={};
  for(const dimension of protocol.subgroups.dimensions){
    const buckets=new Map(dimension.categories.map(label=>[label,[]]));
    for(const item of included){
      const label=subgroupLabel(dimension.name,item);
      if(!buckets.has(label))buckets.set(label,[]);
      buckets.get(label).push(item);
    }
    subgroups[dimension.name]=Object.fromEntries([...buckets].map(([label,group])=>[
      label,group.length<protocol.subgroups.minimumNForAccuracy?
        {n:group.length,status:'suppressed-small-n',metrics:null,ci95:null}:
        {n:group.length,status:'exploratory',metrics:metrics(group),ci95:bootstrap(group,{replicates:protocol.resampling.replicateCount,seed:protocol.resampling.seed})}
    ]));
  }
  const opts={replicates:protocol.resampling.replicateCount,seed:protocol.resampling.seed};
  const main=n?{summary:metrics(included),ci95:bootstrap(included,opts)}:null;
  const pairedResult=paired.length?{
    n:paired.length,mifflin:metrics(paired),cunningham:metrics(paired,'cunningham'),
    cunninghamMinusMifflinMae:deltaPaired(paired),
    ci95:bootstrap(paired,{...opts,paired:true})
  }:null;
  return {
    schemaVersion:'1.0.0',studyId:protocol.studyId,protocolId:protocol.protocolId,
    engineVersion:ENGINE_VERSION,prng:RNG_ALGORITHM,
    evidenceType:synthetic?'synthetic-engineering-only':'measured-RMR-dataset-analysis',
    empiricalValidation:synthetic?'not-applicable-synthetic':'single-source-reanalysis',
    endpoint:'RMR/REE',unit:'kcal/day',sourceSha256:synthetic?'synthetic-fixture-not-real-source':sourceSha256,
    frozenModelVersion:protocol.models.modelVersion,
    cohortFlow:{rawRows:parsed.rows.length,excludedByFirstReason:stage,invalidByReason:multi,eligible:n,pairedEligible:paired.length,pairedExcludedForFfm:ffmExcluded,unknownSiteParticipants:unknownSite},
    fieldQuality,primary:main,paired:pairedResult,
    age19To78Sensitivity:withinOriginal.length<protocol.subgroups.minimumNForAccuracy?
      {n:withinOriginal.length,status:'suppressed-small-n',metrics:null,ci95:null}:
      {n:withinOriginal.length,status:'exploratory',metrics:metrics(withinOriginal),ci95:bootstrap(withinOriginal,opts)},
    subgroups,
    provenance:{
      frozenG1Commit:G1_COMMIT,protocolGitBlobSha:lock.protocolGitBlobSha,
      modelGitBlobSha:lock.modelGitBlobSha,sourceVersion:protocol.source.version,sourceDoi:protocol.source.doi,
      modelReestimated:false,personalizedUncertainty:false,clinicalClaims:false,
      inferenceLimit:'Cohort-level resting-rate error only; never a TDEE or individual prediction interval.'
    }
  };
}
