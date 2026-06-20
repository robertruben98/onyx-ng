# Onyx Docs Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Storybook with a self-owned Angular SPA in `apps/docs` that documents every `@onyx/ui` component with sidebar nav, live demos, view-source, an API table, and a live theme switcher.

**Architecture:** Reuse the existing `docs:build` (Angular browser builder) target. The app is a standalone Angular SPA with `@angular/router`. Per-component doc content lives in the library as co-located `<name>.docs.ts` (metadata + API rows) and `<name>.demos.ts` (live demos whose component template IS the shown code string). A central registry drives sidebar + routes. Theme controls toggle `.app-dark` / `.ui-theme-acme` classes to demonstrate the token engine. Storybook is removed entirely.

**Tech Stack:** Angular 19 (standalone, signals, OnPush, new control flow), `@angular/router`, `@angular/common` (`NgComponentOutlet`), Nx, Jest + `@testing-library/angular`.

---

## File Structure

**Created (app):**

- `apps/docs/src/app/doc-model.ts` — shared interfaces (`ApiRow`, `Demo`, `ComponentDoc`).
- `apps/docs/src/app/registry.ts` — `COMPONENT_DOCS: ComponentDoc[]`.
- `apps/docs/src/app/app.component.ts` — shell (topbar + sidebar + outlet).
- `apps/docs/src/app/app.routes.ts` — routes derived from registry.
- `apps/docs/src/app/theme/theme.service.ts` — dark + preset state (localStorage).
- `apps/docs/src/app/theme/theme-controls.component.ts` — toggle + preset select.
- `apps/docs/src/app/sidebar/sidebar.component.ts` — component nav.
- `apps/docs/src/app/pages/component-page.component.ts` — renders one ComponentDoc.
- `apps/docs/src/app/ui/code-block.component.ts` — `<pre>` + copy button.
- `apps/docs/src/app/ui/demo-block.component.ts` — live render + code panel.
- `apps/docs/src/app/ui/api-table.component.ts` — API rows table.
- `apps/docs/src/app.component.spec.ts` — smoke tests.

**Created (per component, ×8 in `libs/ui/components/<name>/`):**

- `<name>.docs.ts`, `<name>.demos.ts`

**Modified:**

- `apps/docs/src/main.ts` — bootstrap shell + router.
- `apps/docs/src/index.html` — root selector if needed.
- `apps/docs/project.json`, `angular.json` — remove storybook targets; add `serve`; add `acme.css` to styles.
- `package.json` — remove storybook deps + scripts.
- `libs/ui/components/<name>/index.ts` — export docs/demos.
- `CLAUDE.md` — blueprint update.
- `~/.claude/skills/deploy-onyx/SKILL.md` — deploy `dist/docs`.

**Deleted:**

- `apps/docs/.storybook/`, every `libs/ui/components/*/*.stories.ts`.

---

## Phase 1 — App shell + Storybook removal

### Task 1: Define the doc data model

**Files:**

- Create: `apps/docs/src/app/doc-model.ts`

- [ ] **Step 1: Write the interfaces**

```ts
import { Type } from "@angular/core";

/** One row in a component's API table (input or output). */
export interface ApiRow {
  /** Property name. Outputs are written as '(name)'. */
  name: string;
  /** Type as displayed, e.g. "'primary' | 'secondary'". */
  type: string;
  /** Default value, or '-' for outputs/required. */
  default: string;
  /** Short description. */
  description: string;
}

/** A single live example. The component's template IS the shown code. */
export interface Demo {
  title: string;
  description?: string;
  /** Source shown in the code panel; also the demo component's template. */
  code: string;
  /** Standalone component rendered live via NgComponentOutlet. */
  component: Type<unknown>;
}

/** Everything needed to render one component's documentation page. */
export interface ComponentDoc {
  /** Route segment, e.g. 'button'. */
  id: string;
  /** Display name, e.g. 'Button'. */
  title: string;
  /** Prose description (1–3 sentences). */
  description: string;
  api: ApiRow[];
  demos: Demo[];
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/src/app/doc-model.ts
git commit -m "feat(docs): add documentation data model"
```

### Task 2: Theme service

**Files:**

- Create: `apps/docs/src/app/theme/theme.service.ts`
- Test: `apps/docs/src/app/theme/theme.service.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from "@angular/core/testing";
import { ThemeService } from "./theme.service";

describe("ThemeService", () => {
  let svc: ThemeService;
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    TestBed.configureTestingModule({});
    svc = TestBed.inject(ThemeService);
  });

  it("toggles the dark class on the document root", () => {
    expect(document.documentElement.classList.contains("app-dark")).toBe(false);
    svc.setDark(true);
    expect(document.documentElement.classList.contains("app-dark")).toBe(true);
    svc.setDark(false);
    expect(document.documentElement.classList.contains("app-dark")).toBe(false);
  });

  it("applies a preset class and removes the previous one", () => {
    svc.setPreset("acme");
    expect(document.documentElement.classList.contains("ui-theme-acme")).toBe(
      true,
    );
    svc.setPreset("default");
    expect(document.documentElement.classList.contains("ui-theme-acme")).toBe(
      false,
    );
  });

  it("persists choices to localStorage", () => {
    svc.setDark(true);
    svc.setPreset("acme");
    expect(localStorage.getItem("onyx-dark")).toBe("true");
    expect(localStorage.getItem("onyx-preset")).toBe("acme");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test docs --watch=false`
