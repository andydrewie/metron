"""Frozen, aggregate-only resting-equation replication. Never print source rows or exceptions."""
import argparse,hashlib,json,math,pathlib,platform,statistics,subprocess,sys
HERE=pathlib.Path(__file__).resolve().parent
FREEZE='d5250bec8bfa29157c7e6eb0dd0a0a271750b561'
def mean(a): return math.fsum(a)/len(a)
def quantile(a,p):
 a=sorted(a);x=(len(a)-1)*p;i=int(x)
 return a[i]+(a[min(i+1,len(a)-1)]-a[i])*(x-i)
def paired(a,b,reference,seed,B):
 da=[abs(y-r)-abs(x-r) for x,y,r in zip(a,b,reference)]
 dp=[int(abs(y-r)<=.1*r)-int(abs(x-r)<=.1*r) for x,y,r in zip(a,b,reference)]
 state=seed;means=[];ps=[];n=len(da)
 for _ in range(B):
  total=0.;p=0
  for j in range(n):
   state^=(state<<13)&0xffffffff;state^=state>>17;state^=(state<<5)&0xffffffff;state&=0xffffffff
   k=int(state/4294967296*n);total+=da[k];p+=dp[k]
  means.append(total/n);ps.append(p/n)
 return dict(n=n,deltaMae=mean(da),deltaMaeCI=[quantile(means,.025),quantile(means,.975)],deltaWithin10=mean(dp),deltaWithin10CI=[quantile(ps,.025),quantile(ps,.975)])
def summary(p,y):
 e=[x-r for x,r in zip(p,y)];sd=statistics.stdev(e)
 return dict(mae=mean(list(map(abs,e))),bias=mean(e),rmse=math.sqrt(mean([x*x for x in e])),within10=mean([int(abs(x)<=.1*r) for x,r in zip(e,y)]),errorSD=sd,descriptiveAgreementLimits=[mean(e)-1.96*sd,mean(e)+1.96*sd])
def run(path):
 import pyreadstat
 lock=json.loads((HERE/'protocol.lock.json').read_text())
 if any(hashlib.sha256((HERE/lock[k]).read_bytes()).hexdigest()!=lock[k+'Sha256'] for k in ['protocol','admission']):raise ValueError('frozen-artifact')
 protocol=json.loads((HERE/'protocol.v1.1.json').read_text());admission=json.loads((HERE/'admission.json').read_text())
 if hashlib.sha256(path.read_bytes()).hexdigest()!=protocol['sourceSha256']:raise ValueError('hash')
 data,meta=pyreadstat.read_sav(str(path),output_format='dict')
 if meta.column_names_to_labels!=admission['codebook']['columns'] or meta.number_rows!=90:raise ValueError('codebook')
 if meta.variable_value_labels!={'Gender':{0.0:'Female',1.0:'Male'}} or meta.missing_ranges:raise ValueError('labels')
 raw=list(zip(*(data[k] for k in meta.column_names)))
 if len(set(raw))!=90:raise ValueError('duplicate')
 if any(not isinstance(x,(float,int)) or not math.isfinite(x) for row in raw for x in row):raise ValueError('missing')
 if abs(mean(data['Measured_REE_kJ'])/1000-7.68)>=.01:raise ValueError('units')
 rows=[];m=[];c=[];f=[];all_m=[];all_f=[];all_y=[];excluded=0
 for i in range(90):
  v={k:data[k][i] for k in data};sex=v['Gender'];w=v['Weight'];h=v['Height']*100;a=v['Age'];bf=v['FM_Perc'];y=v['Measured_REE_kJ']/4.184
  if sex not in (0,1) or not (25<=w<=350 and 100<=h<=250 and 18<=a<=105 and y>0 and 0<v['FFM_kg']<=w):raise ValueError('eligibility')
  all_m.append(10*w+6.25*h-5*a+(5 if sex==1 else -161));all_f.append(500+22*v['FFM_kg']);all_y.append(y)
  if not 2<=bf<=75:
   excluded+=1;continue
  rows.append(dict(weight=w,height=h,age=a,bf=bf,sex='male' if sex==1 else 'female',reference=y))
  m.append(10*w+6.25*h-5*a+(5 if sex==1 else -161));c.append(500+22*w*(1-bf/100));f.append(500+22*v['FFM_kg'])
 bs=protocol['analysis']['bootstrap'];groups={};paired_only={}
 for group in ['all','female','male']:
  ii=[i for i,r in enumerate(rows) if group=='all' or r['sex']==group];aa=[m[i] for i in ii];bb=[c[i] for i in ii];yy=[rows[i]['reference'] for i in ii]
  pair=paired(aa,bb,yy,bs['seed'],bs['replicates']);paired_only[group]=pair
  groups[group]={**pair,'mifflin':summary(aa,yy),'cunningham':summary(bb,yy),'suppliedFfmCunningham':summary([f[i] for i in ii],yy)}
 js=subprocess.run(['node',str(HERE/'replicate.mjs')],input=json.dumps(dict(rows=rows,seed=bs['seed'],replicates=bs['replicates'])),capture_output=True,text=True,check=True)
 other=json.loads(js.stdout)
 max_prediction=max(abs(z-z2) for pair1,pair2 in zip(zip(m,c),other['predictions']) for z,z2 in zip(pair1,pair2))
 def flatten(x):
  if isinstance(x,dict):return [z for k in sorted(x) for z in flatten(x[k])]
  if isinstance(x,list):return [z for y in x for z in flatten(y)]
  return [x]
 difference=max(abs(a-b) for a,b in zip(flatten(paired_only),flatten(other['groups'])))
 if max_prediction>1e-9 or difference>1e-9:raise ValueError('reproduction')
 supported=groups['all']['deltaMaeCI'][1]<-25 and all(groups[k]['n']>=10 and groups[k]['deltaMaeCI'][1]<25 for k in ['female','male'])
 return dict(schemaVersion='1.0.0',studyId='RMR-EXT-002',asOf='2026-11-09',protocolFreezeCommit=FREEZE,protocolSha256=hashlib.sha256((HERE/'protocol.v1.1.json').read_bytes()).hexdigest(),sourceSha256=protocol['sourceSha256'],analysisStatus='complete',admittedN=90,analyzedN=len(rows),excludedN=excluded,exclusionReason='bodyFatPercent below pre-existing production bound',allRecordEquationOnly=dict(n=90,mifflin=summary(all_m,all_y),suppliedFfmCunningham=summary(all_f,all_y)),groups=groups,sourceFfmVsDerivedFfmMaxKg=max(abs((cc-ff)/22) for cc,ff in zip(c,f)),independentImplementation=dict(python=platform.python_version(),pyreadstat=pyreadstat.__version__,node=subprocess.check_output(['node','--version'],text=True).strip(),maximumPredictionDifferenceKcal=max_prediction,maximumAggregateDifference=difference,separatePersonnel=False),frozenMarginCriterionMet=supported,decision='retain-general-default-and-inspectable-alternative',limits=protocol['uncertaintyLimits']+['Known published outcomes; selected cohort; same analyst wrote both implementations.','Bootstrap covers sampling variation, not method error or transportability.','Agreement limits are descriptive in this cohort, not a validated personal interval.'])
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source',type=pathlib.Path,required=True);parser.add_argument('--output',type=pathlib.Path,required=True);args=parser.parse_args()
 try:
  result=run(args.source);args.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'status':'aggregate-results-written','analyzedN':result['analyzedN']}))
 except Exception:
  print(json.dumps({'error':'H4 admission or replication failed; no rows or private details logged.'}),file=sys.stderr);sys.exit(1)
