import {DEFAULTS, evaluate} from '../core/model.js';

export const NUMERIC_FIELDS = Object.freeze([
  ['steps','activity','steps'], ['minutes','activity','workoutMinutes'], ['sleep','recovery','sleepHours'],
  ['sets','recovery','usualMuscleSets'], ['usual-steps','recovery','usualSteps'],
  ['bodyfat','profile','bodyFatPercent'], ['smm','profile','skeletalMuscleKg'],
  ['weight','profile','weightKg'], ['height','profile','heightCm'], ['age','profile','ageYears']
].map(Object.freeze));
export const CHOICE_LOCATION = Object.freeze({intensity:'activity',restingModel:'activity',equationSex:'profile',energy:'recovery',weekly:'recovery',musculoskeletal:'recovery',focus:'recovery'});
const optional = new Set(['bodyfat','smm']);
function freeze(value) {
  if(value && typeof value==='object') {Object.values(value).forEach(freeze);Object.freeze(value);}
  return value;
}
// Map validation diagnostics to controls; the core remains the only validator.
function errorFields(message) {
  if(message==='skeletalMuscleKg cannot exceed body weight') return ['smm','weight'];
  if(message==='skeletalMuscleKg cannot exceed estimated fat-free mass') return ['smm','weight','bodyfat'];
  return NUMERIC_FIELDS.filter(([, ,key])=>message.startsWith(key+' ')).map(([id])=>id);
}
function settle(form) {
  if(form.invalidFields.length) form.result={state:'invalid',revision:form.revision,fields:[...form.invalidFields],message:'Fix the marked fields to update estimates.'};
  else {
    try {
      const output=evaluate(form.input);
      form.result={state:'ready',revision:form.revision,payload:{input:structuredClone(form.input),inputOrigins:structuredClone(form.origins),output}};
    } catch(error) {form.result={state:'invalid',revision:form.revision,fields:errorFields(error.message),message:error.message};}
  }
  return freeze(form);
}
export function createFormState() {
  const input=structuredClone(DEFAULTS);
  return settle({revision:0,input,compositionEnabled:false,isSample:true,invalidFields:[],
    rawValues:Object.fromEntries(NUMERIC_FIELDS.map(([id,group,key])=>[id,input[group][key]===null?'':String(input[group][key])])),
    origins:Object.fromEntries(Object.entries(input).map(([group,fields])=>[group,Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,value===null?'unknown':'example-default']))]))});
}
function useStandardModel(form) {
  if(form.input.activity.restingModel==='cunningham') {
    form.input.activity.restingModel='mifflin';form.origins.activity.restingModel='fallback-default';
  }
}
export function hasBodyFat(form) {
  return form.compositionEnabled && form.input.profile.bodyFatPercent!==null && !form.invalidFields.includes('bodyfat');
}
/** A local form transition. Invalid drafts never retain an exportable result. */
export function transitionForm(previous,event) {
  if(event.type==='numeric' && optional.has(event.id) && !previous.compositionEnabled) return previous;
  if(event.type==='choice' && event.key==='restingModel' && event.value==='cunningham' && !hasBodyFat(previous)) return previous;
  const form=structuredClone(previous);delete form.result;form.revision++;
  if(event.type==='numeric') {
    const field=NUMERIC_FIELDS.find(([id])=>id===event.id);
    if(!field || typeof event.value!=='string') throw new TypeError('Unknown numeric field or invalid draft');
    const [id,group,key]=field;
    const empty=event.value.trim()==='';
    const value=empty?null:Number(event.value);
    const invalid=event.valid===false || (empty&&!optional.has(id)) || (!empty&&!Number.isFinite(value));
    form.rawValues[id]=event.value;
    form.input[group][key]=invalid?null:value;
    form.origins[group][key]=value===null?'unknown':'user-entered';
    form.invalidFields=form.invalidFields.filter(x=>x!==id);
    if(invalid) form.invalidFields.push(id);
    if(key==='bodyFatPercent'&&!hasBodyFat(form)) useStandardModel(form);
    if(group==='profile') form.isSample=false;
  } else if(event.type==='choice') {
    const group=CHOICE_LOCATION[event.key];
    if(!group) throw new TypeError('Unknown choice field');
    form.input[group][event.key]=event.value;form.origins[group][event.key]='user-entered';
    if(group==='profile') form.isSample=false;
  } else if(event.type==='composition') {
    if(typeof event.enabled!=='boolean') throw new TypeError('Composition state must be boolean');
    form.compositionEnabled=event.enabled;
    if(!event.enabled) {
      for(const [id,key] of [['bodyfat','bodyFatPercent'],['smm','skeletalMuscleKg']]) {
        form.rawValues[id]='';form.input.profile[key]=null;form.origins.profile[key]='unknown';
      }
      form.invalidFields=form.invalidFields.filter(id=>!optional.has(id));useStandardModel(form);
    }
  } else throw new TypeError('Unknown form event');
  return settle(form);
}
export function exportSnapshot(form) {
  return form.result.state==='ready' && form.result.revision===form.revision ? structuredClone(form.result.payload) : null;
}
