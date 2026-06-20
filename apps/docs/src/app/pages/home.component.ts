import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonComponent } from "@onyx/ui/components";
import { COMPONENT_DOCS } from "../registry";
import { CodeBlockComponent } from "../ui/code-block.component";

interface Feature {
  icon: string;
  title: string;
  body: string;
}

@Component({
  selector: "docs-home",
  standalone: true,
  imports: [RouterLink, ButtonComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <span class="hero__eyebrow">Angular 19 · Standalone · Signals</span>
      <h1 class="hero__title">
        Build accessible Angular UIs,<br />
        <span class="hero__accent">themed by tokens.</span>
      </h1>
      <p class="hero__lead">
        Onyx UI is a styled-mode component library driven by design tokens.
        Re-skin the entire library for a new client by swapping one preset —
        without touching a single component.
      </p>
      <div class="hero__cta">
        <onyx-button size="lg" routerLink="/installation">Get started</onyx-button>
        <onyx-button
          size="lg"
          variant="secondary"
          routerLink="/components/button"
        >
          Browse components
        </onyx-button>
      </div>
      <div class="hero__stats">
        <div class="stat">
          <span class="stat__num">{{ count }}</span>
          <span class="stat__label">Components</span>
        </div>
        <div class="stat">
          <span class="stat__num">A11y</span>
          <span class="stat__label">axe-core clean</span>
        </div>
        <div class="stat">
          <span class="stat__num">Light · Dark</span>
          <span class="stat__label">Token-themed</span>
        </div>
      </div>
    </section>

    <section class="features">
      @for (f of features; track f.title) {
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">{{ f.icon }}</span>
          <h3 class="feature__title">{{ f.title }}</h3>
          <p class="feature__body">{{ f.body }}</p>
        </article>
      }
    </section>

    <section class="quickstart">
      <h2>Quick start</h2>
      <p class="quickstart__lead">
        Standalone components — import only what you use. No NgModules.
      </p>
      <docs-code-block [code]="snippet" language="ts" />
      <div class="quickstart__cta">
        <onyx-button variant="text" routerLink="/installation">
          Full installation guide →
        </onyx-button>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .hero {
        position: relative;
        text-align: center;
        padding: 2.25rem 0 2.5rem;
      }
      .hero::before {
        content: "";
        position: absolute;
        inset: -2.5rem -2.5rem auto;
        height: 24rem;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(
            55% 60% at 50% -5%,
            color-mix(in srgb, var(--ui-color-primary) 20%, transparent),
            transparent 70%
          ),
          radial-gradient(
            40% 50% at 85% 0%,
            color-mix(in srgb, var(--ui-color-primary) 10%, transparent),
            transparent 75%
          );
        -webkit-mask-image: radial-gradient(
          120% 90% at 50% 0%,
          #000 55%,
          transparent
        );
        mask-image: radial-gradient(120% 90% at 50% 0%, #000 55%, transparent);
      }
      .hero > * {
        position: relative;
        z-index: 1;
      }
      .hero__eyebrow {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ui-color-primary);
        background: color-mix(
          in srgb,
          var(--ui-color-primary) 12%,
          transparent
        );
        padding: 0.3rem 0.7rem;
        border-radius: 9999px;
        margin-bottom: 1.25rem;
      }
      .hero__title {
        margin: 0 0 1rem;
        font-size: 2.75rem;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.03em;
      }
      .hero__accent {
        color: var(--ui-color-primary);
      }
      .hero__lead {
        max-width: 56ch;
        margin: 0 auto 1.75rem;
        font-size: 1.0625rem;
        color: var(--ui-color-text-muted);
      }
      .hero__cta {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .hero__stats {
        display: flex;
        gap: 2.5rem;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 1px solid var(--ui-color-border);
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .stat__num {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--ui-color-text);
        letter-spacing: -0.02em;
      }
      .stat__label {
        font-size: 0.8125rem;
        color: var(--ui-color-text-muted);
      }
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 3rem 0;
      }
      .feature {
        padding: 1.5rem;
        border: 1px solid var(--ui-color-border);
        border-radius: var(--docs-radius);
        background: var(--ui-color-surface);
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease,
          transform 0.15s ease;
      }
      .feature:hover {
        border-color: color-mix(
          in srgb,
          var(--ui-color-primary) 55%,
          var(--ui-color-border)
        );
        box-shadow: var(--docs-shadow);
        transform: translateY(-3px);
      }
      .feature__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        font-size: 1.4rem;
        line-height: 1;
        border-radius: 0.75rem;
        background: color-mix(
          in srgb,
          var(--ui-color-primary) 12%,
          transparent
        );
      }
      .feature__title {
        margin: 0.85rem 0 0.4rem;
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .feature__body {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ui-color-text-muted);
      }
      .quickstart {
        margin-top: 3rem;
      }
      .quickstart h2 {
        font-size: 1.35rem;
        font-weight: 700;
        margin: 0 0 0.35rem;
      }
      .quickstart__lead {
        margin: 0 0 1rem;
        color: var(--ui-color-text-muted);
      }
      .quickstart__cta {
        margin-top: 0.75rem;
      }
      @media (max-width: 720px) {
        .hero__title {
          font-size: 2rem;
        }
        .hero__stats {
          gap: 1.5rem;
        }
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly count = COMPONENT_DOCS.length;
  protected readonly features: Feature[] = [
    {
      icon: "🎨",
      title: "Token-driven theming",
      body: "Three-tier design tokens. Clients = presets. Dark mode by remapping semantic tokens.",
    },
    {
      icon: "♿",
      title: "Accessible by default",
      body: "Correct ARIA, full keyboard nav, visible focus, zero axe-core violations.",
    },
    {
      icon: "⚡",
      title: "Signals & standalone",
      body: "Signal inputs/outputs, OnPush everywhere, new control flow. Modern Angular only.",
    },
    {
      icon: "🧩",
      title: "CDK under the hood",
      body: "Overlays, focus trap and positioning wrap @angular/cdk — never reinvented.",
    },
  ];
  protected readonly snippet = `import { Component } from '@angular/core';
import { ButtonComponent } from '@onyx/ui/components';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: \`<onyx-button (clicked)="save()">Save</onyx-button>\`,
})
export class DemoComponent {
  save() { /* ... */ }
}`;
}