Expected: FAIL (cannot find `./theme.service`)

- [ ] **Step 3: Implement the service**

```ts
import { Injectable, signal } from "@angular/core";

export type Preset = "default" | "acme";
const PRESET_CLASS: Record<Preset, string> = {
  default: "",
  acme: "ui-theme-acme",
};

@Injectable({ providedIn: "root" })
export class ThemeService {
  readonly dark = signal(localStorage.getItem("onyx-dark") === "true");
  readonly preset = signal<Preset>(
    (localStorage.getItem("onyx-preset") as Preset) || "default",
  );

  constructor() {
    this.setDark(this.dark());
    this.setPreset(this.preset());
  }

  setDark(value: boolean): void {
    this.dark.set(value);
    document.documentElement.classList.toggle("app-dark", value);
    localStorage.setItem("onyx-dark", String(value));
  }

  setPreset(value: Preset): void {
    const root = document.documentElement;
    Object.values(PRESET_CLASS).forEach((c) => c && root.classList.remove(c));
    if (PRESET_CLASS[value]) root.classList.add(PRESET_CLASS[value]);
    this.preset.set(value);
    localStorage.setItem("onyx-preset", value);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx nx test docs --watch=false`
Expected: PASS (3 ThemeService tests)

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/app/theme/theme.service.ts apps/docs/src/app/theme/theme.service.spec.ts
git commit -m "feat(docs): add theme service (dark + preset)"
```

### Task 3: Theme controls component

**Files:**

- Create: `apps/docs/src/app/theme/theme-controls.component.ts`

- [ ] **Step 1: Implement (presentational, driven by ThemeService)**

```ts
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Preset, ThemeService } from "./theme.service";

@Component({
  selector: "docs-theme-controls",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="docs-theme__toggle"
      [attr.aria-pressed]="theme.dark()"
      (click)="theme.setDark(!theme.dark())"
    >
      {{ theme.dark() ? "🌙 Dark" : "☀ Light" }}
    </button>
    <label class="docs-theme__preset">
      <span class="docs-visually-hidden">Theme preset</span>
      <select [value]="theme.preset()" (change)="onPreset($event)">
        <option value="default">default</option>
        <option value="acme">acme</option>
      </select>
    </label>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
      }
      .docs-theme__toggle {
        cursor: pointer;
        padding: 0.375rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--ui-color-border);
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
      .docs-visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
    `,
  ],
})
export class ThemeControlsComponent {
  protected readonly theme = inject(ThemeService);
  protected onPreset(e: Event): void {
    this.theme.setPreset((e.target as HTMLSelectElement).value as Preset);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/src/app/theme/theme-controls.component.ts
git commit -m "feat(docs): add theme controls component"
```

### Task 4: Temporary empty registry

**Files:**

- Create: `apps/docs/src/app/registry.ts`

- [ ] **Step 1: Create an empty registry (filled in Phase 3)**

```ts
import { ComponentDoc } from "./doc-model";

// Populated in Phase 3 as each component gains its .docs.ts.
export const COMPONENT_DOCS: ComponentDoc[] = [];
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/src/app/registry.ts
git commit -m "feat(docs): add component registry (empty)"
```

### Task 5: Sidebar component

**Files:**

- Create: `apps/docs/src/app/sidebar/sidebar.component.ts`

- [ ] **Step 1: Implement**

```ts
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { COMPONENT_DOCS } from "../registry";

@Component({
  selector: "docs-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="docs-sidebar" aria-label="Components">
      <ul>
        @for (doc of docs; track doc.id) {
          <li>
            <a
              [routerLink]="['/components', doc.id]"
              routerLinkActive="is-active"
            >
              {{ doc.title }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [
    `
      .docs-sidebar ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .docs-sidebar a {
        display: block;
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        color: var(--ui-color-text);
        text-decoration: none;
      }
      .docs-sidebar a.is-active {
        background: var(--ui-color-surface-hover);
        color: var(--ui-color-primary);
        font-weight: 600;
      }
    `,
  ],
})
export class SidebarComponent {
  protected readonly docs = COMPONENT_DOCS;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/src/app/sidebar/sidebar.component.ts
git commit -m "feat(docs): add sidebar nav"
```

### Task 6: App shell + routes + bootstrap

**Files:**

- Create: `apps/docs/src/app/app.component.ts`, `apps/docs/src/app/app.routes.ts`
- Modify: `apps/docs/src/main.ts`

- [ ] **Step 1: Write routes (derive from registry, redirect unknown)**

`apps/docs/src/app/app.routes.ts`:

```ts
import { Routes } from "@angular/router";
import { COMPONENT_DOCS } from "./registry";
import { ComponentPageComponent } from "./pages/component-page.component";

const first = COMPONENT_DOCS[0]?.id ?? "";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: `components/${first}` },
  { path: "components/:id", component: ComponentPageComponent },
  { path: "**", redirectTo: `components/${first}` },
];
```

- [ ] **Step 2: Write the shell**

`apps/docs/src/app/app.component.ts`:

```ts
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { ThemeControlsComponent } from "./theme/theme-controls.component";

@Component({
  selector: "docs-root",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ThemeControlsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="docs-topbar">
      <span class="docs-brand">Onyx UI</span>
      <docs-theme-controls />
    </header>
    <div class="docs-layout">
      <aside class="docs-aside"><docs-sidebar /></aside>
      <main class="docs-main"><router-outlet /></main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
      .docs-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        border-bottom: 1px solid var(--ui-color-border);
      }
      .docs-brand {
        font-weight: 600;
        font-size: 1.125rem;
      }
      .docs-layout {
        display: grid;
        grid-template-columns: 220px 1fr;
      }
      .docs-aside {
        padding: 1rem;
        border-right: 1px solid var(--ui-color-border);
        min-height: calc(100vh - 56px);
      }
      .docs-main {
        padding: 1.5rem 2rem;
        max-width: 880px;
      }
    `,
  ],
})
export class AppComponent {}
```

- [ ] **Step 3: Rewrite bootstrap**

`apps/docs/src/main.ts`:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch((err) => console.error(err));
```

