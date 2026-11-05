# Metron visual contract — V4.1 / Research Instrument

**Status:** Soft Slate / Scientific Blue / Copper selected. Preserve the compact V4 instrument, not a marketing landing page.

> Complexity in the engine. Clarity in the cockpit.

## Visual rules

1. **One centered instrument:** 660px maximum, centered wordmark, Energy / Readiness / Body tabs, immediate result.
2. **Nearly monochrome:** white canvas, neutral gray surfaces, thin borders, deep ink for primary text.
3. **Three data colors:** Soft Slate `#586674` = baseline, Scientific Blue `#0072B2` = walking, Copper `#B45309` = workout. Main text remains `#252A30`.
4. **Meaningful controls:** steps use blue; workout duration and sets use copper; tabs and recovery decisions stay neutral.
5. **System typography:** use OpenAI Sans if already installed on the device, then system sans-serif; don't bundle proprietary fonts or imply OpenAI endorsement.
6. **Headlessness:** presentation changes never alter `core/model.js`, schemas, CLI, or the agent contract.
7. **Accessible:** persistent labels and values, fixed chart order, visible keyboard focus, reduced-motion support; never rely on hue alone.

## Canonical tokens

`design/tokens.json` is authoritative. Run `node scripts/build-tokens.mjs` to generate `design/tokens.css`.

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--background` | `#ffffff` |
| Text | `--foreground` | `#252A30` |
| Secondary surface | `--muted-surface` | `#f7f7f7` |
| Borders | `--border` | `#E4E7EB` |
| Baseline | `--chart-baseline` | `#586674` |
| Walking | `--chart-walk` | `#0072B2` |
| Workout | `--chart-workout` | `#B45309` |
| Focus | `--ring` | `#0072B2` |

## Color-accessibility contract

- Every graph segment keeps a visible text label, numerical value, and stable order. Meaning must survive grayscale.
- Never communicate readiness as red versus green alone.
- Aim for at least WCAG AA contrast: 4.5:1 for normal text and 3:1 for meaningful UI graphics.
- Validate actual screens with color-vision simulations (protanopia, deuteranopia, tritanopia) before claiming comprehensive color-blind accessibility.
- Support keyboard navigation, reduced motion, and 320px, 390px, 768px and desktop layouts.

## Two forms of attention

- **Humans:** immediate usable number, straightforward sliders and deeper methods on demand.
- **Agents:** `AGENTS.md`, `metron.manifest.json`, schemas, deterministic examples, CLI and pure calculation functions.

## Release gate

Run `npm run ci && npm run release:check`; inspect real screenshots after changes; confirm charts and controls remain understandable in grayscale. Software tests do not validate physiological accuracy.
