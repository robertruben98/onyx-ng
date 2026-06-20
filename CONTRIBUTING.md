# Contributing to Onyx UI

Thank you for contributing. This guide covers the development setup, project conventions, and the rules enforced by tooling.

---

## Prerequisites

- **Node.js** — run `node --version` and match the version in use by the project (currently v24).
- **npm** — use `npm ci` (not `npm install`) to install exact locked dependencies.

```bash
npm ci
```

---

## Dev commands

| Command                | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| `npx nx serve docs`    | Start the docs app at `http://localhost:4200` (live demos + API) |
| `npm test`             | Run the full Jest test suite                                     |
| `npm run lint`         | ESLint + Stylelint (token-rule enforcement)                      |
| `npm run build:tokens` | Compile Style Dictionary tokens → CSS custom properties          |
| `npm run typecheck`    | TypeScript strict check (no emit)                                |

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

This project uses [Conventional Commits](https://www.conventionalcommits.org/). A git hook validates every commit message before it is accepted.

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

## Pull requests

- Open PRs against the `main` branch.
- All checks (tests, lint, typecheck) must be green.
- Squash-merge is preferred; the PR title becomes the merge commit message and must follow the conventional-commit format above.
