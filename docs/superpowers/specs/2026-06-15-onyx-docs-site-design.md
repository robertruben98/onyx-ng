# Onyx Docs Site — Design

**Date:** 2026-06-15
**Status:** Approved
**Topic:** Replace Storybook with a self-owned Angular documentation site (PrimeNG-style).

## Goal

Stop depending on Storybook. Build an owned Angular SPA that showcases every
`@onyx/ui` component with live demos, source code, an API table, and a live
theme switcher — the way PrimeNG documents its library. Same public URL
(`https://onyx.a-robertdev.com`).

## Decisions (locked)

- **Storybook:** fully removed (deps, config, `*.stories.ts`).
- **v1 features:** sidebar nav + live demo, view source code, API/props table,
  theme switcher (light/dark + presets).
- **Doc content:** hybrid — hand-authored metadata per component, structured so
  the API rows can later be swapped for generated data without changing the
  rendering layer. No compodoc (its signal-input `input()` support is the weak
  link).

## Architecture

Convert `apps/docs` from a Storybook host into a real Angular SPA. The existing
`docs:build` target (`@angular-devkit/build-angular:browser`, output `dist/docs`,
already loading `libs/ui/tokens/dist/tokens.css` + `libs/ui/themes/dark.css`) is
reused. Add a `docs:serve` target. Routing via `@angular/router` (already a
dependency); CDK is NOT required and stays uninstalled.

### App shell

```
┌──────────────────────────────────────────────┐
│ Onyx UI            [☀/🌙]  [theme: default ▾]  │  topbar: theme controls
├───────────┬──────────────────────────────────┤
│ <sidebar> │  <router-outlet> component page   │
└───────────┴──────────────────────────────────┘
```

- `AppComponent` (shell): topbar + sidebar + `<router-outlet>`. OnPush, standalone.
- `SidebarComponent`: lists components from the registry; `routerLink` per item.
- `ThemeControlsComponent`: dark toggle + preset selector (see Theming).

### Routing

- `/` → redirect to first component (or a short intro page).
- `/components/:id` → `ComponentPageComponent`, resolves the `ComponentDoc` from
  the registry by `id`. Unknown id → redirect to first component.

## Doc data model

Each component gains two co-located files in its folder
(`libs/ui/components/<name>/`):

- `<name>.docs.ts` — exports a typed `ComponentDoc`:
  ```ts
  interface ApiRow {
    name: string;
    type: string;
    default: string;
    description: string;
  }
  interface ComponentDoc {
    id: string; // route segment, e.g. 'button'
    title: string; // 'Button'
    description: string; // prose (1–3 sentences)
    api: ApiRow[]; // inputs/outputs; outputs noted as '(name)'
    demos: Demo[]; // imported from <name>.demos.ts
  }
  ```
- `<name>.demos.ts` — exports `Demo[]`. **Single-source-of-truth trick:** each
  demo is a real standalone component whose `template` IS the code string:

  ```ts
  const variantsCode = `<ui-button variant="primary">Primary</ui-button>
  <ui-button variant="secondary">Secondary</ui-button>`;

  @Component({
    standalone: true,
    imports: [ButtonComponent],
    template: variantsCode,
  })
  class ButtonVariantsDemo {}

  export const buttonDemos: Demo[] = [
    { title: "Variants", code: variantsCode, component: ButtonVariantsDemo },
  ];
  ```

  `interface Demo { title: string; description?: string; code: string; component: Type<unknown>; }`

A central `apps/docs/src/app/registry.ts` imports every `ComponentDoc` and
exports `COMPONENT_DOCS: ComponentDoc[]`. Sidebar and routes derive from it.
Shared doc interfaces live in `apps/docs/src/app/doc-model.ts`.

> Rationale for co-locating `.docs.ts`/`.demos.ts` in the lib (not the app):
> they reference the component's own public API and keep docs next to code, and
> the registry pulls them via the public barrel. Trade-off: the lib gains doc
> metadata files; acceptable and consistent with the per-component anatomy.

