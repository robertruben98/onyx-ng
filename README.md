# Onyx UI — Angular Design System

Accessible, token-driven UI component library built for **Angular 19** using Standalone Components, Signals, and a Style Dictionary design-token layer.

- 22 production-grade components (forms, overlays, layout, navigation)
- Three-tier token system (`--ui-*`): primitive → semantic → component
- CSS-only dark mode and per-client brand presets
- `@angular/cdk`-powered accessibility (keyboard, focus, ARIA)
- Docs site: **https://onyx.a-robertdev.com**

---

## Installation

The package is published to GitHub Packages under `@robertruben98`.

### 1. Configure `.npmrc`

Create (or extend) `.npmrc` in the consuming project root:

```
@robertruben98:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` must be a GitHub PAT with the `read:packages` scope.

### 2. Install

```bash
npm install @robertruben98/onyx-ui
```

**Peer dependency:** Angular 19 (`@angular/core`, `@angular/common`, `@angular/cdk`).

---

## Styles

Load the global stylesheets **in this exact order** — `tokens.css` defines all `--ui-*` custom properties and must come first:

In `angular.json` → `styles`:

```json
"styles/tokens.css",
"styles/themes/dark.css"
```

Or in `styles.scss`:

```scss
@use "node_modules/@robertruben98/onyx-ui/styles/tokens.css";
@use "node_modules/@robertruben98/onyx-ui/styles/themes/dark.css"; /* optional */
```

Available theme files live under `styles/themes/<name>.css`.

---

## Theming

Activate themes by adding classes to `document.documentElement` (the `<html>` element):

| Class                | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `.onyx-dark`         | Dark mode — re-maps semantic tokens to dark palette    |
| `.onyx-theme-<name>` | Brand preset — re-maps semantic tokens to client brand |

Both classes are independent and composable:

```ts
// Dark mode toggle
document.documentElement.classList.toggle("onyx-dark", isDark);

// Brand preset
document.documentElement.classList.add("onyx-theme-acme");
```

---

## Usage

All components are standalone. Import them directly into your component's `imports` array:

```ts
import { Component } from "@angular/core";
import { OnyxButtonComponent } from "@robertruben98/onyx-ui";

@Component({
  selector: "app-demo",
  standalone: true,
  imports: [OnyxButtonComponent],
  template: `
    <onyx-button variant="primary" (clicked)="onSave()">Save</onyx-button>
  `,
})
export class AppDemoComponent {
  onSave() {
    /* ... */
  }
}
```

Selectors use the `onyx-*` prefix; exported class names use the `Onyx*` prefix (e.g. `OnyxButtonComponent`, `OnyxDialogComponent`).

---

## Components

| Category            | Components                                                                     |
| ------------------- | ------------------------------------------------------------------------------ |
| Forms & Input       | `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`   |
| Overlays & Feedback | `dialog`, `popover`, `tooltip`, `menu`, `alert`, `spinner`, `progress-bar`     |
| Data & Layout       | `data-table`, `card`, `accordion`, `tabs`, `avatar`, `badge`, `tag`, `divider` |

Full API documentation and live demos: **https://onyx.a-robertdev.com**

---

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, commands, and contribution guidelines.

---

## License

[MIT](./LICENSE) © Robert Ruben
