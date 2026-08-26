# Contrast matrix — measured, per component × theme context

`matrix.json` / `matrix.csv` hold every colour pair the library paints, measured
in headless Chromium against the built docs app, with the **token** that produced
each colour and a WCAG verdict. It is the baseline an automated contrast gate
asserts against: which pairs exist, which must pass, which are exempt.

## Regenerate

```bash
npm run build:tokens
npx ng build docs --configuration=development          # → dist/docs
node tools/contrast/measure.mjs --pw-dir <dir with node_modules/playwright-core> --label "main@<sha>"
node tools/contrast/report.mjs > contrast-report.md     # human-readable view
node tools/contrast/report.mjs --compare other/matrix.json --compare-label "branch@sha"
```

`playwright-core` is **not** a dependency of this repo (adding it is the gate
owner's call); point `--pw-dir` (or `PW_MODULE_DIR`) at any directory whose
`node_modules` has it. The browser is system Chrome (`channel: "chrome"`), or
`--chrome <path>` / `CHROME_PATH`, falling back to `~/.cache/ms-playwright/chromium-1208`.
Options: `--only button,card`, `--contexts light,dark,acme,dark+acme` (the
default; `dark+acme` = both classes on `<html>`, the composition README §7
calls supported), `--no-hover`, `--no-focus`, `--dist`, `--out`.

## Method

After Kevin's V3 harness (verify.md): the docs app is served statically, each
component page is opened, the theme class is toggled on `<html>` (`""`,
`onyx-dark`, `onyx-theme-acme`), transitions and animations are disabled, the
demo preview is painted `var(--ui-color-surface)` to emulate a host app, and
**computed colours are read from the DOM**. Effective backgrounds are composited
through translucent ancestors. Overlays (dialog, menu, popover, select listbox,
tooltip) are opened and measured; focusable elements are focused and their ring
read (from the element or its `:focus-within` wrapper); elements with a `:hover`
rule are hovered. Skeleton has no docs page and is rendered from a fixture built
from its own SCSS.

**Token attribution.** For each colour, the element is matched against the live
stylesheets; every `var(--ui-…)` declared for that property is resolved at the
element and the one equal to the computed colour wins (`fg_source: rule`), else
the walk goes up the ancestors (`inherited:<node>`) or through `currentColor`.
`fg_chain` / `bg_chain` is the static var() chain in that context, parsed from the
stylesheets `angular.json` ships for the docs app, so a row names both the
component token and the semantic/primitive it resolves to.

## Columns

| column | meaning |
|---|---|
| `component`, `context`, `state` | 27 components × `light`/`dark`/`acme`/`dark+acme` × `default`/`hover`/`focus`/`open` |
| `kind`, `subkind` | `text` (`text`, `placeholder`) or `non-text` (`border`, `fill`, `box`, `line`, `icon`, `accent`, `focus-ring`, `focus-ring-vs-control`, `track`, `thumb`, `thumb-vs-track`, …) |
| `element`, `path` | host tag + variant/state modifiers + element; short DOM path |
| `fg_token`, `fg_chain`, `fg_decl`, `fg_source`, `fg_rendered` | the token, its resolution, the declaration it came from, how it was attributed, the painted hex |
| `bg_token`, `bg_chain`, `bg_rendered` | same for the effective background (composited layers are spelled out) |
| `ratio` | WCAG 2.x contrast ratio, 2 dp |
| `font_px`, `font_weight`, `large` | text size; `large` ⇒ 3:1 threshold |
| `requirement` | `required`, `informational`, `exempt-disabled`, `exempt-decorative`, `consumer-owned` |
| `threshold`, `verdict` | `PASS`/`FAIL` for required rows; `INFO`/`EXEMPT` otherwise |
| `project_bar_3` | the project's own ≥3:1 bar, evaluated for every row — separate from WCAG |
| `count` | identical elements merged into this row |

## Verdict rules (what a gate should assert)

- **Text** (`kind: text`, not disabled): required. Threshold 4.5:1, or 3:1 for
  large text (≥ 24 px, or ≥ 18.66 px bold). Placeholder and hint text count.
  Text-node **glyphs used as icons** (`.ui-dt__sort-icon` sort arrows, the
  `.ui-select__arrow` caret — `NON_TEXT_GLYPHS`) are non-text at 3:1, so a state
  glyph is never failed against the text threshold.
- **Non-text, required** (WCAG 1.4.11 boundaries and state indicators):
  form-control borders (`.ui-input__field`, `.ui-textarea__el`,
  `.ui-select__trigger`), checkbox/radio `accent-color`, switch track and thumb,
  slider track/thumb, progress fill, active tab indicator, **every focus ring
  against the surface**. Threshold 3:1. The list is `REQUIRED_NON_TEXT` in
  `measure.mjs`; challenge it there, not in the data.
- **Informational** (`INFO`): boxes identified by their text (button, card,
  alert, badge, tag backgrounds and borders), icons, hover boxes, focus ring
  against its own control, menu/popover panel borders, table borders.
  Measured so the classification can be argued, never asserted.
- **Exempt** (`EXEMPT`): disabled/inactive controls (WCAG 1.4.3 & 1.4.11
  exemption) and decorative placeholders (skeleton, divider line). This is where
  the A-08 tension lives: `--ui-color-disabled-text` on `--ui-color-disabled-bg`
  is *not* a WCAG failure; `project_bar_3` records whether it meets the project's
  ≥3:1 design bar, so the two can be asserted separately.
- **Consumer-owned** (`INFO`): plain elements in a demo that carry a directive
  (tooltip/popover trigger buttons) — the host app's colours, not the library's.

A gate passes when `rows.filter(r => r.verdict === "FAIL").length === 0`, and
should print the failure clusters (`report.mjs` §1) grouped by token pair, since
one token value typically fails across many components.

## Limits

- Range inputs paint in `::-webkit-slider-*` pseudo-elements that
  `getComputedStyle` cannot expose; those rows are **token-resolved** at the
  element (`fg_source: token-resolved…`), not read from paint.
- Native checkbox/radio boxes are UA-drawn; `accent-color` (checked fill) is
  measured, the unchecked UA border is not themeable and not measured.
- Not measured: active/pressed states.
- `report.mjs --compare` runs a **composition check** on every `a+b` context: if
  its rows render ≈100 % identical to one part alone, the context did not
  compose and every verdict change inside it is flagged `⚠ regression`, not
  counted as a token fix or a token failure.
- Right after toggling a theme class, Chrome reports mid-transition values for
  anything with `transition: background-color` — hence transitions are disabled.
