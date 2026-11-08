"""Bounded energy rebuild from SCIENCE/API specifications; no imported Metron formulas."""
import json,math,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3]
def from_spec(p,a):
 ffm=None if p['bodyFatPercent'] is None else p['weightKg']*(1-p['bodyFatPercent']/100)
 resting=10*p['weightKg']+6.25*p['heightCm']-5*p['ageYears']+(5 if p['equationSex']=='male' else -161)
 if a['restingModel']=='cunningham':resting=500+22*ffm
 base=1.2*resting
 walk=.5*p['weightKg']*(max(a['steps']-2000,0)*(.415*p['heightCm']/100)/1000)
 session=max(0,{'light':2.5,'typical':3.5,'hard':5}[a['intensity']]*p['weightKg']*a['workoutMinutes']/60-base*a['workoutMinutes']/1440)
 return {'baselineKcal':base,'walkingKcal':walk,'workoutKcal':session,'estimatedTdeeKcal':base+walk+session}
base={'weightKg':80,'heightCm':175,'ageYears':30,'equationSex':'male','bodyFatPercent':None}
activity={'steps':10000,'workoutMinutes':60,'intensity':'typical','restingModel':'mifflin'}
cases=[{'profile':base,'activity':activity},*({'profile':base,'activity':{**activity,'steps':s,'workoutMinutes':0}} for s in [0,2000,3000]),{'profile':{**base,'equationSex':'female','weightKg':62,'ageYears':61},'activity':{**activity,'intensity':'light','workoutMinutes':45}},{'profile':{**base,'bodyFatPercent':20},'activity':{**activity,'restingModel':'cunningham','intensity':'hard','steps':18000}}]
js="import {estimateEnergy} from './core/model.js';let s='';for await(const c of process.stdin)s+=c;console.log(JSON.stringify(JSON.parse(s).map(x=>{const y=estimateEnergy(x);return {...y.components,estimatedTdeeKcal:y.estimatedTdeeKcal}})));"
reference=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],input=json.dumps(cases),text=True,cwd=ROOT))
diff=max(abs(from_spec(c['profile'],c['activity'])[k]-r[k]) for c,r in zip(cases,reference) for k in r)
assert diff<1e-9
print(json.dumps({'status':'passed','cases':len(cases),'maximumDifferenceKcal':diff,'scope':'Energy components and sum only; valid synthetic inputs. No readiness rebuild or empirical claim.','specifications':['docs/SCIENCE.md','docs/API.md'],'independentLanguage':True,'independentPersonnel':False}))