- [ ] **Step 4: Fix the root selector**

In `apps/docs/src/index.html`, ensure the body contains `<docs-root></docs-root>` (replace any `<ui-root>`).

- [ ] **Step 5: Build to verify it compiles**

Run: `npx nx build docs`
Expected: builds to `dist/docs` (page is mostly empty until Phase 3 — that's fine).

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/app/app.component.ts apps/docs/src/app/app.routes.ts apps/docs/src/main.ts apps/docs/src/index.html
git commit -m "feat(docs): add app shell, routes and bootstrap"
```

### Task 7: Add a serve target + acme.css style; remove Storybook targets

**Files:**

- Modify: `angular.json` (docs project), `apps/docs/project.json`

- [ ] **Step 1: Add acme.css to the docs build styles**

In `angular.json` under `projects.docs.architect.build.options.styles`, add `"libs/ui/themes/acme.css"` after the existing `dark.css` entry.

- [ ] **Step 2: Add a `serve` target**

In `angular.json` under `projects.docs.architect`, add:

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": { "buildTarget": "docs:build:development" },
  "defaultConfiguration": "development"
}
```

- [ ] **Step 3: Remove storybook targets**

Delete the `storybook` and `build-storybook` blocks from `angular.json` (docs project) and from `apps/docs/project.json`.

- [ ] **Step 4: Verify**

Run: `npx nx build docs`
Expected: PASS. Run `npx nx serve docs` once to confirm it boots, then stop.

- [ ] **Step 5: Commit**

```bash
git add angular.json apps/docs/project.json
git commit -m "chore(docs): add serve + acme style, drop storybook targets"
```

### Task 8: Remove Storybook config and dependencies

**Files:**

- Delete: `apps/docs/.storybook/`
- Modify: `package.json`

- [ ] **Step 1: Delete the storybook config dir**

```bash
git rm -r apps/docs/.storybook
```

- [ ] **Step 2: Remove storybook scripts + deps from package.json**

Remove the `"storybook"` and `"build-storybook"` entries from `scripts`, and remove `@storybook/addon-a11y`, `@storybook/addon-essentials`, `@storybook/angular`, and `storybook` from `devDependencies`.

- [ ] **Step 3: Reinstall to prune the lockfile**

Run: `npm install`
Expected: lockfile updates, no storybook packages.

- [ ] **Step 4: Verify the build still works**

Run: `npx nx build docs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json apps/docs/.storybook
git commit -m "chore: remove Storybook deps and config"
```

---

## Phase 2 — Rendering core

### Task 9: API table component

**Files:**

- Create: `apps/docs/src/app/ui/api-table.component.ts`

- [ ] **Step 1: Implement**

```ts
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ApiRow } from "../doc-model";

@Component({
  selector: "docs-api-table",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="docs-api">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.name) {
          <tr>
            <td>
              <code>{{ row.name }}</code>
            </td>
            <td>
              <code>{{ row.type }}</code>
            </td>
            <td>
              <code>{{ row.default }}</code>
            </td>
            <td>{{ row.description }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [
    `
      .docs-api {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .docs-api th,
      .docs-api td {
        text-align: left;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid var(--ui-color-border);
        vertical-align: top;
      }
      .docs-api code {
        font-family: ui-monospace, monospace;
      }
    `,
  ],
})
export class ApiTableComponent {
  readonly rows = input.required<ApiRow[]>();
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/src/app/ui/api-table.component.ts
git commit -m "feat(docs): add API table component"
```

### Task 10: Code block component (with copy)

**Files:**

- Create: `apps/docs/src/app/ui/code-block.component.ts`
- Test: `apps/docs/src/app/ui/code-block.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { CodeBlockComponent } from "./code-block.component";

describe("CodeBlockComponent", () => {
  it("shows the code and copies it to the clipboard", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const user = userEvent.setup();
    await render(`<docs-code-block [code]="code" />`, {
      imports: [CodeBlockComponent],
      componentProperties: { code: "<ui-button>Hi</ui-button>" },
    });
    expect(screen.getByText("<ui-button>Hi</ui-button>")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith("<ui-button>Hi</ui-button>");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test docs --watch=false`
Expected: FAIL (cannot find `./code-block.component`)

- [ ] **Step 3: Implement**

```ts
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";

@Component({
  selector: "docs-code-block",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-code">
      <button type="button" class="docs-code__copy" (click)="copy()">
        {{ copied() ? "Copied" : "Copy" }}
      </button>
      <pre><code>{{ code() }}</code></pre>
    </div>
  `,
  styles: [
    `
      .docs-code {
        position: relative;
      }
      .docs-code__copy {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--ui-color-border);
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
      .docs-code pre {
        margin: 0;
        padding: 1rem;
        overflow: auto;
        background: var(--ui-color-surface-hover);
        border-radius: 0.5rem;
      }
      .docs-code code {
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
        white-space: pre;
      }
    `,
  ],
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  protected readonly copied = signal(false);
  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx nx test docs --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/app/ui/code-block.component.ts apps/docs/src/app/ui/code-block.component.spec.ts
git commit -m "feat(docs): add code block with copy"
```

### Task 11: Demo block component (live render + code panel)

**Files:**

- Create: `apps/docs/src/app/ui/demo-block.component.ts`

- [ ] **Step 1: Implement (uses NgComponentOutlet for the live demo)**

```ts
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { Demo } from "../doc-model";
import { CodeBlockComponent } from "./code-block.component";

@Component({
  selector: "docs-demo-block",
  standalone: true,
  imports: [NgComponentOutlet, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="docs-demo">
      <h3>{{ demo().title }}</h3>
      @if (demo().description) {
        <p>{{ demo().description }}</p>
      }
      <div class="docs-demo__preview">
        <ng-container *ngComponentOutlet="demo().component" />
      </div>
      <button
        type="button"
        class="docs-demo__toggle"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        {{ open() ? "Hide code" : "Show code" }}
      </button>
      @if (open()) {
        <docs-code-block [code]="demo().code" />
      }
    </section>
  `,
  styles: [
    `
      .docs-demo {
        margin: 1.5rem 0;
      }
      .docs-demo__preview {
        padding: 1.5rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }
      .docs-demo__toggle {
        margin: 0.5rem 0;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--ui-color-border);
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
    `,
  ],
})
export class DemoBlockComponent {
  readonly demo = input.required<Demo>();
  protected readonly open = signal(false);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/src/app/ui/demo-block.component.ts
git commit -m "feat(docs): add demo block (live render + code)"
```

### Task 12: Component page

**Files:**

- Create: `apps/docs/src/app/pages/component-page.component.ts`

- [ ] **Step 1: Implement (resolves doc by route param)**

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { COMPONENT_DOCS } from "../registry";
import { ApiTableComponent } from "../ui/api-table.component";
import { DemoBlockComponent } from "../ui/demo-block.component";

@Component({
  selector: "docs-component-page",
  standalone: true,
  imports: [ApiTableComponent, DemoBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc(); as d) {
      <article>
        <h1>{{ d.title }}</h1>
        <p class="docs-lead">{{ d.description }}</p>
        @for (demo of d.demos; track demo.title) {
          <docs-demo-block [demo]="demo" />
        }
        <h2>API</h2>
        <docs-api-table [rows]="d.api" />
      </article>
    }
  `,
  styles: [
    `
      .docs-lead {
        color: var(--ui-color-text);
        opacity: 0.8;
      }
    `,
  ],
})
export class ComponentPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get("id"))),
    { initialValue: this.route.snapshot.paramMap.get("id") },
  );
  protected readonly doc = computed(() =>
    COMPONENT_DOCS.find((d) => d.id === this.id()),
  );
}
```

- [ ] **Step 2: Build to verify it compiles**

Run: `npx nx build docs`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/src/app/pages/component-page.component.ts
git commit -m "feat(docs): add component page"
```

---

## Phase 3 — Content (per component)

> Each component gets `<name>.docs.ts` + `<name>.demos.ts`, an updated `index.ts`,
> a registry entry, deletion of its `*.stories.ts`. The demo component's template
> string IS the `code`. After each component, run `npx nx build docs` and commit.

### Task 13: Button content

**Files:**

- Create: `libs/ui/components/button/button.docs.ts`, `libs/ui/components/button/button.demos.ts`
- Modify: `libs/ui/components/button/index.ts`, `apps/docs/src/app/registry.ts`
- Delete: `libs/ui/components/button/button.stories.ts`

- [ ] **Step 1: Write the demos**

`libs/ui/components/button/button.demos.ts`:

```ts
import { Component } from "@angular/core";
import { Demo } from "../../../../apps/docs/src/app/doc-model";
import { ButtonComponent } from "./button.component";

const variantsCode = `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="text">Text</ui-button>`;
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: variantsCode,
})
class ButtonVariantsDemo {}

const statesCode = `<ui-button [disabled]="true">Disabled</ui-button>
<ui-button [loading]="true">Loading</ui-button>`;
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: statesCode,
})
class ButtonStatesDemo {}

export const buttonDemos: Demo[] = [
  { title: "Variants", code: variantsCode, component: ButtonVariantsDemo },
  { title: "States", code: statesCode, component: ButtonStatesDemo },
];
```

> NOTE on import path: importing the doc-model from the app into the lib crosses
> Nx boundaries. To avoid that, define `Demo`/`ApiRow`/`ComponentDoc` in a tiny
> shared lib OR re-declare the structural types in the lib. **Chosen:** add a
> `libs/ui/docs-model/` barrel (a plain types file) and import from `@onyx/ui`
> public path. See Step 1a.

- [ ] **Step 1a: Create the shared doc-model lib path (one-time)**

Create `libs/ui/docs-model/index.ts` with the SAME interfaces as
`apps/docs/src/app/doc-model.ts` (ApiRow, Demo, ComponentDoc). Update
`apps/docs/src/app/doc-model.ts` to `export * from '<relative>/libs/ui/docs-model'`
OR point both at the lib via the `@onyx/ui/docs-model` tsconfig path. Add the
path to the root `tsconfig.base.json` `paths`. Then `<name>.demos.ts` and the app
both import `Demo` from `@onyx/ui/docs-model`.

- [ ] **Step 2: Write the docs metadata**

`libs/ui/components/button/button.docs.ts`:

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { buttonDemos } from "./button.demos";

export const buttonDoc: ComponentDoc = {
  id: "button",
  title: "Button",
  description:
    "Action trigger with primary, secondary and text variants, plus disabled and loading states.",
  api: [
    {
      name: "variant",
      type: "'primary' | 'secondary' | 'text'",
      default: "'primary'",
      description: "Visual variant.",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Control size.",
    },
    {
      name: "type",
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: "Native button type.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled; never emits clicked.",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description: "Shows spinner; suppresses interaction.",
    },
    {
      name: "(clicked)",
      type: "MouseEvent",
      default: "-",
      description: "Emitted on activation when interactive.",
    },
  ],
  demos: buttonDemos,
};
```

- [ ] **Step 3: Export from the component barrel**

In `libs/ui/components/button/index.ts` add:

```ts
export * from "./button.docs";
```

- [ ] **Step 4: Register**

In `apps/docs/src/app/registry.ts`:

```ts
import { ComponentDoc } from "./doc-model";
import { buttonDoc } from "@onyx/ui/components";

export const COMPONENT_DOCS: ComponentDoc[] = [buttonDoc];
```

(Replace the empty array. Append further docs as later tasks add them.)

- [ ] **Step 5: Delete the story**

```bash
git rm libs/ui/components/button/button.stories.ts
```

- [ ] **Step 6: Build + verify the component lib tests still pass**

Run: `npx nx build docs && npx nx test ui-components --watch=false`
Expected: docs builds; ui-components tests still PASS (9 button tests unaffected).

- [ ] **Step 7: Commit**

```bash
git add libs/ui/components/button apps/docs/src/app/registry.ts libs/ui/docs-model tsconfig.base.json apps/docs/src/app/doc-model.ts
git commit -m "feat(docs): add Button docs + demos, drop story"
```

### Task 14: Input content

**Files:**

- Create: `libs/ui/components/input/input.docs.ts`, `input.demos.ts`
- Modify: `libs/ui/components/input/index.ts`, `apps/docs/src/app/registry.ts`
- Delete: `libs/ui/components/input/input.stories.ts`

- [ ] **Step 1: Demos**

`input.demos.ts`:

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { InputComponent } from "./input.component";

const basicCode = `<ui-input label="Email" placeholder="you@example.com" type="email" />`;
@Component({ standalone: true, imports: [InputComponent], template: basicCode })
class InputBasicDemo {}

const statesCode = `<ui-input label="Invalid" [invalid]="true" />
<ui-input label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [InputComponent],
  template: statesCode,
})
class InputStatesDemo {}

export const inputDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: InputBasicDemo },
  { title: "States", code: statesCode, component: InputStatesDemo },
];
```

- [ ] **Step 2: Docs**

`input.docs.ts`:

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { inputDemos } from "./input.demos";

export const inputDoc: ComponentDoc = {
  id: "input",
  title: "Input",
  description:
    "Text input implementing ControlValueAccessor, with label, invalid and disabled states.",
  api: [
    {
      name: "type",
      type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'",
      default: "'text'",
      description: "Native input type.",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Control size.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label, linked to the input.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label.",
    },
    {
      name: "placeholder",
      type: "string",
      default: "''",
      description: "Placeholder text.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Reflected via aria-invalid.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled state.",
    },
    {
      name: "(valueChange)",
      type: "string",
      default: "-",
      description: "Emitted on every value change.",
    },
  ],
  demos: inputDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story**

Add `export * from './input.docs';` to `input/index.ts`; import `inputDoc` from `@onyx/ui/components` and append to `COMPONENT_DOCS`; `git rm libs/ui/components/input/input.stories.ts`.

- [ ] **Step 4: Build + commit**

```bash
npx nx build docs
git add libs/ui/components/input apps/docs/src/app/registry.ts
git commit -m "feat(docs): add Input docs + demos, drop story"
```

### Task 15: Checkbox content

**Files:** `checkbox.docs.ts`, `checkbox.demos.ts`, barrel, registry; delete `checkbox.stories.ts`.

- [ ] **Step 1: Demos**

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { CheckboxComponent } from "./checkbox.component";

const basicCode = `<ui-checkbox label="Accept terms" />`;
@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: basicCode,
})
class CheckboxBasicDemo {}

const statesCode = `<ui-checkbox label="Indeterminate" [indeterminate]="true" />
<ui-checkbox label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: statesCode,
})
class CheckboxStatesDemo {}

export const checkboxDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: CheckboxBasicDemo },
  { title: "States", code: statesCode, component: CheckboxStatesDemo },
];
```

- [ ] **Step 2: Docs**

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { checkboxDemos } from "./checkbox.demos";

export const checkboxDoc: ComponentDoc = {
  id: "checkbox",
  title: "Checkbox",
  description:
    "Boolean checkbox implementing ControlValueAccessor, with indeterminate, invalid and disabled states.",
  api: [
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Control size.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label.",
    },
    {
      name: "indeterminate",
      type: "boolean",
      default: "false",
      description: "Tri-state visual dash.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Reflected via aria-invalid.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled state.",
    },
    {
      name: "(checkedChange)",
      type: "boolean",
      default: "-",
      description: "Emitted on every change.",
    },
  ],
  demos: checkboxDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story; build + commit**

```bash
npx nx build docs
git add libs/ui/components/checkbox apps/docs/src/app/registry.ts
git commit -m "feat(docs): add Checkbox docs + demos, drop story"
```

### Task 16: Textarea content

**Files:** `textarea.docs.ts`, `textarea.demos.ts`, barrel, registry; delete story.

- [ ] **Step 1: Demos**

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TextareaComponent } from "./textarea.component";

const basicCode = `<ui-textarea label="Bio" placeholder="Tell us about yourself…" [rows]="3" />`;
@Component({
  standalone: true,
  imports: [TextareaComponent],
  template: basicCode,
})
class TextareaBasicDemo {}

export const textareaDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TextareaBasicDemo },
];
```

- [ ] **Step 2: Docs**

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { textareaDemos } from "./textarea.demos";

export const textareaDoc: ComponentDoc = {
  id: "textarea",
  title: "Textarea",
  description:
    "Multi-line text input implementing ControlValueAccessor, with rows, invalid and disabled states.",
  api: [
    {
      name: "rows",
      type: "number",
      default: "3",
      description: "Visible text rows.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label.",
    },
    {
      name: "placeholder",
      type: "string",
      default: "''",
      description: "Placeholder text.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Reflected via aria-invalid.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled state.",
    },
    {
      name: "(valueChange)",
      type: "string",
      default: "-",
      description: "Emitted on every value change.",
    },
  ],
  demos: textareaDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story; build + commit**

```bash
npx nx build docs
git add libs/ui/components/textarea apps/docs/src/app/registry.ts
git commit -m "feat(docs): add Textarea docs + demos, drop story"
```

### Task 17: Switch content

**Files:** `switch.docs.ts`, `switch.demos.ts`, barrel, registry; delete story.

- [ ] **Step 1: Demos**

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { SwitchComponent } from "./switch.component";

const basicCode = `<ui-switch label="Enable notifications" />`;
@Component({
  standalone: true,
  imports: [SwitchComponent],
  template: basicCode,
})
class SwitchBasicDemo {}

const disabledCode = `<ui-switch label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [SwitchComponent],
  template: disabledCode,
})
class SwitchDisabledDemo {}

