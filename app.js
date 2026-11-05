import { DEFAULTS, evaluate } from './core/model.js';
const state = structuredClone(DEFAULTS);
const $ = (id) => document.getElementById(id);
const number = (value) => Math.round(value).toLocaleString('en-US');
let activeTab = 'tdee';
let isSample = true;
const choiceLocation = { intensity: 'activity', restingModel: 'activity', equationSex: 'profile', energy: 'recovery', weekly: 'recovery', musculoskeletal: 'recovery', focus: 'recovery' };
function toggleTab(name, focus=false) {
  activeTab = name;
  for(const button of document.querySelectorAll('[data-tab]')) {
    const on=button.dataset.tab===name; button.classList.toggle('active',on); button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;
    if(on&&focus)button.focus();
  }
  for(const panel of document.querySelectorAll('.panel')) panel.hidden=panel.id!==`panel-${name}`;
}
for(const button of document.querySelectorAll('[data-tab]')) {
  button.addEventListener('click',()=>toggleTab(button.dataset.tab));
  button.addEventListener('keydown',(event)=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')];let next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(tabs.indexOf(button)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    toggleTab(tabs[next].dataset.tab,true);
  });
}
function update() {
  try {
    // Prevent impossible combinations after another body field changes.
    if(state.profile.bodyFatPercent !== null && state.profile.skeletalMuscleKg !== null && state.profile.skeletalMuscleKg > state.profile.weightKg*(1-state.profile.bodyFatPercent/100)) {
      state.profile.skeletalMuscleKg=null;
    }
    const {energy,recovery}=evaluate(state);
    $('input-error').hidden=true;
    $('sample-caption').hidden=!isSample;
    $('tdee-number').textContent=number(Math.round(energy.estimatedTdeeKcal/50)*50);
    const c=energy.components,total=energy.estimatedTdeeKcal;
    $('kcal-base').textContent=number(c.baselineKcal);
    $('kcal-walk').textContent=number(c.walkingKcal);
    $('kcal-gym').textContent=number(c.workoutKcal);
    $('bar-base').style.width=`${100*c.baselineKcal/total}%`;
    $('bar-walk').style.width=`${100*c.walkingKcal/total}%`;
    $('bar-gym').style.width=`${100*c.workoutKcal/total}%`;
    $('steps-label').textContent=number(state.activity.steps);
    $('walk-distance').textContent=`~${energy.derived.incrementalWalkingKm.toFixed(1)} km incremental`;
    $('minutes-label').textContent=`${state.activity.workoutMinutes} min`;
    $('intensity-control').hidden=state.activity.workoutMinutes===0;
    $('profile-summary').textContent=`${isSample ? "Example" : "Your profile"} · ${state.profile.weightKg} kg · ${state.profile.heightCm} cm · ${state.profile.ageYears} years`;
    $('rmr-number').textContent=number(energy.derived.restingKcal);
    $('rmr-model').textContent=state.activity.restingModel==='mifflin'?'Mifflin–St Jeor model':'Cunningham · FFM-based model';
    $('mifflin-compare').textContent=number(energy.derived.mifflinKcal);
    $('cunningham-compare').textContent=energy.derived.cunninghamKcal === null ? 'Add body fat %' : number(energy.derived.cunninghamKcal);
    $('sleep-label').textContent=`${state.recovery.sleepHours} h`;
    $('sets-label').textContent=`${state.recovery.usualMuscleSets} sets`;
    $('usual-steps-label').textContent=number(state.recovery.usualSteps);
    const titles={'recovery-first':'Recovery comes first','full-session':'Ready for your full session','train-adjust':'Train. Adjust the volume.','reduce-volume':'Dial it back today.'};
    const flags={'recovery-first':'RECOVERY DAY','full-session':'GREEN DAY','train-adjust':'ADAPTIVE DAY','reduce-volume':'LOWER-VOLUME DAY'};
    $('recovery-title').textContent=titles[recovery.status];
    $('recovery-flag').textContent=flags[recovery.status];
    $('recovery-flag').dataset.status=recovery.status;
    $('recovery-range').textContent=recovery.recommendation.restRecommended?'REST':`${recovery.recommendation.minSets}–${recovery.recommendation.maxSets}`;
    $('recovery-unit').textContent=recovery.recommendation.restRecommended?'sleep and easy movement first':'working sets / target muscle';
    $('recovery-note').textContent=recovery.notes.join(' ');
    $('composition-controls').hidden=state.profile.bodyFatPercent===null;
    $('cunningham-btn').disabled=state.profile.bodyFatPercent===null;
    if(state.profile.bodyFatPercent!==null) {
      const ffm=energy.derived.fatFreeMassKg;const mus=state.profile.skeletalMuscleKg??0;
      $('comp-muscle').style.width=`${mus/state.profile.weightKg*100}%`;
      $('comp-lean').style.width=`${(ffm-mus)/state.profile.weightKg*100}%`;
      $('comp-fat').style.width=`${state.profile.bodyFatPercent}%`;
      $('comp-muscle-name').textContent=state.profile.skeletalMuscleKg===null?'SMM unknown':'Muscle';
      $('comp-lean-name').textContent=state.profile.skeletalMuscleKg===null?'Total lean':'Other lean';
      $('comp-muscle-num').textContent=state.profile.skeletalMuscleKg===null?'—':`${mus.toFixed(1)} kg`;
      $('comp-lean-num').textContent=`${(ffm-mus).toFixed(1)} kg`;
      $('comp-fat-num').textContent=`${(state.profile.weightKg-ffm).toFixed(1)} kg`;
      $('bodyfat-label').textContent=`${state.profile.bodyFatPercent}%`;
      $('smm-label').textContent=state.profile.skeletalMuscleKg===null?'Not set':`${state.profile.skeletalMuscleKg} kg`;
    }
    for(const segment of document.querySelectorAll('[data-choice]')) {
      const key=segment.dataset.choice;const value=state[choiceLocation[key]][key];
      for(const button of segment.querySelectorAll('[data-value]')) {
        const active=button.dataset.value===value;
        button.classList.toggle('chosen',active);button.setAttribute('aria-pressed',String(active));
      }
    }
  } catch (err) { $('input-error').hidden=false;$('input-error').textContent=err.message; }
}
function numeric(id,group,key) {
  $(id).addEventListener('input',()=>{
    if($(id).value===''||!$(id).validity.valid) { $('input-error').hidden=false;$('input-error').textContent='Enter a valid '+key+'.';return; }
    state[group][key]=Number($(id).value);if(group==='profile')isSample=false;update();
  });
}
for(const [id,group,key] of [
  ['steps','activity','steps'],['minutes','activity','workoutMinutes'],['sleep','recovery','sleepHours'],
  ['sets','recovery','usualMuscleSets'],['usual-steps','recovery','usualSteps'],
  ['bodyfat','profile','bodyFatPercent'],['smm','profile','skeletalMuscleKg'],
  ['weight','profile','weightKg'],['height','profile','heightCm'],['age','profile','ageYears']
]) numeric(id,group,key);
for(const segment of document.querySelectorAll('[data-choice]')) {
  segment.addEventListener('click',(event)=>{
    const button=event.target.closest('[data-value]');if(!button||button.disabled)return;
    const key=segment.dataset.choice;state[choiceLocation[key]][key]=button.dataset.value;if(choiceLocation[key]==='profile')isSample=false;update();
  });
}
$('know-bf').addEventListener('change',()=>{
  isSample=false;
  if($('know-bf').checked) {
    state.profile.bodyFatPercent=20;
    state.profile.skeletalMuscleKg=null;
    $('bodyfat').value='20';
  } else {
    state.profile.bodyFatPercent=null;state.profile.skeletalMuscleKg=null;
    state.activity.restingModel='mifflin';
  }
  update();
});
$('edit-body').addEventListener('click',()=>toggleTab('body'));
$('see-energy').addEventListener('click',()=>toggleTab('tdee'));
$('export-json').addEventListener('click',()=>{
  const result={input:state,output:evaluate(state)};
  const blob=new Blob([JSON.stringify(result,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='metron-estimate.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
update();
