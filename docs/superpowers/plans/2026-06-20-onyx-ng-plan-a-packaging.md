# onyx-ng Plan A — Packaging & Publication Enablement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the Nx-internal `@onyx/ui/components` library into a buildable, `npm pack`-valid Angular package `@robertruben98/onyx-ui` publishable to private GitHub Packages.

**Architecture:** Add an `ng-packagr` build for `libs/ui/components` producing a standard Angular Package Format dist (fesm2022 + `.d.ts` + generated `package.json`). Keep `@onyx/ui/primitives` internal (resolved via tsconfig path and inlined by ng-packagr — NOT a public entry point in v0.1). Strip docs/demo symbols from the public barrels. Ship the compiled token + theme CSS as package assets.

**Tech Stack:** Angular 19, Nx, `ng-packagr`, TypeScript 5.6, style-dictionary (token CSS already built to `libs/ui/tokens/dist/tokens.css`).

## Global Constraints

- Branch: `feature/distributable-v0.1` (NOT main/agent-dialog-feature — a hook blocks protected branches). Commit messages: NO "Co-Authored-By"/"Generated with"/AI-attribution markers (a hook blocks them). Keep commits < 1000 changed lines (a hook blocks larger; the barrel edit touches 22 small files — fine).
- Package name `@robertruben98/onyx-ui`; version `0.1.0`; private GitHub Packages registry `https://npm.pkg.github.com`.
- The build is `ng-packagr`. The exact wiring (builder vs CLI, tsconfig discovery) must match the **installed** ng-packagr/Angular version — adjust as needed and report what was used. Prefer the most robust working approach.
- `@angular/*`, `@angular/cdk`, `rxjs`, `tslib`, `zone.js` are **peerDependencies** of the published library, NOT `dependencies`. `@angular/compiler` and `@angular/platform-browser-dynamic` are NOT needed as peers for a component library.
- `*.docs.ts` and `*.demos.ts` must NOT be in the published public API (they drag in `@onyx/ui/docs-model` + 41 demo components). The docs app imports them by direct relative path and is unaffected.
- Do NOT change component selectors/class names in this plan (that is Plan B). Do NOT remove the internal `TooltipComponent`/`PopoverComponent` exports here (also Plan B).
- After each task, the existing suites must stay green: `npm test`, `npm run typecheck`, `npm run lint`, and the docs app must still build (`npx nx build docs` or the project's docs build command).

---

### Task 1: ng-packagr build target for the library

**Files:**

- Modify: `package.json` (root — add ng-packagr to devDependencies)
- Create: `libs/ui/components/ng-package.json`
- Create: `libs/ui/components/tsconfig.lib.json`
- Create: `libs/ui/components/package.json`
- Modify: `libs/ui/components/project.json` (add `build` target)

**Interfaces:**

- Produces: an `nx build ui-components` (or equivalent) command that emits an Angular Package Format build to `dist/onyx-ui/` containing `fesm2022/`, `esm2022/`, `index.d.ts`, and a generated `package.json`. Later tasks add assets + barrel cleanup on top.

- [ ] **Step 1: Install ng-packagr (dev)**

Run: `npm install -D ng-packagr@^19`
Expected: installs without peer-dep errors (Angular 19 is present). If the resolved ng-packagr major differs from Angular's, pin to match Angular 19.

- [ ] **Step 2: Create `libs/ui/components/package.json`** (the publishable manifest)

```json
{
  "name": "@robertruben98/onyx-ui",
  "version": "0.1.0",
  "description": "Onyx NG — Angular design-system component library (token-driven).",
  "license": "MIT",
  "sideEffects": false,
  "peerDependencies": {
    "@angular/animations": ">=19.0.0",
    "@angular/cdk": ">=19.0.0",
    "@angular/common": ">=19.0.0",
    "@angular/core": ">=19.0.0",
    "@angular/forms": ">=19.0.0",
    "@angular/platform-browser": ">=19.0.0",
    "@angular/router": ">=19.0.0",
    "rxjs": ">=7.0.0",
    "tslib": ">=2.0.0",
    "zone.js": ">=0.15.0"
  },
  "dependencies": {},
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

- [ ] **Step 3: Create `libs/ui/components/tsconfig.lib.json`**

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc/ui-components",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": [
    "**/*.spec.ts",
    "**/*.docs.ts",
    "**/*.demos.ts",
    "jest.config.ts",
    "setup-jest.ts"
  ],
  "include": ["**/*.ts"]
}
```

Note: `tsconfig.base.json` has `declaration: false` and `moduleResolution: "bundler"`; this lib config overrides `declaration: true`. It inherits the `@onyx/ui/primitives` path mapping so ng-packagr resolves and inlines the primitives source. If ng-packagr rejects `moduleResolution: "bundler"`, add `"moduleResolution": "node"` here and report it.

- [ ] **Step 4: Create `libs/ui/components/ng-package.json`**

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../../dist/onyx-ui",
  "lib": {
    "entryFile": "index.ts"
  }
}
```

(Assets are added in Task 3.)

- [ ] **Step 5: Add the `build` target to `libs/ui/components/project.json`**

Add this target alongside the existing `test`/`lint`/`typecheck` (use ng-packagr CLI via `nx:run-commands` for robustness; if you prefer the `@angular-devkit/build-angular:ng-packagr` builder and it works with the installed version, that is acceptable — report which you used):

```json
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "ng-packagr -p libs/ui/components/ng-package.json -c libs/ui/components/tsconfig.lib.json",
        "outputs": ["{workspaceRoot}/dist/onyx-ui"]
      }
    }