export const switchDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: SwitchBasicDemo },
  { title: "Disabled", code: disabledCode, component: SwitchDisabledDemo },
];
```

- [ ] **Step 2: Docs**

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { switchDemos } from "./switch.demos";

export const switchDoc: ComponentDoc = {
  id: "switch",
  title: "Switch",
  description:
    "Boolean toggle with role=switch implementing ControlValueAccessor.",
  api: [
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Reflected via aria-invalid.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled state.",
    },
    {
      name: "(checkedChange)",
      type: "boolean",
      default: "-",
      description: "Emitted on every change.",
    },
  ],
  demos: switchDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story; build + commit**

```bash
npx nx build docs
git add libs/ui/components/switch apps/docs/src/app/registry.ts
git commit -m "feat(docs): add Switch docs + demos, drop story"
```

### Task 18: RadioGroup content

**Files:** `radio-group.docs.ts`, `radio-group.demos.ts`, barrel, registry; delete story.

- [ ] **Step 1: Demos**

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { RadioGroupComponent, RadioOption } from "./radio-group.component";

const sizeOptions: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];
const basicCode = `<ui-radio-group label="Size" [options]="options" />`;
@Component({
  standalone: true,
  imports: [RadioGroupComponent],
  template: basicCode,
})
class RadioBasicDemo {
  readonly options = sizeOptions;
}

export const radioGroupDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: RadioBasicDemo },
];
```

