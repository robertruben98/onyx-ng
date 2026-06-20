# onyx-ng Plan B — Rename + API/a11y Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`).

**Goal:** Rebrand the public API to the `onyx` prefix (selectors, directive selectors, TS class names) and fix the API-consistency and accessibility gaps the audit found, so v0.1 ships a coherent, accessible surface.

**Architecture:** Mechanical-but-targeted rename verified by the existing 212-test Jest + jest-axe suite and the `nx build ui-components` build, followed by focused per-area fixes (each TDD where behavior changes).

**Tech Stack:** Angular 19 (signals, standalone, OnPush), Jest + jest-axe + @testing-library/angular, Nx, stylelint.

## Global Constraints

- Branch `feature/distributable-v0.1` (NOT protected branches — a hook blocks them). No "Co-Authored-By"/"Generated with"/AI-attribution markers in commit messages (a hook blocks them). Keep commits < 1000 changed lines (the rename touches many files; if a single rename commit would exceed it, split by area and report — or use `git commit` per logical group).
- **Rename scope (IMPORTANT):** rename ONLY (a) element selectors `ui-*` → `onyx-*`, (b) attribute-directive selectors `[uiTooltip]`/`[uiPopover]` → `[onyxTooltip]`/`[onyxPopover]`, (c) `exportAs` values `uiPopover` → `onyxPopover`, (d) TS class names `XxxComponent`/`XxxDirective` → `OnyxXxxComponent`/`OnyxXxxDirective`. **Do NOT rename** CSS class names (`.ui-button`, `[class.ui-*]`), SCSS, or CSS custom properties (`--ui-*`) — those stay `ui` for v0.1 (internal styling; out of scope).
- After EVERY task: `npm run typecheck && npm test && npm run lint` green (212 tests), `npx nx build ui-components` green, and `npx nx build docs` green. The test suite references both selectors and class names, so a broken rename fails loudly — treat any red test as a rename miss, not a test to weaken.
- Behavior is preserved except where a fix task explicitly changes it. No new components.

## Component / class inventory (reference)

Selectors → new: `ui-{accordion,accordion-item,alert,avatar,badge,button,card,checkbox,data-table,dialog,divider,input,menu,popover,progress-bar,radio-group,select,spinner,switch,tab,tabs,tag,textarea,tooltip}` → `onyx-…`; `[uiPopover]`→`[onyxPopover]`, `[uiTooltip]`→`[onyxTooltip]`.
Classes → `Onyx…`: Accordion, AccordionItem, Alert, Avatar, Badge, Button, Card, Checkbox, DataTable, Dialog, Divider, Input, Menu, Popover(+Directive), ProgressBar, RadioGroup, Select, Spinner, Switch, Tab, Tabs, Tag, Textarea, Tooltip(+Directive) — all `*Component`/`*Directive`.

---

### Task 1: Rename element + directive selectors (and usages)

**Files:** every `libs/ui/components/**/*.{ts,html}` that defines or uses a `ui-*` element selector or `[uiTooltip]`/`[uiPopover]`; their `*.spec.ts`, `*.demos.ts`, `*.docs.ts`; and `apps/docs/**` usages.

**Interfaces:**

- Produces: all component selectors are `onyx-*`, directive selectors `[onyxTooltip]`/`[onyxPopover]`, `exportAs: "onyxPopover"`. CSS classes and tokens are untouched.

- [ ] **Step 1: Enumerate the exact selector strings to change**

Run: `grep -rn "selector: ?[\"']ui-\|selector: ?[\"']\[ui" libs/ui/components`
This is the authoritative list of selector definitions. Also enumerate usages: `grep -rln "<ui-\|</ui-\|uiTooltip\|uiPopover" libs/ui apps/docs`.

- [ ] **Step 2: Rename selector DEFINITIONS**

For each `selector: "ui-x"` → `selector: "onyx-x"`, and `selector: "[uiPopover]"`→`"[onyxPopover]"`, `selector: "[uiTooltip]"`→`"[onyxTooltip]"`, `exportAs: "uiPopover"`→`"onyxPopover"`. Do this with targeted edits (not a blind `ui-`→`onyx-` sweep, which would corrupt `.ui-*` CSS classes). A safe scripted form (only touches element-tag and attribute SELECTOR contexts and JSX-like tags, never `class.ui-` or `--ui-`):

