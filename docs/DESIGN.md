# Metron visual contract — V4 / Monochrome instrument

**Status:** locked for the next deployable alpha. The website must resemble the compact V4 instrument designed in chat, not a marketing landing page. Its interface is original Metron work informed by familiar ChatGPT interaction conventions.

> Complexity in the engine. Clarity in the cockpit.

## Visual rules

1. **One centered instrument:** a 660px total-width canvas, small centered text-only wordmark, a concise title, and the Energy / Readiness / Body tabs. No two-column promotional hero, decorative metrics, colored promotional graphics, or off-center logo glyph.
2. **Monochrome only:** white background, charcoal text, light-gray secondary surfaces and hairline borders. Three shades of gray distinguish expenditure components and remain explicitly labeled.
3. **Immediate utility:** energy result first; steps, duration and average session intensity next. Resting models, body composition and training details remain progressively disclosed.
4. **Native typography:** the CSS font stack references `OpenAI Sans` *only if installed on the viewer's device*, otherwise uses system UI sans-serif. OpenAI font binaries are not bundled or redistributed. OpenAI's published ChatGPT plugin guidance recommends platform-native fonts; this repository is independently branded and is not endorsed by OpenAI.
5. **True headlessness:** visual changes must never affect the core engine, typed API, JSON schemas or CLI. The website is only one client of `core/model.js`.
6. **Accessible:** native controls, keyboard-friendly tabs, focus indication, reduced-motion preferences and 44px mobile targets; all important information is conveyed through text, not hue.

## Canonical source

`design/tokens.json` is the single source of truth. Run `node scripts/build-tokens.mjs` to generate `design/tokens.css`. The browser loads generated tokens before `styles.css`. Do not introduce an external UI component dependency merely to copy familiar visuals.

| Role | Token | Value |
| --- | --- | --- |
| Background | `--background` | `#ffffff` |
| Main text | `--foreground` | `#171717` |
| Quiet cards | `--muted-surface` | `#f7f7f7` |
| Supporting copy | `--muted-foreground` | `#525252` |
| Borders | `--border` | `#e5e5e5` |
| Baseline / walking / gym | `--chart-*` | `#2a2a2a` / `#8a8a8a` / `#c7c7c7` |

## Human and machine attention

- **People:** the live number, easy sliders, visible model limitations and simple disclosure controls.
- **Agents:** `AGENTS.md`, `metron.manifest.json`, JSON schemas, deterministic examples, CLI, pure functions and explicit implementation flags.

No duplicate calculation logic may enter the HTML, CSS or docs. The logo and social preview are independently authored typographic assets, not OpenAI brand marks. The published UI should not imply affiliation.

## Acceptance gate

Check 320px, 390px, 768px and desktop widths, visit every tab, modify every basic input, inspect advanced panels, verify JSON export and run `npm run ci && npm run release:check`. Regenerate actual browser screenshots in `docs/assets/` before shipping. **Software tests do not validate exercise science.**