- [ ] **Step 2: Docs**

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { radioGroupDemos } from "./radio-group.demos";

export const radioGroupDoc: ComponentDoc = {
  id: "radio-group",
  title: "RadioGroup",
  description:
    "Single-choice group of native radios with roving focus, implementing ControlValueAccessor.",
  api: [
    {
      name: "options",
      type: "RadioOption[]",
      default: "(required)",
      description: "Options: { label, value, disabled? }.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible group label (legend).",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Reflected via aria-invalid.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables the whole group.",
    },
    {
      name: "(valueChange)",
      type: "string",
      default: "-",
      description: "Emitted on selection change.",
    },
  ],
  demos: radioGroupDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story; build + commit**

```bash
npx nx build docs
git add libs/ui/components/radio-group apps/docs/src/app/registry.ts
git commit -m "feat(docs): add RadioGroup docs + demos, drop story"
```

### Task 19: Badge content

**Files:** `badge.docs.ts`, `badge.demos.ts`, barrel, registry; delete story.

- [ ] **Step 1: Demos**

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { BadgeComponent } from "./badge.component";

const variantsCode = `<ui-badge variant="neutral">Neutral</ui-badge>
<ui-badge variant="info">Info</ui-badge>
<ui-badge variant="success">Success</ui-badge>
<ui-badge variant="warning">Warning</ui-badge>
<ui-badge variant="danger">Danger</ui-badge>`;
@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: variantsCode,
})
class BadgeVariantsDemo {}

