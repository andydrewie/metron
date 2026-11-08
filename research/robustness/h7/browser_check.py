"""Synthetic browser checks; run in CI with Playwright, never with personal data."""
import base64,json,pathlib,subprocess,time
from playwright.sync_api import sync_playwright,expect
ROOT=pathlib.Path(__file__).resolve().parents[3]
server=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':320,'height':900},reduced_motion='reduce')
  errors=[];requests=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.on('request',lambda request:requests.append(request.url))
  for attempt in range(30):
   try:page.goto('http://127.0.0.1:8765',wait_until='networkidle');break
   except Exception:
    if attempt==29:raise
    time.sleep(.1)
  expect(page.locator('#tdee-number')).to_have_text('2,500')
  def layout():assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  def screenshot(name):
   data=page.screenshot(full_page=True);print('METRON_SCREENSHOT '+name+' '+base64.b64encode(data).decode())
  layout();screenshot('mobile.png')
  page.locator('#tab-tdee').focus();page.keyboard.press('ArrowRight')
  expect(page.locator('#tab-recovery')).to_be_focused();expect(page.locator('#panel-recovery')).to_be_visible()
  expect(page.locator('.rule-detail')).not_to_have_attribute('open','')
  assert 'No validated training clearance' in page.locator('#panel-recovery').inner_text()
  assert 'Ready for your full session' not in page.locator('#panel-recovery').inner_text()
  layout();screenshot('recovery.png')
  page.keyboard.press('End');expect(page.locator('#tab-body')).to_be_focused()
  page.locator('#know-bf').focus();page.keyboard.press('Space');expect(page.locator('#know-bf')).to_be_checked()
  page.locator('.check-row').click();expect(page.locator('#know-bf')).not_to_be_checked()
  page.locator('.check-row').click();expect(page.locator('#know-bf')).to_be_checked()
  expect(page.locator('#bodyfat')).to_have_value('');expect(page.locator('#cunningham-btn')).to_be_disabled()
  page.locator('#bodyfat').fill('20');page.locator('#advanced-equations').locator('summary').click()
  expect(page.locator('#cunningham-btn')).to_be_enabled()
  page.locator('#cunningham-btn').click()
  expect(page.locator('#rmr-number')).to_have_text('1,908')
  expect(page.locator('#bodyfat')).to_have_accessible_name('Body fat')
  expect(page.locator('#weight')).to_have_accessible_name('Body weight kg')
  layout();screenshot('body.png')
  page.locator('#weight').fill('')
  expect(page.locator('#weight')).to_have_attribute('aria-invalid','true');expect(page.locator('#input-error')).to_be_visible()
  expect(page.locator('.result-body')).to_be_hidden()
  page.locator('#tab-tdee').click();expect(page.locator('.result-energy')).to_be_hidden();expect(page.locator('#export-json')).to_be_disabled()
  page.locator('[data-choice="intensity"] [data-value="hard"]').click()
  expect(page.locator('#input-error')).to_be_visible();expect(page.locator('.result-energy')).to_be_hidden()
  page.locator('#edit-body').click();expect(page.locator('#tab-body')).to_be_focused()
  page.locator('#weight').fill('80');expect(page.locator('.result-body')).to_be_visible()
  page.locator('#smm').fill('90');expect(page.locator('#input-error')).to_be_visible()
  page.locator('#smm').fill('');expect(page.locator('#input-error')).to_be_hidden()
  page.locator('#bodyfat').fill('');expect(page.locator('#cunningham-btn')).to_be_disabled()
  expect(page.locator('#rmr-number')).to_have_text('1,749')
  page.locator('#see-energy').click();expect(page.locator('#tab-tdee')).to_be_focused()
  with page.expect_download() as info:page.locator('#export-json').click()
  exported=json.loads(pathlib.Path(info.value.path()).read_text())
  assert exported['input']['profile']['bodyFatPercent'] is None
  assert exported['inputOrigins']['profile']['weightKg']=='user-entered'
  assert exported['inputOrigins']['profile']['ageYears']=='example-default'
  assert exported['output']['energy']['restingModel']=='mifflin'
  # DOM roles/labels and keyboard behavior, not an assistive-technology user study.
  snapshot=page.locator('main').aria_snapshot();assert 'tab "Energy" [selected]' in snapshot
  assert not errors,errors
  assert all(url.startswith('http://127.0.0.1:8765/') for url in requests),requests
  page.set_viewport_size({'width':1280,'height':900});page.reload(wait_until='networkidle');layout();screenshot('desktop.png')
  print('METRON_BROWSER_RESULT '+json.dumps({'status':'passed','browser':browser.version,'widths':[320,1280],'keyboard':True,'accessibleNamesAndRoles':True,'invalidInputAndExport':True,'bodyFatNotInferred':True,'noExternalRequests':True,'actualScreenReaderSession':False,'humanComprehensionStudy':False}))
  browser.close()
finally:server.terminate();server.wait()