## Rendering

- `ComponentPageComponent`: renders `title`, `description`, then each demo via
  `DemoBlockComponent`, then `ApiTableComponent`.
- `DemoBlockComponent`: live render with `<ng-container *ngComponentOutlet>`
  (using new control flow where applicable) + a collapsible code panel.
- `CodeBlockComponent`: `<pre><code>` with the `code` string + a copy button
  (`navigator.clipboard.writeText`). No syntax highlighting in v1 (YAGNI).
- `ApiTableComponent`: renders `ApiRow[]` as a table (name / type / default /
  description).

All docs UI is plain styled markup using the project's own design tokens where
practical; this is the app layer, not the component library, so the strict
token-only Stylelint rule (scoped to `libs/ui/components`) does not apply here —
but we still avoid gratuitous hardcoding.

## Theming (the showcase feature)

`ThemeControlsComponent` manipulates classes on the document root:

- **Dark toggle:** add/remove `.app-dark` (re-maps semantic tokens via
  `themes/dark.css`).
- **Preset selector:** `default` (none) or `acme` (`.ui-theme-acme` via
  `themes/acme.css`).

`acme.css` is added to the `docs:build` global `styles` array (next to
`dark.css`). State persisted to `localStorage`. This demonstrates the token
engine live: re-skin the whole library without touching a component.

## Build & deploy

- `docs:build` → `dist/docs` (already configured).
- Update the `deploy-onyx` skill to upload `dist/docs` (was `dist/storybook`)
  and to run `nx run docs:build` (was `build-storybook`). Verification
  (HTTPS 200 + content) stays. Same nginx site / URL.

## Storybook removal

- Delete `apps/docs/.storybook/`.
- Remove Storybook deps (`@storybook/*`, `storybook`) and the `storybook` /
  `build-storybook` npm scripts from `package.json`.
- Remove the `storybook` / `build-storybook` targets from `angular.json` and
  `apps/docs/project.json`.
- Migrate each component's `*.stories.ts` into `*.demos.ts`, then delete the
  `*.stories.ts` files.

## Blueprint (CLAUDE.md) update — required

Removing Storybook conflicts with the current DoD. Update `CLAUDE.md`:

- **§4 anatomy:** `button.stories.ts` → `button.docs.ts` + `button.demos.ts`.
- **§5 DoD:** "una story por variante/estado" → "demos por variante/estado en
  el sitio + entrada en el registry"; keep a11y (jest-axe) unchanged.
- **§8 commands:** replace `nx run docs:build-storybook` with `nx run docs:build`.
- **§2 structure:** `apps/docs/` description: Storybook → sitio de documentación
  Angular propio.

## Testing

The docs app is an application, not the component library, so component-level DoD
(axe, token lint) does not apply to it. Minimal coverage:

- A smoke test that `AppComponent` boots and the sidebar lists all
  `COMPONENT_DOCS` entries.
- A test that `ComponentPageComponent` renders a demo + API table for a sample
  component.

The component library's own tests (78 passing, 0 axe violations) are unchanged.

## Implementation order

1. **Shell:** convert `apps/docs` to SPA (app shell, router, sidebar stub, theme
   controls); remove Storybook (deps, config, targets, scripts).
2. **Rendering core:** `doc-model.ts`, `registry.ts`, `ComponentPageComponent`,
   `DemoBlockComponent`, `CodeBlockComponent`, `ApiTableComponent`.
3. **Content:** author `<name>.docs.ts` + `<name>.demos.ts` for all 8 components
   (migrating existing stories); wire registry; delete `*.stories.ts`.
4. **Wrap-up:** update `CLAUDE.md` blueprint, update `deploy-onyx` skill, build
   `dist/docs`, redeploy + verify.

## Out of scope (v1)

- Syntax highlighting, full-text search, auto-generated API (compodoc/extractor),
  versioned docs, MDX. Each is a clean later add; the data model keeps the API
  rows swappable for generated data.