export const badgeDemos: Demo[] = [
  { title: "Variants", code: variantsCode, component: BadgeVariantsDemo },
];
```

- [ ] **Step 2: Docs**

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { badgeDemos } from "./badge.demos";

export const badgeDoc: ComponentDoc = {
  id: "badge",
  title: "Badge",
  description:
    "Small status label with neutral, info, success, warning and danger variants.",
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: "Semantic variant.",
    },
  ],
  demos: badgeDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story; build + commit**

```bash
npx nx build docs
git add libs/ui/components/badge apps/docs/src/app/registry.ts
git commit -m "feat(docs): add Badge docs + demos, drop story"
```

### Task 20: Alert content

**Files:** `alert.docs.ts`, `alert.demos.ts`, barrel, registry; delete story.

- [ ] **Step 1: Demos**

```ts
import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { AlertComponent } from "./alert.component";

const variantsCode = `<ui-alert variant="info" title="Info">An informational message.</ui-alert>
<ui-alert variant="success" title="Success">It worked.</ui-alert>
<ui-alert variant="warning" title="Warning">Careful now.</ui-alert>
<ui-alert variant="danger" title="Error">Something broke.</ui-alert>`;
@Component({
  standalone: true,
  imports: [AlertComponent],
  template: variantsCode,
})
class AlertVariantsDemo {}