```

- [ ] **Step 6: Build and verify the package output**

Run: `npx nx build ui-components` (or `npx ng-packagr -p libs/ui/components/ng-package.json -c libs/ui/components/tsconfig.lib.json`)
Expected: completes successfully and `dist/onyx-ui/` contains `fesm2022/`, `esm2022/` (or `index.d.ts` set), `index.d.ts`, and a generated `package.json` whose `name` is `@robertruben98/onyx-ui` and `version` `0.1.0`.
Verify: `ls dist/onyx-ui && cat dist/onyx-ui/package.json | head -20`
If the build fails on `@onyx/ui/primitives` resolution, ensure `tsconfig.lib.json` inherits the base `paths`; report any change needed.

- [ ] **Step 7: Confirm existing suites still pass**

Run: `npm run typecheck && npm test && npm run lint`
Expected: all green (this task added files but changed no component source).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json libs/ui/components/ng-package.json \
        libs/ui/components/tsconfig.lib.json libs/ui/components/package.json \
        libs/ui/components/project.json
git commit -m "build(ui): add ng-packagr library build for @robertruben98/onyx-ui"
```

---

### Task 2: Remove docs/demo symbols from the public barrels

**Files:**

- Modify: all 22 `libs/ui/components/<name>/index.ts` that re-export `./<name>.docs` (and any `./<name>.demos`)

**Interfaces:**

- Consumes: the build from Task 1.
- Produces: a public API (`libs/ui/components/index.ts` transitive) that exports only component classes + their public types — no `*Doc` constants, no demo components, no `@onyx/ui/docs-model` dependency in the emitted `.d.ts`.

- [ ] **Step 1: Find the docs/demo re-exports**

Run: `grep -rn "\.docs\"\|\.demos\"" libs/ui/components/*/index.ts`
Expected: ~22 lines like `export * from "./button.docs";` (one per component; some components may also re-export `*.demos`).

- [ ] **Step 2: Remove those re-export lines**

For every component `index.ts`, delete the `export * from "./<name>.docs";` (and `export * from "./<name>.demos";` if present) line, leaving the component/directive exports (e.g. `export * from "./button.component";`). Do NOT delete the `*.docs.ts`/`*.demos.ts` files themselves — the docs app still imports them by direct path.

Example — `libs/ui/components/button/index.ts` becomes:

```ts
export * from "./button.component";
```

- [ ] **Step 3: Verify no docs/demo leakage remains in the public barrels**

Run: `grep -rn "\.docs\"\|\.demos\"" libs/ui/components/*/index.ts`
Expected: no output.

- [ ] **Step 4: Rebuild and confirm the emitted types are clean**

Run: `npx nx build ui-components && grep -rl "docs-model\|Demo\b" dist/onyx-ui/*.d.ts dist/onyx-ui/**/*.d.ts 2>/dev/null || echo "clean"`
Expected: `clean` (no `docs-model`/`Demo` references in the published `.d.ts`). The build must still succeed.

- [ ] **Step 5: Confirm suites + docs app still build**

