# H7 · Software, privacy and accessibility

**Complete at bounded review scope.** Hosted checks passed on commit `71301ba1f6946d9eacea2cac9ab6e194007a0be3`; [verification.json](verification.json) records the run, methods and limitations. All four synthetic screenshots were visually inspected at 320px/1280px. The audit covers the SDK, direct exports, CLI, browser input/export state and research replay. It is a bounded software review, not a security certification or proof of clinical accuracy.

| Finding | Change | Verification |
| --- | --- | --- |
| Nested exported defaults were mutable | Freeze each default section; types reflect read-only data | Cross-consumer mutation test |
| Prototype keys could bypass unknown-field checks | Own-key checks, plain data objects, no accessors | Malformed/prototype/getter cases |
| Direct functions accepted invalid values | Finite bounds and equation-category validation | Direct-export boundary tests |
| CLI parse/file/unknown-field errors could echo sensitive text | Fixed error messages, strict arguments, bounded input | Synthetic sentinel tests |
| Invalid browser input left stale estimates/export available | Suppress derived results across tabs and disable export until valid | Browser state sequence |
| BF toggle invented 20% | Blank optional numeric entry; no Cunningham until supplied | Browser entry/export checks |
| Impossible SMM was silently cleared | Retain entered value, show error, require correction/clear | Browser sequence |
| Hidden-tab focus and unsupported action wording | Focus selected tab; signal labels, illustrative disclosure and adjacent limits | Keyboard/accessible-name and interpretation checks |
| Frozen study depended on mutable current core bytes | Isolated replay with byte-pinned historical core | Historical benchmark tests and H8 reproduction |

Numerical model 0.1.0 and existing accepted-input calculations remain unchanged. Package 0.2.0-alpha.4 versions the interface/validation changes. Readiness SDK names are legacy heuristic fields, not a prescription API. No wearable ingestion or calibration ships.

CI uses Node 22 without application dependencies, plus an isolated Playwright 1.58.0 browser job pinned to Ubuntu 24.04. The first browser job on ubuntu-latest (26.04) failed at dependency setup because that Playwright release does not support the new image; no UI test ran in that attempt. Local Chromium could not start under this execution environment's process/socket restriction; hosted browser checks are the verification path. Screenshots use only synthetic defaults. DOM accessible names, tab roles, keyboard behavior, 320px/desktop overflow and color-independent text are checked. This is not a real screen-reader user session or an exhaustive WCAG audit; H6 comprehension evidence remains open.

Research parsers are isolated from the application. The H4 source is hash-pinned and emits only aggregates; inherited G3 privacy tests remain required. Remaining limits include untested browser/assistive-technology combinations and adversarial JavaScript objects such as executable proxies, which are outside the JSON/plain-data contract.

The second hosted run reached the UI but the test targeted the visually hidden native checkbox beneath its styled label. The test now exercises keyboard Space and visible-label clicks, with checked-state assertions, rather than forcing a click through another element. H3 review also found and repaired incomplete interval coverage being promoted by history/access flags; positive and counterexample tests now guard that boundary.