```bash
# selector definitions (TS): the literal `selector: "ui-...` / `'ui-...` and the two directives
grep -rl 'selector:' libs/ui/components | while read f; do
  perl -i -pe 's/(selector:\s*["\x27])ui-/$1onyx-/g; s/(selector:\s*["\x27]\[)ui(Tooltip|Popover)/$1onyx$2/g; s/(exportAs:\s*["\x27])uiPopover/$1onyxPopover/g' "$f"
done
```

- [ ] **Step 3: Rename element-tag USAGES in templates/demos/specs**

Element tags `<ui-x` / `</ui-x` and attribute directives `uiTooltip`/`uiPopover` as bindings (`[uiTooltip]`, `uiPopover`, template ref usage). Scripted (tags + attribute usages only — never `class="ui-..."` because that is `class=`, and never `[class.ui-`):

```bash
grep -rl '<ui-\|</ui-\|uiTooltip\|uiPopover' libs/ui apps/docs | while read f; do
  perl -i -pe 's/<ui-/<onyx-/g; s/<\/ui-/<\/onyx-/g; s/\buiTooltip\b/onyxTooltip/g; s/\buiPopover\b/onyxPopover/g' "$f"
done
```

Note: `uiTooltip`/`uiPopover` as bare words only appear as directive bindings/refs — verify with the grep from Step 1 that no `--ui...`/`.ui-...` token matches `\buiTooltip\b` (it won't; those are `ui-` hyphenated). Manually check the directive spec files and demos after.

- [ ] **Step 4: Verify no `ui-*` selector definitions or element usages remain**

Run: `grep -rn 'selector: ?["\x27]ui-\|selector: ?["\x27]\[ui\|<ui-\|</ui-\|\[uiTooltip\]\|\[uiPopover\]' libs/ui apps/docs`
Expected: no output. (CSS `.ui-*` / `--ui-*` matches must NOT appear here — if they do, the pattern was too broad; revert and narrow.)

- [ ] **Step 5: Full green gate**

Run: `npm run typecheck && npm test && npm run lint && npx nx build ui-components && npx nx build docs`
Expected: all green, 212 tests pass. Any failing test is a missed selector usage — fix it (do not edit the test's intent).

- [ ] **Step 6: Commit**

```bash
git add libs/ui apps/docs
git commit -m "refactor(ui)!: rename component/directive selectors ui-* -> onyx-*"
```

---

### Task 2: Rename TS class names `Xxx` → `OnyxXxx`

**Files:** all `libs/ui/components/**/*.ts` (component/directive classes + their imports), `*.spec.ts`, `*.docs.ts`, `*.demos.ts`, the barrels are `export *` (unaffected by the class rename), and `apps/docs/**` (registry + any direct imports).

**Interfaces:**

- Consumes: Task 1.
- Produces: every exported component/directive class is `Onyx*` (e.g. `OnyxButtonComponent`, `OnyxPopoverDirective`). All internal references and docs-app imports updated.

- [ ] **Step 1: Build the class-name map and rename**

The classes to rename (whole-word, with `Component`/`Directive` suffix) are the 26 from the inventory. Use a whole-word, suffix-anchored replacement so partial names aren't corrupted:

```bash
NAMES="Accordion AccordionItem Alert Avatar Badge Button Card Checkbox DataTable Dialog Divider Input Menu Popover ProgressBar RadioGroup Select Spinner Switch Tab Tabs Tag Textarea Tooltip"
FILES=$(grep -rln -E "\b(Accordion|AccordionItem|Alert|Avatar|Badge|Button|Card|Checkbox|DataTable|Dialog|Divider|Input|Menu|Popover|ProgressBar|RadioGroup|Select|Spinner|Switch|Tab|Tabs|Tag|Textarea|Tooltip)(Component|Directive)\b" libs/ui apps/docs)
for f in $FILES; do
  perl -i -pe 's/\b(Accordion|AccordionItem|Alert|Avatar|Badge|Button|Card|Checkbox|DataTable|Dialog|Divider|Input|Menu|Popover|ProgressBar|RadioGroup|Select|Spinner|Switch|Tab|Tabs|Tag|Textarea|Tooltip)(Component|Directive)\b/Onyx$1$2/g' "$f"
done
```

Caution: this also renames already-`Onyx`-free occurrences only (the `\b` before the base name prevents `OnyxButtonComponent`→`OnyxOnyxButtonComponent` because `Onyx` precedes — verify in Step 3). If any class legitimately named e.g. `TabComponent` appears inside a string that must NOT change (unlikely), inspect.

- [ ] **Step 2: Fix any double-prefix or missed import**

Run: `grep -rn "OnyxOnyx" libs/ui apps/docs` → must be empty (if not, fix the doubled names). Then `npm run typecheck` to surface any unrenamed reference.

- [ ] **Step 3: Full green gate**

Run: `npm run typecheck && npm test && npm run lint && npx nx build ui-components && npx nx build docs`
Expected: all green, 212 tests. typecheck catches any missed reference.

- [ ] **Step 4: Commit**

```bash
git add libs/ui apps/docs
git commit -m "refactor(ui)!: rename component/directive classes to Onyx* prefix"
```

---

### Task 3: Add `exportAs` to dialog/menu/tabs; stop exporting internal Tooltip/Popover components

**Files:**

- Modify: `libs/ui/components/dialog/dialog.component.ts`, `menu/menu.component.ts`, `tabs/tabs.component.ts` (add `exportAs`)
- Modify: `libs/ui/components/tooltip/index.ts`, `popover/index.ts` (remove the internal component re-export)

**Interfaces:**

- Produces: `exportAs: "onyxDialog"|"onyxMenu"|"onyxTabs"` on those components; `OnyxTooltipComponent`/`OnyxPopoverComponent` no longer in the public barrels (still used internally by their directives).

- [ ] **Step 1: Add `exportAs`** to the `@Component` decorators of dialog, menu, tabs:
      `exportAs: "onyxDialog"`, `exportAs: "onyxMenu"`, `exportAs: "onyxTabs"` respectively.

- [ ] **Step 2: Remove internal component exports from barrels**

In `tooltip/index.ts` remove `export * from "./tooltip.component";` (keep the directive export). In `popover/index.ts` remove `export * from "./popover.component";` (keep the directive). The directive files import the component classes by direct relative path, so internal use is unaffected.

- [ ] **Step 3: Verify the components are gone from the public API but still compile**

Run: `grep -rn "OnyxTooltipComponent\|OnyxPopoverComponent" libs/ui/components/index.ts libs/ui/components/tooltip/index.ts libs/ui/components/popover/index.ts` → no output (not publicly exported). Then `npm run typecheck && npm test && npm run lint && npx nx build ui-components`.
Expected: green; the tooltip/popover directives still work (their specs pass).

- [ ] **Step 4: Commit**

```bash
git add libs/ui/components/dialog libs/ui/components/menu libs/ui/components/tabs \
        libs/ui/components/tooltip/index.ts libs/ui/components/popover/index.ts
git commit -m "feat(ui): add exportAs to dialog/menu/tabs; keep tooltip/popover surfaces internal"
```

---

### Task 4: Select — add `invalid`, `size`, `label` (CVA parity)

**Files:**

- Modify: `libs/ui/components/select/select.component.ts`, `select.component.html`, `select.component.spec.ts`

**Interfaces:**

- Consumes: renamed `OnyxSelectComponent`.
- Produces: `OnyxSelectComponent` exposes `invalid` (boolean, `aria-invalid` + `.ui-select--invalid`), `size` (`'sm'|'md'|'lg'`, default `'md'`, host class), `label` (string, renders a `<label for>` linked to the trigger), matching the patterns in `OnyxInputComponent`.

- [ ] **Step 1: Read the sibling pattern**

Read `libs/ui/components/input/input.component.ts` to copy the exact idiom for `invalid`, `size`, and `label` (input names, `booleanAttribute` transform, host class bindings, the `for`/`id` label linkage).

- [ ] **Step 2: Write failing tests** in `select.component.spec.ts`

```ts
it("reflects invalid via aria-invalid on the trigger", async () => {
  // render OnyxSelectComponent with [invalid]="true"; query the combobox trigger
  // expect trigger.getAttribute('aria-invalid') === 'true'
});
it("renders a visible label linked to the trigger", async () => {
  // render with [label]="'Country'"; expect a <label> whose for === trigger id
});
it("applies the size host class", async () => {
  // render with [size]="'sm'"; expect host has class 'ui-select--sm'
});
```

(Fill in with the project's existing testing-library render helper used in the other specs — match `input.component.spec.ts` style exactly.)

- [ ] **Step 3: Run the new tests — verify they fail**

Run: `npx jest libs/ui/components/select -t "invalid|label|size"`
Expected: FAIL (inputs not implemented).

- [ ] **Step 4: Implement** in `select.component.ts` + `.html`

Add `readonly invalid = input(false, { transform: booleanAttribute });`, `readonly size = input<OnyxSelectSize>('md');` (define `export type OnyxSelectSize = 'sm' | 'md' | 'lg';`), `readonly label = input("");`. Add host class bindings `[class.ui-select--invalid]` and `[class.ui-select--{{size}}]` consistent with input's host pattern. In the template, render `@if (label()) { <label [for]="triggerId">{{ label() }}</label> }` and add `[attr.aria-invalid]="invalid() || null"` to the `role="combobox"` trigger; ensure the trigger has a stable `triggerId`.

- [ ] **Step 5: Run tests — verify pass + no a11y regression**

Run: `npx jest libs/ui/components/select`
Expected: all select specs pass (including the existing axe test).

- [ ] **Step 6: Full gate + commit**

Run: `npm run typecheck && npm test && npm run lint && npx nx build ui-components`

```bash
git add libs/ui/components/select
git commit -m "feat(ui): add invalid/size/label inputs to OnyxSelect for CVA parity"
```

---

### Task 5: Popover focus restore + Button loading a11y

**Files:**

- Modify: `libs/ui/components/popover/popover.directive.ts` (+ spec)
- Modify: `libs/ui/components/button/button.component.html`, `button.component.ts` (+ spec)

**Interfaces:**

- Produces: `OnyxPopoverDirective.close()` restores focus to the trigger; `OnyxButtonComponent` loading state uses `aria-disabled` (not native `disabled`) so `aria-busy` is announced, while still blocking activation.

- [ ] **Step 1: Failing test — popover restores focus**

In `popover.directive.spec.ts`: open the popover, move focus into it, call `close()` (or Escape), assert `document.activeElement` is the trigger element. Run `npx jest libs/ui/components/popover` → expect the focus assertion to FAIL.

- [ ] **Step 2: Implement focus restore**

In `popover.directive.ts` `close()`, after disposing the overlay and setting `open.set(false)`, add `this.elementRef.nativeElement.focus();` (match how `OnyxMenuComponent` restores focus to its trigger). Run the popover specs → pass.

- [ ] **Step 3: Failing test — button loading keeps name announceable**

In `button.component.spec.ts`: render with `[loading]="true"`; assert the native button is NOT `disabled` (i.e. `disabled` attr absent / `false`), has `aria-disabled="true"` and `aria-busy="true"`, and that clicking does NOT emit the click handler / forwards no action. Run → expect FAIL.

- [ ] **Step 4: Implement button loading a11y**

In `button.component.html`, change `[disabled]="disabled() || loading()"` to `[disabled]="disabled()"`; add `[attr.aria-disabled]="loading() ? 'true' : null"` (keep the existing `[attr.aria-busy]`). In `button.component.ts`, in the existing `handleClick` guard, also block when `loading()` is true (preventDefault / early-return) so a focusable loading button still cannot trigger its action. Keep `disabled()` behavior unchanged.

- [ ] **Step 5: Run tests — pass + gate + commit**

Run: `npx jest libs/ui/components/popover libs/ui/components/button` then `npm run typecheck && npm test && npm run lint && npx nx build ui-components`.

```bash
git add libs/ui/components/popover libs/ui/components/button
git commit -m "fix(ui): popover restores trigger focus; button loading stays announceable (aria-disabled)"
```

---

### Task 6: Accordion — protected state, exported host token, keyboard nav

**Files:**

- Modify: `libs/ui/components/accordion/accordion-item.component.ts` (+ spec)
- Modify: `libs/ui/components/accordion/accordion.component.ts` (+ spec)
- Modify: `libs/ui/components/accordion/index.ts`

**Interfaces:**

- Produces: `OnyxAccordionItemComponent.expanded` is `protected`; `ACCORDION_HOST`/`AccordionHost` exported from the accordion barrel; `OnyxAccordionComponent` supports ArrowUp/ArrowDown/Home/End across item triggers (roving focus like `OnyxTabsComponent`).

- [ ] **Step 1: Export the host token** — add `export * from "./accordion-host";` to `libs/ui/components/accordion/index.ts`. Verify build green.

- [ ] **Step 2: Make `expanded` protected**

Change `readonly expanded = signal(false)` to `protected readonly expanded = signal(false)` in `accordion-item.component.ts`. The parent coordinates via the `ACCORDION_HOST` contract / a method, not by reaching `.expanded` externally. If `OnyxAccordionComponent` currently sets `item.expanded.set(...)` directly, route it through an existing/added method on the item (e.g. `setExpanded(v: boolean)`), or keep the signal package-accessible via the host interface. Run typecheck + accordion specs → green.

- [ ] **Step 3: Failing test — keyboard navigation**

In `accordion.component.spec.ts`: render an accordion with 3 items; focus the first header button; dispatch `ArrowDown` → assert focus moves to the second header; `ArrowUp` → back to first; `Home`/`End` → first/last. Run `npx jest libs/ui/components/accordion` → expect FAIL.

- [ ] **Step 4: Implement keyboard nav**

Read `libs/ui/components/tabs/tabs.component.ts` for the roving-focus keydown pattern. In `OnyxAccordionComponent`, add a `keydown` handler (host binding or template) over the header buttons (it already holds `contentChildren(OnyxAccordionItemComponent)`); on ArrowDown/Up move focus to the next/prev item trigger (wrap), Home/End to first/last. Expose each item's trigger element (e.g. a `viewChild`/`ElementRef` getter on the item) so the parent can `.focus()` it. Run accordion specs → pass.

- [ ] **Step 5: Full gate + commit**

Run: `npm run typecheck && npm test && npm run lint && npx nx build ui-components`.

```bash
git add libs/ui/components/accordion
git commit -m "feat(ui): accordion keyboard nav, protected item state, exported ACCORDION_HOST"
```

---

### Task 7: Minor correctness fixes (stylelint, dead token, internal signals, alert role)

**Files:** `.stylelintrc.js`; `libs/ui/tokens/tokens/*.json` + rebuilt `libs/ui/tokens/dist/tokens.css`; `libs/ui/components/tabs/tab.component.ts`; `libs/ui/components/alert/alert.component.{ts,html}` (+ alert spec).

**Interfaces:**

- Produces: stylelint guard actually matches `--ui-radii-*` and all color primitives; the unused `--ui-focus-ring-offset` is removed (or wired); `OnyxTabComponent.active` is `protected`; `OnyxAlertComponent` `role` is on the host.

- [ ] **Step 1: Fix the stylelint regex + color blocklist** in `.stylelintrc.js`: change the disallowed regex from `radius-(sm|md|lg|full)` to `radii-(?:sm|md|lg|xl|full)`, and extend the color-primitive family list from `(blue|slate)` to `(?:blue|slate|emerald|red|green|amber|white|black)`. Run `npm run lint:tokens` (or `npm run lint`) → still green (no component currently violates; the guard is now real).

- [ ] **Step 2: Remove the dead `--ui-focus-ring-offset` token** from the token source (`libs/ui/tokens/tokens/semantic.json` or wherever it is defined — `grep -rn "focus-ring-offset" libs/ui/tokens`), then `npm run build:tokens` and confirm it's gone from `dist/tokens.css`. (No component consumes it — confirmed by the audit.) Run lint.

- [ ] **Step 3: Make `OnyxTabComponent.active` protected** — `protected readonly active = signal(false)`. If `OnyxTabsComponent` sets it directly, route through a method like the accordion fix. Run typecheck + tabs specs.

- [ ] **Step 4: Move `OnyxAlertComponent` role to the host**

In `alert.component.ts`, add `'[attr.role]': 'role()'` to the `host` object (keep `[hidden]`), and remove `[attr.role]` from the inner `<div>` in `alert.component.html`. Update/confirm the alert spec asserts the role on the host element. Run alert specs.

- [ ] **Step 5: Full gate + commit**

Run: `npm run typecheck && npm test && npm run lint && npx nx build ui-components`.

```bash
git add .stylelintrc.js libs/ui/tokens libs/ui/components/tabs libs/ui/components/alert
git commit -m "fix(ui): stylelint guard correctness, drop dead focus-ring-offset, protect internal signals, alert role on host"
```

---

### Task 8: Theming — class convention, load-order docs, dark-aware shadows

**Files:** `libs/ui/themes/dark.css`, `libs/ui/themes/acme.css`; `libs/ui/tokens/tokens/{semantic,component}.json` + rebuilt `dist/tokens.css`; `apps/docs` theme service + any hardcoded theme-class strings; `libs/ui/components/PACKAGING.md` (load-order note).

**Interfaces:**

- Produces: a documented theme-class convention — `.onyx-dark` (mode) and `.onyx-theme-<name>` (brand) — applied consistently; semantic shadow tokens that dark mode overrides; the mandatory `tokens.css`-before-theme load order documented.

- [ ] **Step 1: Standardize theme classes**

Rename the activation class in `dark.css` from `.app-dark` to `.onyx-dark`, and in `acme.css` from `.ui-theme-acme` to `.onyx-theme-acme`. Update `apps/docs` where these strings are hardcoded (`grep -rn "app-dark\|ui-theme-acme" apps/docs libs`) — the docs `ThemeService` and any toggle. Run `npx nx build docs` → green; verify the docs toggle still switches themes (the build + existing docs specs, if any).

- [ ] **Step 2: Add semantic shadow tokens + dark override**

In the token source, add a semantic shadow token (e.g. `color.shadow.base`) and point the component shadow tokens (`dialog.shadow`, `menu.shadow`, `select.shadow`, `popover.shadow`, `tooltip.shadow`, `card.shadow`) at it instead of raw `rgba(15,23,42,…)`. Add a dark-mode override for the semantic shadow in `dark.css`. Run `npm run build:tokens`; confirm `dist/tokens.css` resolves and `dark.css` overrides the shadow. Run lint.

- [ ] **Step 3: Document load order** in `libs/ui/components/PACKAGING.md`: state explicitly that `styles/tokens.css` MUST be imported before any `styles/themes/*.css`, and document the `.onyx-dark` / `.onyx-theme-<name>` activation classes (toggle on `document.documentElement`). Add a one-line header comment to `dark.css`/`acme.css`: `/* Requires styles/tokens.css to be loaded first */`.

- [ ] **Step 4: Full gate + commit**

Run: `npm run typecheck && npm test && npm run lint && npx nx build ui-components && npx nx build docs`.

```bash
git add libs/ui/themes libs/ui/tokens libs/ui/components/PACKAGING.md apps/docs
git commit -m "feat(ui): standardize theme classes (onyx-dark/onyx-theme-*), dark-aware shadows, document load order"
```

---

## Self-Review

**Spec coverage (Plan B):** rename selectors+directives+exportAs (Task 1) + class names (Task 2); exportAs additions + internal Tooltip/Popover hidden (Task 3); Select invalid/size/label (Task 4); Popover focus + Button loading a11y (Task 5); Accordion protected/host-export/keyboard (Task 6); minors — stylelint regex+blocklist, dead token, Tab.active protected, Alert role (Task 7); theming class convention + dark shadows + load-order docs (Task 8). ✅ Matches the spec's Plan B scope.

**Placeholder scan:** the rename tasks specify exact `grep`/`perl` transforms + the authoritative grep gate; the fix tasks give concrete inputs/host-bindings and name the sibling pattern file to copy (input → select, tabs → accordion) rather than reproducing the whole component — this is precise, not a placeholder, because the existing sibling code is the source of truth and the test gate enforces correctness.

**Consistency:** rename scope is fixed (selectors + TS class names + directive selectors/exportAs only; CSS classes `.ui-*` and tokens `--ui-*` explicitly untouched) and stated identically in Global Constraints and Task 1/2. New class names use the `Onyx<Base><Component|Directive>` form consistently. The 212-test suite + build are the gate after every task.

**Out of scope (Plan C):** README/CONTRIBUTING/CHANGELOG, CI, semantic-release, docs-site deploy.