Run: `npm run typecheck && npm test && npm run lint`
Then build the docs app: `npx nx build docs` (or the project's docs build target — discover it via `cat apps/docs/project.json`).
Expected: all green; the docs app builds (it imports `*.docs`/`*.demos` by direct relative path, not via the barrel).
If the docs app imported docs symbols through `@onyx/ui/components` anywhere, fix those imports to direct paths and report it.

- [ ] **Step 6: Commit**

```bash
git add libs/ui/components/*/index.ts apps/docs
git commit -m "refactor(ui): drop docs/demos re-exports from public component barrels"
```

---

### Task 3: Package assets (token + theme CSS), `.npmrc`, and `npm pack` verification

**Files:**

- Modify: `libs/ui/components/ng-package.json` (add `assets`)
- Modify: `libs/ui/components/package.json` (add `files` if needed for assets; confirm `sideEffects`)
- Create: `.npmrc` (repo root)
- Create: `libs/ui/components/PACKAGING.md` (short consumer import note; full README is Plan C)
- Modify: `.gitignore` (ensure `dist/` is ignored; add `dist/storybook/` if not covered)

**Interfaces:**

- Consumes: Tasks 1–2.
- Produces: a `dist/onyx-ui/` that, when `npm pack`ed, includes the component `.d.ts` + the token/theme CSS and EXCLUDES specs/docs/demos; a root `.npmrc` scoping `@robertruben98` to GitHub Packages.

- [ ] **Step 1: Ensure the token CSS is built**

Run: `npm run build:tokens && ls libs/ui/tokens/dist/tokens.css`
Expected: `tokens.css` exists (the pipeline output the assets step will ship).

- [ ] **Step 2: Add assets to `libs/ui/components/ng-package.json`**

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../../dist/onyx-ui",
  "lib": {
    "entryFile": "index.ts"
  },
  "assets": [
    { "input": "../tokens/dist", "glob": "tokens.css", "output": "styles" },
    { "input": "../themes", "glob": "*.css", "output": "styles/themes" }
  ]
}
```

This copies `tokens.css` → `dist/onyx-ui/styles/tokens.css` and themes → `dist/onyx-ui/styles/themes/*.css`. If the installed ng-packagr uses a different `assets` schema (string globs vs objects), adapt to a form that produces the same `styles/` layout and report it.

- [ ] **Step 3: Add the root `.npmrc`**

```
@robertruben98:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

(`NODE_AUTH_TOKEN` is provided by CI/consumers via env — never commit a real token. This file is safe to commit: it contains only the env-var reference.)

- [ ] **Step 4: Write `libs/ui/components/PACKAGING.md`** (concise consumer note)

```markdown
# Consuming @robertruben98/onyx-ui

Private package on GitHub Packages. In the consuming project add an `.npmrc`:

    @robertruben98:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}

(`NODE_AUTH_TOKEN` = a GitHub PAT with `read:packages`.) Then:

    npm install @robertruben98/onyx-ui

Load the global styles **in this order** (tokens first, then an optional theme):

    "node_modules/@robertruben98/onyx-ui/styles/tokens.css",
    "node_modules/@robertruben98/onyx-ui/styles/themes/dark.css"

Import components from `@robertruben98/onyx-ui`. Requires Angular 19 (peer dependency).
```

- [ ] **Step 5: Rebuild, pack, and assert tarball contents**

Run:

```bash
npx nx build ui-components
cd dist/onyx-ui && npm pack --dry-run 2>&1 | tee /tmp/pack.txt; cd -
```

Expected (assert against `/tmp/pack.txt`):

- INCLUDES: `index.d.ts`, `fesm2022/*`, `package.json`, `styles/tokens.css`, `styles/themes/dark.css`, `styles/themes/acme.css`.
- EXCLUDES: any `*.spec.*`, `*.docs.*`, `*.demos.*`, `project.json`, `tsconfig*.json`.

Verify with greps:

```bash
grep -q "styles/tokens.css" /tmp/pack.txt && echo "tokens OK"
grep -q "styles/themes/dark.css" /tmp/pack.txt && echo "theme OK"
! grep -qE "\.spec\.|\.docs\.|\.demos\." /tmp/pack.txt && echo "no test/docs leak"
```

All three must print their OK line. If assets are missing, fix the `assets` config (Step 2) and re-pack.

- [ ] **Step 6: Ensure `dist/` (and `dist/storybook/`) are git-ignored**

Run: `grep -q "^/\?dist" .gitignore && echo "dist ignored" || echo "ADD dist/ to .gitignore"`
If not ignored, add `dist/` to `.gitignore`. Confirm `git status` shows no `dist/` artifacts staged.

- [ ] **Step 7: Final green check**

Run: `npm run typecheck && npm test && npm run lint`
Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add libs/ui/components/ng-package.json libs/ui/components/package.json \
        libs/ui/components/PACKAGING.md .npmrc .gitignore
git commit -m "build(ui): ship token/theme CSS assets + GitHub Packages .npmrc"
```

---

## Self-Review

**Spec coverage (Plan A scope):** ng-packagr build + `ng-package.json` + `tsconfig.lib.json` (Task 1); library `package.json` with peerDeps/publishConfig/sideEffects (Task 1, Step 2 — peers declared there, root `dependencies` stay for the workspace build and are overridden by the published manifest's empty `dependencies` + peers); barrel docs/demos removal (Task 2); primitives kept internal/inlined (Task 1 note); token+theme assets shipped (Task 3); `.npmrc` (Task 3); pack-content verification (Task 3, Step 5). ✅

**Note on peerDependencies vs root dependencies:** the published manifest is `libs/ui/components/package.json` (its `dependencies: {}` + `peerDependencies` are what consumers see). Root `package.json` keeps Angular in `dependencies` for the monorepo's own build — that is correct and not shipped. No root dependency move is required for correctness; if a reviewer wants the root cleaned too, that is cosmetic and out of Plan A scope.

**Placeholder scan:** no TBD/TODO; every step has concrete commands/content. ng-packagr config specifics are explicitly "adjust to installed version + report" because the exact builder/asset schema depends on the resolved ng-packagr version — this is a verification instruction, not a missing value.

**Type/contract consistency:** package name `@robertruben98/onyx-ui` and `dist/onyx-ui` dest are consistent across Tasks 1–3; the `styles/` asset layout in Task 3 matches the import paths documented in PACKAGING.md.

**Out of scope (later plans):** the `ui-`→`onyx-` rename, internal `Tooltip/PopoverComponent` export removal, API/a11y fixes (Plan B); CI, semantic-release, README/CONTRIBUTING/CHANGELOG, docs deploy (Plan C).
