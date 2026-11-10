import {createFormState, transitionForm, exportSnapshot, hasBodyFat, NUMERIC_FIELDS, CHOICE_LOCATION} from './ui/form-state.js';
let form = createFormState();
const $ = (id) => document.getElementById(id);
const number = (value) => value===null?'—':Math.round(value).toLocaleString('en-US');
function toggleTab(name, focus=false) {
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
function dispatch(event) { form=transitionForm(form,event);update(); }
function update() {
  const state=form.input, ready=form.result.state==='ready';
  // Controls always reflect the draft, including while another field is invalid.
  for(const [id] of NUMERIC_FIELDS) {
    if($(id).value!==form.rawValues[id])$(id).value=form.rawValues[id];
    if(form.result.fields?.includes(id))$(id).setAttribute('aria-invalid','true');
    else $(id).removeAttribute('aria-invalid');
  }
  $('know-bf').checked=form.compositionEnabled;
  $('composition-controls').hidden=!form.compositionEnabled;
  $('cunningham-btn').disabled=!hasBodyFat(form);
  $('intensity-control').hidden=state.activity.workoutMinutes===0;
  $('steps-label').textContent=number(state.activity.steps);
  $('minutes-label').textContent=`${state.activity.workoutMinutes??'—'} min`;
  $('sleep-label').textContent=`${state.recovery.sleepHours??'—'} h`;
  $('sets-label').textContent=`${state.recovery.usualMuscleSets??'—'} sets`;
  $('usual-steps-label').textContent=number(state.recovery.usualSteps);
  $('bodyfat-label').textContent=state.profile.bodyFatPercent===null?'Not entered':`${state.profile.bodyFatPercent}%`;
  $('smm-label').textContent=state.profile.skeletalMuscleKg===null?'Not entered':`${state.profile.skeletalMuscleKg} kg`;
  $('sample-caption').textContent=form.isSample?'A sample profile is preloaded. Review each field before interpreting the estimate.':'Some values may still be examples. Check weight, height, age and the equation parameter.';
  $('profile-summary').textContent=`${form.isSample?'Example':'Entered / example profile'} · ${state.profile.weightKg??'—'} kg · ${state.profile.heightCm??'—'} cm · ${state.profile.ageYears??'—'} years`;
  for(const segment of document.querySelectorAll('[data-choice]')) {
    const key=segment.dataset.choice,value=state[CHOICE_LOCATION[key]][key];
    for(const button of segment.querySelectorAll('[data-value]')) {
      const active=button.dataset.value===value;
      button.classList.toggle('chosen',active);button.setAttribute('aria-pressed',String(active));
    }
  }
  $('input-error').hidden=ready;$('input-error').textContent=ready?'':form.result.message;
  $('export-json').disabled=!ready;
  for(const el of document.querySelectorAll('[data-estimate]'))el.hidden=!ready;
  $('composition-visual').hidden=!ready||!hasBodyFat(form);
  if(!ready) {$('walk-distance').textContent='Estimate unavailable';return;}
  const {energy,recovery}=form.result.payload.output;
  $('tdee-number').textContent=number(Math.round(energy.estimatedTdeeKcal/50)*50);
  const c=energy.components,total=energy.estimatedTdeeKcal;
  $('kcal-base').textContent=number(c.baselineKcal);
  $('kcal-walk').textContent=number(c.walkingKcal);
  $('kcal-gym').textContent=number(c.workoutKcal);
  $('bar-base').style.width=`${100*c.baselineKcal/total}%`;
  $('bar-walk').style.width=`${100*c.walkingKcal/total}%`;
  $('bar-gym').style.width=`${100*c.workoutKcal/total}%`;
  $('walk-distance').textContent=`~${energy.derived.incrementalWalkingKm.toFixed(1)} km incremental`;
  $('rmr-number').textContent=number(energy.derived.restingKcal);
  $('rmr-model').textContent=state.activity.restingModel==='mifflin'?'Mifflin–St Jeor model':'Cunningham · FFM-based model';
  $('mifflin-compare').textContent=number(energy.derived.mifflinKcal);
  $('cunningham-compare').textContent=energy.derived.cunninghamKcal === null ? 'Add body fat %' : number(energy.derived.cunninghamKcal);
  const titles={'recovery-first':'Signals need attention','full-session':'Fewer caution signals entered','train-adjust':'Mixed signals entered','reduce-volume':'More caution signals entered'};
  const flags={'recovery-first':'CAUTION SIGNALS','full-session':'FEWER SIGNALS','train-adjust':'MIXED SIGNALS','reduce-volume':'MORE SIGNALS'};
  $('recovery-title').textContent=titles[recovery.status];
  $('recovery-flag').textContent=flags[recovery.status];
  $('recovery-flag').dataset.status=recovery.status;
  $('recovery-range').textContent=`${recovery.recommendation.minSets}–${recovery.recommendation.maxSets}`;
  $('recovery-unit').textContent='illustrative sets / target muscle; not a training target';
  $('recovery-note').textContent=recovery.notes.join(' ');
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
}
for(const [id] of NUMERIC_FIELDS) {
  $(id).setAttribute('aria-describedby','input-error');
  $(id).addEventListener('input',()=>dispatch({type:'numeric',id,value:$(id).value,valid:$(id).validity.valid}));
}
for(const segment of document.querySelectorAll('[data-choice]')) {
  segment.addEventListener('click',event=>{
    const button=event.target.closest('[data-value]');if(!button||button.disabled)return;
    dispatch({type:'choice',key:segment.dataset.choice,value:button.dataset.value});
  });
}
$('know-bf').addEventListener('change',()=>dispatch({type:'composition',enabled:$('know-bf').checked}));
$('edit-body').addEventListener('click',()=>toggleTab('body',true));
$('see-energy').addEventListener('click',()=>toggleTab('tdee',true));
$('export-json').addEventListener('click',()=>{
  const result=exportSnapshot(form);if(!result)return;
  const blob=new Blob([JSON.stringify(result,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='metron-estimate.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
update();
