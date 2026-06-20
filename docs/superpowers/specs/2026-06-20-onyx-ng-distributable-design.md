# onyx-ng → Distributable Library (v0.1) — Design Spec

**Date:** 2026-06-20
**Status:** Approved (design); plans in progress
**Base branch:** `agent-dialog-feature` (audited tree, includes the pro docs site)
**Work branch:** `feature/distributable-v0.1`

## 1. Goal

Make **onyx-ng** consumable by other projects as a published, versioned Angular library
(`@robertruben98/onyx-ui` on private GitHub Packages), and polish its public API,
accessibility, and DX to a credible **v0.1** before first publication.

This is the prerequisite ("Phase 0") for the `payments-lab` frontend, and a general
hardening so any project can adopt onyx-ng.

## 2. Background — audit summary

A five-dimension read-only audit (packaging, public API, tokens/theming, component
architecture, DX/CI) found the component layer is strong — 22 components, all `OnPush` +
signal inputs/outputs + standalone + new control flow, all with `jest-axe` tests, a
three-tier design-token system, conventional commits enforced by a git hook. **The gaps
are entirely in the distribution and public-API layer**, plus a set of consistency/a11y
fixes. Full findings live in section 6.

## 3. Locked decisions

- **Package:** `@robertruben98/onyx-ui`, private GitHub Packages (`https://npm.pkg.github.com`).
- **Build:** `ng-packagr` via `@angular-devkit/build-angular:ng-packagr` (no `@nx/angular` dependency added).
- **Rename (breaking, pre-v1):** selectors `ui-*` → `onyx-*`, attribute directives `[uiX]` → `[onyxX]`, and class names `XxxComponent` → `OnyxXxxComponent` (Material-style). Done before first publish so there are no downstream breaks.
- **Release:** `semantic-release` driven by the already-enforced conventional commits; publishes on tag to GitHub Packages and generates `CHANGELOG.md`.
- **Scope:** all Critical + Important findings, plus the cheap Minors touched along the way; **includes** deploying the docs site.
- **Docs deploy target:** the **VPS** (`onyx.a-robertdev.com`, already referenced in the docs `og:url`), via the existing `deploy-vps` workflow — not GitHub Pages (repo is private).

## 4. Non-goals (v0.1)

- No component rewrites; behavior is preserved (the rename is mechanical + targeted fixes).
- No new components.
- No public (non-GitHub-Packages) npm release.
- No migration tooling/schematics (`ng-add`) — documented manual setup is enough for v0.1.

## 5. Plan decomposition

Three sequential plans, each leaving the repo green and independently reviewable:

### Plan A — Packaging & publication enablement

The unblocker. Produces a buildable, `npm pack`-valid library.

- Add `ng-packagr` + `libs/ui/components/ng-package.json` + `libs/ui/components/tsconfig.lib.json` (`declaration: true`).
- Add `libs/ui/components/package.json`: `name: @robertruben98/onyx-ui`, `version: 0.1.0`, `peerDependencies` (Angular/CDK/rxjs/tslib/zone.js moved out of root `dependencies`), `publishConfig` (GitHub Packages registry), `sideEffects: false`, `files`.
- Add a `build` target to `libs/ui/components/project.json`.
- **Remove `*.docs.ts` / `*.demos.ts` re-exports** from all 22 component `index.ts` barrels (they pull 41 demo components + a `docs-model` dependency into the consumer bundle). The docs app already imports docs symbols by direct path, so it is unaffected.
- Resolve `@onyx/ui/primitives` for the packaged build (secondary entry point or inlined).
- Ship `tokens.css` + theme CSS as package assets; add a root `.npmrc` scoping `@robertruben98` to GitHub Packages with a `${NODE_AUTH_TOKEN}` placeholder.
- Verify: `nx build` produces `dist/.../{fesm2022,esm2022,index.d.ts,package.json}`; `npm pack` contents are correct (no specs, no `*.docs.ts`, includes CSS).

