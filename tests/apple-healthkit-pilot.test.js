import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const prefix='research/apple-healthkit-pilot/';
test('pilot is a navigable native Xcode app with HealthKit read entitlement',()=>{
  for(const p of [
    'HealthPilot.xcodeproj/project.pbxproj',
    'HealthPilot.xcodeproj/xcshareddata/xcschemes/HealthPilot.xcscheme',
    'HealthPilot/HealthPilotApp.swift',
    'HealthPilot/HealthPilotModel.swift',
    'HealthPilot/PilotView.swift',
    'HealthPilot/HealthPilot.entitlements',
    'HealthPilot/Info.plist'
  ])assert.ok(existsSync(new URL(prefix+p,root)),p);
  const entitlement=read(prefix+'HealthPilot/HealthPilot.entitlements');
  const info=read(prefix+'HealthPilot/Info.plist');
  const project=read(prefix+'HealthPilot.xcodeproj/project.pbxproj');
  assert.ok(entitlement.includes('com.apple.developer.healthkit'));
  assert.ok(info.includes('NSHealthShareUsageDescription'));
  assert.ok(!info.includes('NSHealthUpdateUsageDescription'));
  assert.ok(project.includes('CODE_SIGN_ENTITLEMENTS'));
  assert.ok(project.includes('IPHONEOS_DEPLOYMENT_TARGET = 17.0'));
});
test('HealthKit is requested only after an explicit button action',()=>{
  const view=read(prefix+'HealthPilot/PilotView.swift');
  const model=read(prefix+'HealthPilot/HealthPilotModel.swift');
  assert.ok(view.includes('pilot.run()'));
  assert.ok(view.includes('Request Health access'));
  assert.ok(model.includes('requestAuthorization(toShare: [], read: readTypes)'));
  assert.ok(model.includes('HKObjectType.workoutType()'));
  assert.ok(model.includes('.stepCount'));
  assert.ok(!model.includes('HKObjectType.characteristicType'));
  assert.ok(!model.includes('requestAuthorization(toShare: ['));
  assert.ok(!model.includes('HKHealthStore().save'));
  assert.ok(!model.includes('enableBackgroundDelivery'));
});
test('pilot compares exact sample identity and never asserts merged daily membership',()=>{
  const model=read(prefix+'HealthPilot/HealthPilotModel.swift');
  assert.ok(model.includes('HKQuery.predicateForObjects(from: workout)'));
  assert.ok(model.includes('Set(daily.map(\\.uuid))'));
  assert.ok(model.includes('associated.filter { dailyIDs.contains($0.uuid) }'));
  assert.ok(model.includes('.cumulativeSum, .separateBySource'));
  assert.ok(model.includes('sumQuantity(for: source)'));
  assert.ok(model.includes('readToken = UUID()'));
  assert.ok(model.includes('sampleLimit = 4000'));
});
test('privacy safeguards: no network, persistence, analytics or secret printing',()=>{
  for(const file of [
    prefix+'HealthPilot/HealthPilotApp.swift',
    prefix+'HealthPilot/HealthPilotModel.swift',
    prefix+'HealthPilot/PilotView.swift'
  ]){
    const source=read(file);
    for(const expression of [
      /\bURLSession\b/, /\bUserDefaults\b/, /\bFileManager\b/,
      /\bprint\s*\(/, /\bNSLog\s*\(/, /\bHKWorkoutRoute\b/,
      /\bHealthKit\.save\b/, /\bHKHealthStore\s*\.\s*save\b/,
      /http[s]?:\/\//, /\bCloudKit\b/, /\bFirebase\b/
    ])assert.ok(!expression.test(source),file+' contains prohibited '+expression);
  }
});
test('pilot has independent unsigned native build check and no shipped capability claim',()=>{
  const workflow=read('.github/workflows/healthkit-pilot.yml');
  const docs=read(prefix+'README.md');
  const manifest=JSON.parse(read('metron.manifest.json'));
  assert.ok(workflow.includes('macos-15'));
  assert.ok(workflow.includes('CODE_SIGNING_ALLOWED=NO build'));
  assert.ok(docs.includes('research-only'));
  assert.equal(manifest.implemented.wearableParsers,false);
  assert.equal(manifest.implemented.activityOverlapReconciliation,false);
});
