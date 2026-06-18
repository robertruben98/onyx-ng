import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  ButtonComponent,
  BadgeComponent,
  TagComponent,
} from "@onyx/ui/components";
import { CodeBlockComponent } from "../ui/code-block.component";

interface TokenRow {
  token: string;
  role: string;
  /** When set, render a decorative swatch using this CSS value. */
  swatch?: string;
}

@Component({
  selector: "docs-theming",
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, TagComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="guide">
      <h1>Theming</h1>
      <p class="docs-lead">
        Every visual decision is a design token. Re-skin the whole library for a
        client by overriding semantic tokens — you never edit a component.
      </p>

      <h2>Three tiers</h2>
      <p>
        Tokens cascade from raw primitives, to semantic roles, to per-component
        knobs. Components reference only the semantic and component tiers —
        never a raw value.
      </p>
      <div class="tier">
        <div class="tier__row">
          <span class="tier__name">Primitive</span>
          <code>--ui-blue-500</code>
          <span class="tier__desc">Raw scale value, no meaning.</span>
        </div>
        <div class="tier__row">
          <span class="tier__name tier__name--mid">Semantic</span>
          <code>--ui-color-primary</code>
          <span class="tier__desc"
            >Design role. The layer presets override.</span
          >
        </div>
        <div class="tier__row">
          <span class="tier__name tier__name--cmp">Component</span>
          <code>--ui-button-bg</code>
          <span class="tier__desc">One piece, mapped to a semantic token.</span>
        </div>
      </div>

      <h2>Live preview</h2>
      <p>
        Use the controls in the top bar to switch preset and light/dark. These
        elements re-theme instantly — no recompile, no component changes.
      </p>
      <div class="preview">
        <ui-button>Primary</ui-button>
        <ui-button variant="secondary">Secondary</ui-button>
        <ui-button variant="text">Text</ui-button>
        <ui-badge>New</ui-badge>
        <ui-tag>Stable</ui-tag>
      </div>

      <h2>Key semantic tokens</h2>
      <div class="docs-api-scroll">
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            @for (row of tokens; track row.token) {
              <tr>
                <td>
                  <span class="token-cell">
                    @if (row.swatch) {
                      <span
                        class="swatch"
                        aria-hidden="true"
                        [style.background]="row.swatch"
                      ></span>
                    }
                    <code>{{ row.token }}</code>
                  </span>
                </td>
                <td>{{ row.role }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <h2>Create a client preset</h2>
      <p>
        A preset is one CSS file that re-maps semantic tokens under a class.
        Activate it by adding the class to your root element.
      </p>
      <docs-code-block [code]="preset" language="css" />

      <h2>Dark mode</h2>
      <p>
        Dark mode is the same mechanism: a class that re-maps semantic tokens.
        Toggle <code>app-dark</code> on <code>&lt;html&gt;</code>.
      </p>
      <docs-code-block [code]="darkCss" language="css" />
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
      }
      .tier {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 1rem 0;
      }
      .tier__row {
        display: grid;
        grid-template-columns: 7rem auto 1fr;
        gap: 0.75rem;
        align-items: center;
        padding: 0.6rem 0.85rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 0.5rem;
        background: var(--ui-color-surface);
        transition: border-color 0.15s ease;
      }
      .tier__row:hover {
        border-color: color-mix(
          in srgb,
          var(--ui-color-primary) 45%,
          var(--ui-color-border)
        );
      }
      .tier__name {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: center;
        padding: 0.2rem 0;
        border-radius: 0.3rem;
        background: var(--ui-color-surface-hover);
        color: var(--ui-color-text-muted);
      }
      .tier__name--mid {
        background: color-mix(
          in srgb,
          var(--ui-color-primary) 16%,
          transparent
        );
        color: var(--ui-color-primary);
      }
      .tier__name--cmp {
        background: color-mix(in srgb, var(--ui-color-primary) 8%, transparent);
        color: var(--ui-color-primary);
      }
      .tier__row code {
        font-family: var(--docs-mono);
        font-size: 0.8rem;
        white-space: nowrap;
      }
      .tier__desc {
        font-size: 0.875rem;
        color: var(--ui-color-text-muted);
      }
      .preview {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
        padding: 1.75rem;
        border: 1px solid var(--ui-color-border);
        border-radius: var(--docs-radius);
        background: var(--ui-color-surface);
        margin: 1rem 0;
      }
      .docs-api-scroll {
        overflow-x: auto;
      }
      .token-table {
        width: 100%;
        min-width: 420px;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .token-table th,
      .token-table td {
        text-align: left;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid var(--ui-color-border);
      }
      .token-table code {
        font-family: var(--docs-mono);
      }
      .token-cell {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
      }
      .swatch {
        flex-shrink: 0;
        width: 1rem;
        height: 1rem;
        border-radius: 0.3rem;
        border: 1px solid
          color-mix(in srgb, var(--ui-color-text) 18%, transparent);
        box-shadow: inset 0 0 0 1px var(--ui-color-surface);
      }
      docs-code-block {
        display: block;
        margin: 0.75rem 0;
      }
      @media (max-width: 600px) {
        .tier__row {
          grid-template-columns: 6rem 1fr;
        }
        .tier__desc {
          grid-column: 1 / -1;
        }
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
export class ThemingComponent {
  protected readonly tokens: TokenRow[] = [
    {
      token: "--ui-color-primary",
      role: "Primary action / brand color",
      swatch: "var(--ui-color-primary)",
    },
    {
      token: "--ui-color-surface",
      role: "Component background",
      swatch: "var(--ui-color-surface)",
    },
    {
      token: "--ui-color-text",
      role: "Default foreground text",
      swatch: "var(--ui-color-text)",
    },
    {
      token: "--ui-color-text-muted",
      role: "Secondary / muted text",
      swatch: "var(--ui-color-text-muted)",
    },
    {
      token: "--ui-color-border",
      role: "Borders and dividers",
      swatch: "var(--ui-color-border)",
    },
    {
      token: "--ui-focus-ring",
      role: "Visible focus indicator",
      swatch: "var(--ui-focus-ring)",
    },
    { token: "--ui-radius", role: "Default corner radius" },
  ];

  protected readonly preset = `/* acme.css — one file, no component edits */
.ui-theme-acme {
  --ui-color-primary: #7c3aed;
  --ui-color-primary-hover: #6d28d9;
  --ui-focus-ring: #8b5cf6;
  --ui-radius: 9999px;
}`;

  protected readonly darkCss = `.app-dark {
  --ui-color-surface: #0f172a;
  --ui-color-text: #e2e8f0;
  --ui-color-border: #1e293b;
}`;
}