### Plan B — Rename + API/a11y fixes

- Rename `ui-*`→`onyx-*` selectors, `[uiX]`→`[onyxX]` directives, `XxxComponent`→`OnyxXxxComponent` classes across the 26 component/directive files, their templates, specs, barrels, and the docs app. Keep all tests green.
- Stop exporting internal `TooltipComponent` / `PopoverComponent` (directive-only public API).
- **Select:** add `invalid`, `size`, `label` inputs (parity with the other CVA controls).
- **Popover:** restore focus to the trigger on `close()`.
- **Button:** loading uses `aria-disabled` (not native `disabled`) so `aria-busy` is announced; keep the double-submit guard.
- **Accordion:** make `expanded` `protected`, export `ACCORDION_HOST`, add ArrowUp/Down/Home/End keyboard navigation.
- Minors folded in: stylelint regex `radius-`→`radii-` and color-primitive blocklist; add `exportAs` to dialog/menu/tabs; remove dead `--ui-focus-ring-offset` (or wire it); mark internal coordination signals `protected`; move `alert` `role` to the host.
- **Theming:** standardize theme classes (`.onyx-dark` for mode, `.onyx-theme-<name>` for brand), document the mandatory `tokens.css`-before-theme load order, and make dialog/menu/popover/card shadows dark-mode aware via semantic shadow tokens.

### Plan C — DX, CI, release, docs deploy

- Root `README.md` (install, peer deps, quick-start, theming, link to docs), `CONTRIBUTING.md`, `CHANGELOG.md` stub.
- `.github/workflows/ci.yml`: `npm ci` → `nx run ui-tokens:build` → `typecheck` → `lint` (eslint + stylelint) → `test --coverage` (with a coverage gate in `jest.config.js`) → build docs (smoke) → build library.
- `.github/workflows/publish.yml`: on `v*` tag, run CI then `semantic-release` publish to GitHub Packages.
- Deploy the docs site to the VPS (`onyx.a-robertdev.com`) via the `deploy-vps` workflow.

## 6. Audit findings (reference)

**Critical (block publish/consume):** no library build (`ng-packagr`/`declaration:true`); not a package (`private`, no scoped `package.json`/`publishConfig`); Angular/CDK in `dependencies` not `peerDependencies`; `*.docs.ts` re-exported into public barrel (41 demo components leak); tokens/themes not packaged + no consumer `.npmrc`; no CI.

**Important:** internal `Tooltip/PopoverComponent` exported; `Select` missing `invalid`/`size`/`label`; `Popover.close()` drops focus; `Button` loading silences `aria-busy`; accordion `expanded` public-mutable, no keyboard nav, `ACCORDION_HOST` unexported; empty README; no CHANGELOG/versioning; no CONTRIBUTING; no coverage gate; docs site undeployed; theme class inconsistency + undocumented load order + non-dark-aware shadows.

**Minor:** `ui-` prefix vs `@onyx` scope (resolved by the rename); stylelint `radius-`/`radii-` regex bug + incomplete color blocklist; dead `--ui-focus-ring-offset`; missing `exportAs`; public internal signals; `alert` role on inner div; `dist/storybook/` not gitignored; missing version badge/compat matrix.

## 7. Testing & verification strategy

- **Plan A:** build + `npm pack` content assertions; tarball excludes specs/docs/demos and includes the component `.d.ts` + CSS; a smoke "consume from tarball" check if feasible.
- **Plan B:** the existing Jest + jest-axe suites must stay green after the rename and fixes; add tests for the new `Select` inputs, `Popover` focus restore, accordion keyboard nav, and `Button` loading a11y.
- **Plan C:** CI runs the full gate; `semantic-release --dry-run` validates the release config; docs deploy verified by the `deploy-vps` post-deploy health check.

Each plan is executed subagent-driven (fresh implementer + per-task spec/quality review, broad final review), as the payments-lab backend was.
