# Contributing to Onyx UI

Thank you for contributing. This guide covers the development setup, project conventions, and the rules enforced by tooling.

---

## Prerequisites

- **Node.js ≥ 22.** That is the floor declared in `engines.node`, and CI runs the full
  gate suite on **both** Node 22 and Node 24. Either is fine to develop on; you do not
  need to match a single version.
- **npm `^10.5.0 || >=11.7.0`.** This range is declared in `engines.npm` and it excludes
  npm 11.0–11.6 deliberately. See below.
- Install with **`npm ci`**, not `npm install`. `npm ci` installs exactly what the
  lockfile pins and never rewrites it.

```bash
npm ci
```

### Why npm 11.0–11.6 is excluded

npm 11.0–11.6 writes 45 spurious `"peer": true` flags into `package-lock.json` that no
other npm writes. Every other npm — 10.5.0 through 10.9.9, 11.7.0 and later, and 12.x —
recomputes the tree without them and rewrites the file on install. The result was a
49-line lockfile diff on every `npm install` that nobody asked for, which buried real
dependency changes.

If you are on an npm inside that range, `npm install` prints
`npm warn EBADENGINE` naming the supported range, and any lockfile churn it produces is
caught by the **Lockfile is a fixed point** step in CI. npm 11.6.2 is the build bundled
with Node 24.11.x specifically, so if you use that Node version, upgrade npm:

```bash
npm install -g npm@^11.7.0     # or any npm ≥ 11.7
```

The check is not advisory: if the committed lockfile is not exactly what `npm install`
produces, CI fails.

---

## Branching

The `main` ref in a long-lived clone goes stale quickly. **Always branch from the
remote**, never from a local `main` you have not just updated:

```bash
git fetch origin
git switch -c my-branch origin/main
```

Branching from a stale local `main` gives you a tree that looks fine and is dozens of
commits behind, and the mistake is invisible until the PR diff is wrong.

---

## Dev commands

| Command                | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| `npx nx serve docs`    | Start the docs app at `http://localhost:4200` (live demos + API) |
| `npm test`             | Run the full Jest test suite                                     |
| `npm run lint`         | ESLint + Stylelint (token-rule enforcement)                      |
| `npm run build:tokens` | Compile Style Dictionary tokens → CSS custom properties          |
| `npm run typecheck`    | TypeScript strict check (no emit)                                |

**Two of those scripts chain with `&&`, which short-circuits.** `npm run lint` is
`eslint . && npm run lint:tokens`, so a single ESLint error means Stylelint never runs
and you see no token-rule result at all — that is how 12 Stylelint errors once reached a
shared branch unseen. `npm run typecheck` chains the library and spec checks the same
way. When you want a complete picture, run the halves separately:

```bash
npx eslint .            # ESLint alone
npm run lint:tokens     # Stylelint / design-token rules alone
npm run typecheck:lib   # library sources
npm run typecheck:spec  # spec files
```

CI deliberately runs them as separate steps for this reason, so each gate reports its own
result.

---

## Component anatomy

Every component lives in `libs/ui/components/<name>/` with exactly these seven files:

```
<name>.component.ts       Logic + API (signal inputs/outputs)
<name>.component.html     Template (new Angular control flow)
<name>.component.scss     Styles (semantic/component tokens only)
<name>.component.spec.ts  Interaction + a11y tests (jest-axe)
<name>.docs.ts            Doc metadata (description + API table)
<name>.demos.ts           Live demos (one per variant/state)
index.ts                  Public barrel (re-exports the component class)
```

---

## Naming conventions

- **Selector prefix:** `onyx-*` (e.g. `onyx-button`, `onyx-dialog`)
- **Class prefix:** `Onyx*` (e.g. `OnyxButtonComponent`, `OnyxDialogComponent`)
- All components are **standalone** — no NgModules.

---

## Angular conventions

The project enforces these patterns; PRs that deviate will be rejected by lint or code review:

- Signal inputs/outputs: `input()`, `input.required()`, `output()`, `model()`. No `@Input()`/`@Output()` decorators.
- State: `signal()`, `computed()`, `effect()`. No manual `BehaviorSubject` for component state.
- DI: `inject()` only. No constructor injection.
- `ChangeDetectionStrategy.OnPush` on every component.
- New control flow: `@if`, `@for`, `@switch`. Never `*ngIf` / `*ngFor`.
- Overlay / focus-trap / positioning: wrap `@angular/cdk` primitives. Do not reimplement.

---

## Design tokens

Components must reference only **semantic** or **component-level** tokens (`--ui-color-*`, `--ui-button-*`). Direct use of primitive tokens (`--ui-blue-500`) or hardcoded values (`#fff`, `12px`) is rejected by the Stylelint rule.

Token compilation:

```bash
npm run build:tokens
```

---

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). **Nothing
in the repository enforces this for you** — there is no committed hook, and no husky,
commitlint or lint-staged dependency. The format is enforced by review, and it is
load-bearing regardless: `@semantic-release/commit-analyzer` parses these messages to
decide the next version, so a malformed subject silently produces the wrong release.

**Format:**

```
<type>(<scope>): <subject>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`.

**Breaking changes** — the `!` shorthand is **rejected** by the hook. Use a `BREAKING CHANGE:` footer instead:

```
feat(button): rename variant prop

BREAKING CHANGE: `kind` input renamed to `variant`.
```

---

## patch-package

An ng-packagr patch is committed under `patches/` and applied automatically via `postinstall`. Do not remove or modify the patch file unless you are intentionally updating the ng-packagr fix.

---

## Dependency updates

Dependabot checks npm packages and GitHub Actions every Monday. Minor and patch updates are grouped by ecosystem; major updates remain separate so their migration and compatibility impact can be reviewed independently.

Angular major upgrades must:

1. Update Angular framework, CLI, CDK, compiler, and build packages together.
2. Follow the official Angular update guide and document required migrations in the PR.
3. Keep the library compatible with the Angular versions declared in its peer dependencies.
4. Pass tests, lint, typecheck, token generation, library packaging, and the docs build before merge.
5. Include a release note when the supported Angular range or public behavior changes.

Dependency PRs are not auto-merged. A maintainer must confirm the CI result and review lockfile or workflow changes before merge.

---

## Pull requests

- Open PRs against the `main` branch.
- Two checks are **required** by branch protection and block the merge:
  **`Quality gates (22)`** and **`Quality gates (24)`**. A matrix produces one check per
  leg and there is no un-suffixed parent, so both names must be required — requiring
  `Quality gates` alone matches nothing.
- **Never require `build-test`.** That job no longer exists; the current workflow
  replaced it and runs every one of its steps. A required check that can never report
  blocks every PR permanently.
- Squash-merge is preferred; the PR title becomes the merge commit message and must follow the conventional-commit format above.
