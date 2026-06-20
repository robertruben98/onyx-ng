# 💎 Onyx UI — Angular Component Library

Accessible, **token-themed** UI component library built natively for **Angular 19** using Standalone Components, Signals, and a Style Dictionary-driven design token layer.

---

## Key Features

* 🚀 **Modern Angular Primitives:** Built from the ground up using Angular 19 **Signal Inputs** (`input()`), **Signal Outputs** (`output()`), and reactive **computed states** (`computed()`) for maximum type-safety and performance.
* 🎨 **Token-Driven Theming:** Style Dictionary-driven token system. All components are styled using CSS Custom Properties (`--ui-*`). Re-skinning a whole application or swapping client themes requires only a single CSS file swap, never a component edit.
* ♿ **Strict Accessibility (a11y):** Powered by the `@angular/cdk` primitives. Fully keyboard-accessible, screen-reader friendly with semantic markup, and verified automatically with `jest-axe`.
* 🌗 **CSS-Only Dark Mode:** Native dark mode styling out-of-the-box by toggling the `app-dark` class on the root element.
* 📦 **22 Core Components:** A rich, production-grade library covering form controls, layout, navigation, and overlays.

---

## Components Included (22)

| Category | Components |
|---|---|
| **Forms & Input** | `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch` |
| **Overlays & Feedback** | `dialog`, `popover`, `tooltip`, `menu`, `alert`, `spinner`, `progress-bar` |
| **Data & Layout** | `data-table`, `card`, `accordion`, `tabs`, `avatar`, `badge`, `tag`, `divider` |

---

## Installation

```bash
npm install onyx-ng
```

### Import Styles
Add the core token sheet and component styles in your `styles.scss` or `angular.json`:

```scss
@import "onyx-ng/style.css"; // Token layer + component layouts
```

---

## Usage Example

### Standalone Component Import

```typescript
import { Component } from '@angular/core';
import { OnyxButtonComponent } from 'onyx-ng';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [OnyxButtonComponent],
  template: `
    <onyx-button variant="primary" (clicked)="onSave()">
      Save Changes
    </onyx-button>
    
    <onyx-button variant="secondary" [disabled]="isPending()">
      Cancel
    </onyx-button>
  `
})
export class AppDemoComponent {
  isPending = signal(false);

  onSave() {
    console.log('Saved');
  }
}
```

---

## Design System & Theming

Onyx UI decouples layout styles from design variables using design tokens. Swapping themes is framework-agnostic and done in pure CSS.

### 🌗 Enabling Dark Mode
Simply add the `.app-dark` class to your root `<html>` element. The theme swaps CSS variables under the hood:

```html
<html class="app-dark">
```

### 🎨 Custom Theme Presets
Remap semantic design tokens by importing your brand's preset file (like the Acme theme):

```scss
@import "onyx-ng/themes/acme.css";
```

---

## Development & Scripts

Ensure you have dependencies installed:

```bash
npm install
```

### Build Design Tokens
Generate CSS variables from Style Dictionary token definitions:
```bash
npm run build:tokens
```

### Run Tests
Execute the unit test suite using **Jest** and **jest-axe** for automated accessibility checks:
```bash
npm test
```

### Static Typechecking
Verify typescript compiler strict rules check for components library:
```bash
npm run typecheck
```

---

## License

[MIT](./LICENSE) © Robert Ruben