import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { OnyxButtonComponent } from "@onyx/ui/components";
import { CodeBlockComponent } from "../ui/code-block.component";

@Component({
  selector: "docs-installation",
  standalone: true,
  imports: [RouterLink, OnyxButtonComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="guide">
      <h1>Installation</h1>
      <p class="docs-lead">
        Onyx UI ships standalone Angular components and a token-based theme. Add
        the package, register the CSS once, then import components where you use
        them.
      </p>

      <h2>Requirements</h2>
      <ul class="guide__list">
        <li>
          <strong>Angular 19+</strong> — standalone APIs and the new control
          flow.
        </li>
        <li>
          <strong>&#64;angular/cdk</strong> — overlays, focus trap and
          positioning.
        </li>
      </ul>

      <h2>1. Install</h2>
      <p>Add the library and its peer dependency:</p>
      <docs-code-block [code]="install" language="bash" />

      <h2>2. Register the styles</h2>
      <p>
        Add the token stylesheet and the CDK overlay styles to the
        <code>styles</code> array of your <code>angular.json</code>. Theme files
        are optional — include <code>dark.css</code> for dark mode and any
        client preset you need.
      </p>
      <docs-code-block [code]="styles" language="ts" />

      <h2>3. Use a component</h2>
      <p>
        Import the component directly into a standalone component's
        <code>imports</code>. No NgModules.
      </p>
      <docs-code-block [code]="usage" language="ts" />

      <h2>4. Enable dark mode</h2>
      <p>
        Dark mode is a class on the document root that re-maps semantic tokens —
        components never branch on theme. Toggle <code>onyx-dark</code> on
        <code>&lt;html&gt;</code>:
      </p>
      <docs-code-block [code]="dark" language="ts" />

      <div class="guide__next">
        <onyx-button routerLink="/theming">Continue to Theming →</onyx-button>
      </div>
    </article>
  `,
  styles: [
    `
      .guide h1 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
        font-weight: 700;
      }
      .docs-lead {
        margin: 0 0 2rem;
        max-width: 62ch;
        font-size: 1.05rem;
        color: var(--ui-color-text-muted);
      }
      .guide h2 {
        margin: 2.5rem 0 0.75rem;
        font-size: 1.35rem;
        font-weight: 700;
      }
      .guide p {
        max-width: 64ch;
      }
      .guide code {
        font-family: var(--docs-mono);
        font-size: 0.85em;
        background: var(--docs-code-bg);
        padding: 0.1rem 0.35rem;
        border-radius: 0.3rem;
      }
      .guide__list {
        max-width: 64ch;
        padding-left: 1.2rem;
      }
      .guide__list li {
        margin: 0.35rem 0;
      }
      .guide__list code {
        background: none;
        padding: 0;
      }
      docs-code-block {
        display: block;
        margin: 0.75rem 0;
      }
      .guide__next {
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--ui-color-border);
      }
      @media (max-width: 480px) {
        .guide h1 {
          font-size: 1.5rem;
        }
        .guide h2 {
          font-size: 1.1rem;
        }
      }
    `,
  ],
})
export class InstallationComponent {
  protected readonly install = `npm install @robertruben98/onyx-ui @angular/cdk`;

  protected readonly styles = `// angular.json → projects.app.architect.build.options
"styles": [
  "node_modules/@angular/cdk/overlay-prebuilt.css",
  "node_modules/@robertruben98/onyx-ui/styles/tokens.css",
  "node_modules/@robertruben98/onyx-ui/styles/themes/dark.css",   // optional: dark mode
  "src/styles.css"
]`;

  protected readonly usage = `import { Component } from '@angular/core';
import { OnyxButtonComponent, OnyxInputComponent } from '@robertruben98/onyx-ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [OnyxButtonComponent, OnyxInputComponent],
  template: \`
    <onyx-input placeholder="Email" />
    <onyx-button (clicked)="submit()">Sign in</onyx-button>
  \`,
})
export class LoginComponent {
  submit() { /* ... */ }
}`;

  protected readonly dark = `// Toggle dark mode from anywhere
document.documentElement.classList.toggle('onyx-dark');`;
}