const dismissCode = `<ui-alert variant="info" [dismissible]="true">Dismiss me.</ui-alert>`;
@Component({
  standalone: true,
  imports: [AlertComponent],
  template: dismissCode,
})
class AlertDismissDemo {}

export const alertDemos: Demo[] = [
  { title: "Variants", code: variantsCode, component: AlertVariantsDemo },
  { title: "Dismissible", code: dismissCode, component: AlertDismissDemo },
];
```

- [ ] **Step 2: Docs**

```ts
import { ComponentDoc } from "@onyx/ui/docs-model";
import { alertDemos } from "./alert.demos";

export const alertDoc: ComponentDoc = {
  id: "alert",
  title: "Alert",
  description:
    "Inline feedback banner with semantic variants, optional title, and a dismiss action.",
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'info'",
      description: "Semantic variant.",
    },
    {
      name: "title",
      type: "string",
      default: "''",
      description: "Optional bold title.",
    },
    {
      name: "dismissible",
      type: "boolean",
      default: "false",
      description: "Shows a dismiss button.",
    },
    {
      name: "dismissLabel",
      type: "string",
      default: "'Dismiss'",
      description: "Accessible name for the dismiss button.",
    },
    {
      name: "(dismissed)",
      type: "void",
      default: "-",
      description: "Emitted when dismissed.",
    },
  ],
  demos: alertDemos,
};
```

- [ ] **Step 3: Barrel + register + delete story; build + commit**

```bash
npx nx build docs
git add libs/ui/components/alert apps/docs/src/app/registry.ts
git commit -m "feat(docs): add Alert docs + demos, drop story"
```

### Task 21: Order the registry + verify no stories remain

**Files:** `apps/docs/src/app/registry.ts`

- [ ] **Step 1: Set the final order**

Ensure `COMPONENT_DOCS` is ordered: button, input, textarea, checkbox, switch, radioGroup, badge, alert.

- [ ] **Step 2: Verify all stories are gone**

Run: `find libs/ui/components -name '*.stories.ts'`
Expected: no output.

- [ ] **Step 3: Build + commit**

```bash
npx nx build docs
git add apps/docs/src/app/registry.ts
git commit -m "feat(docs): finalize component registry order"
```

---

## Phase 4 — Smoke tests, blueprint, deploy

### Task 22: App smoke tests

**Files:**

- Create: `apps/docs/src/app.component.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { render, screen } from "@testing-library/angular";
import { provideRouter } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { COMPONENT_DOCS } from "./app/registry";

describe("AppComponent", () => {
  it("boots and lists every component in the sidebar", async () => {
    await render(AppComponent, { providers: [provideRouter(routes)] });
    for (const doc of COMPONENT_DOCS) {
      expect(screen.getByRole("link", { name: doc.title })).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run**

Run: `npx nx test docs --watch=false`
Expected: PASS (ThemeService + CodeBlock + AppComponent tests).

- [ ] **Step 3: Commit**

```bash
git add apps/docs/src/app.component.spec.ts
git commit -m "test(docs): add app shell smoke test"
```

### Task 23: Update the CLAUDE.md blueprint

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Update §2 structure line**

Change the `apps/docs/` description from `Storybook (playground + docs vivas)` to `Sitio de documentación Angular propio (demos + API vivas)`.

- [ ] **Step 2: Update §4 anatomy**

Replace `button.stories.ts  Storybook: una story por variante/estado` with two lines:

```
  button.docs.ts            Metadata de doc (descripción + tabla de API)
  button.demos.ts           Demos vivos (una demo por variante/estado)
```

- [ ] **Step 3: Update §5 Definition of Done**

Replace the Storybook checkbox with:

```
- [ ] **Docs**: `<name>.docs.ts` (API + descripción) y `<name>.demos.ts` (una
      demo por variante/estado), registrados en el sitio de docs.
```

- [ ] **Step 4: Update §8 commands**

Replace `nx run docs:build-storybook   # Storybook compila sin errores` with
`nx build docs                       # el sitio de documentación compila`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update blueprint for self-owned docs site"
```

### Task 24: Update the deploy-onyx skill + redeploy

**Files:**

- Modify: `~/.claude/skills/deploy-onyx/SKILL.md`

- [ ] **Step 1: Update the build + upload commands**

In `~/.claude/skills/deploy-onyx/SKILL.md`, change the build step to
`npx nx build docs` and the tar source from `dist/storybook` to `dist/docs`.
Update the description (Storybook → sitio de documentación). Verification block
(HTTPS 200 + title) stays.

- [ ] **Step 2: Build the site**

Run: `npx nx build docs`
Expected: `dist/docs` produced.

- [ ] **Step 3: Deploy**

```bash
tar -C dist/docs -czf - . | ssh -o BatchMode=yes robertdev@45.10.154.187 \
  'rm -rf ~/onyx-storybook/* && tar -C ~/onyx-storybook -xzf - && chmod -R o+rX ~/onyx-storybook'
```

(The nginx root stays `~/onyx-storybook`; only the contents change.)

- [ ] **Step 4: Verify**

Run:

```bash
curl -s -o /dev/null -w "HTTPS %{http_code}\n" https://onyx.a-robertdev.com/
curl -s https://onyx.a-robertdev.com/ | grep -o '<title>[^<]*</title>' | head -1
```

Expected: `HTTPS 200`; a non-Storybook title. Open the site and confirm sidebar,
a live demo, the code toggle, the API table, and the theme switcher all work.

- [ ] **Step 5: Commit any repo changes**

```bash
git add -A
git commit -m "chore: deploy self-owned docs site"
```

---

## Notes / Risks

- **Nx module boundary:** `<name>.demos.ts` (in the lib) must not import from the
  app. Task 13 Step 1a introduces `@onyx/ui/docs-model` (a types-only path) so
  both the lib and the app share `ApiRow`/`Demo`/`ComponentDoc`. Confirm the
  `tsconfig.base.json` path + any Nx `enforce-module-boundaries` lint allows the
  components lib to depend on the docs-model lib (types only). If lint complains,
  tag `docs-model` as `type:util` / scope-shared in its `project.json`.
- **NgComponentOutlet inputs:** demos that need bound data (RadioGroup options)
  declare the data as a field on the demo component and reference it in the demo
  template — no outlet inputs needed.
- **nginx root name:** kept as `~/onyx-storybook` to avoid touching nginx config;
  rename later if desired (would require updating the nginx site root).

```

```
