import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { TOKEN_REFERENCE } from "./token-reference.generated";
import type {
  TokenBinding,
  TokenEntry,
  TokenTheme,
} from "./token-reference.model";

/** Values a swatch can paint. Anything else is shown as text only. */
const COLOUR = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i;

const sameBinding = (a: TokenBinding, b: TokenBinding): boolean =>
  a.alias === b.alias && a.value === b.value;

/**
 * One resolved value cell. `light` is the token's default binding; `binding`
 * is the one shown here (the same object for the light column). A theme cell
 * whose binding differs from the light default is marked as overridden, and
 * names the alias it goes through when that alias is what changed.
 */
@Component({
  selector: "docs-token-value",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="value" [class.value--changed]="changed()">
      <span class="value__main">
        @if (isColour()) {
          <span
            class="swatch"
            aria-hidden="true"
            [style.background]="binding().value"
          ></span>
        }
        <code>{{ binding().value }}</code>
        @if (changed()) {
          <span class="sr-only">(overridden)</span>
        }
      </span>
      @if (aliasChanged()) {
        <span class="via">
          via
          @if (binding().alias; as alias) {
            <code>{{ alias }}</code>
          } @else {
            literal
          }
        </span>
      }
    </span>
  `,
  styles: [
    `
      .value {
        display: inline-flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .value__main {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
      .value__main code {
        overflow-wrap: anywhere;
      }
      .value--changed code {
        font-weight: 600;
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
      .via {
        font-size: 0.75rem;
        color: var(--ui-color-text-muted);
      }
      .via code {
        font-size: 0.9em;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class TokenValueComponent {
  readonly light = input.required<TokenBinding>();
  readonly binding = input.required<TokenBinding>();

  protected readonly changed = computed(
    () => !sameBinding(this.binding(), this.light()),
  );
  protected readonly aliasChanged = computed(
    () => this.binding().alias !== this.light().alias,
  );
  protected readonly isColour = computed(() =>
    COLOUR.test(this.binding().value),
  );
}

interface TierGroup {
  tier: string;
  title: string;
  blurb: string;
  tokens: TokenEntry[];
}

/** Prose per tier is the one hand-written part of this page (CLAUDE.md §3). */
const TIER_BLURB: Record<string, string> = {
  primitive:
    "Raw scale values with no design meaning. Only semantic tokens reference them; a component never uses one directly.",
  semantic:
    "Design roles. This is the layer a client preset overrides: re-map these and every component follows.",
  component:
    "Per-component knobs, each mapped to a semantic token. Override one only for fine control of a single piece.",
};

/**
 * The generated token reference. Everything tabulated here comes from
 * token-reference.generated.ts, which `npm run build:tokens` emits through
 * style-dictionary from the same sources as the CSS -- nothing on this page is
 * maintained by hand except the tier blurbs.
 */
@Component({
  selector: "docs-token-reference",
  standalone: true,
  imports: [TokenValueComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="guide">
      <h1>Token reference</h1>
      <p class="docs-lead">
        Every CSS custom property the token build emits — {{ total }} tokens —
        with what it aliases and what it computes to in the light default and
        inside each preset.
      </p>
      <p>
        This page is generated from <code>libs/ui/tokens</code> by
        <code>npm run build:tokens</code>, through style-dictionary itself, so
        it cannot drift from the shipped CSS. Names are the literal custom
        properties: use them as <code>var(--ui-button-bg)</code>.
      </p>

      <h2>Presets</h2>
      <p>
        A preset is scoped to a class on the root element. The last column is
        how many tokens compute differently inside it: what the preset
        overrides, plus everything that aliases those tokens.
      </p>
      <div class="docs-api-scroll">
        <table class="ref-table ref-table--presets">
          <thead>
            <tr>
              <th scope="col">Preset</th>
              <th scope="col">Selector</th>
              <th scope="col">Source</th>
              <th scope="col">Tokens changed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">light (default)</th>
              <td><code>:root</code></td>
              <td><code>libs/ui/tokens/tokens/</code></td>
              <td>—</td>
            </tr>
            @for (theme of themes; track theme.name) {
              <tr>
                <th scope="row">{{ theme.name }}</th>
                <td>
                  <code>{{ theme.selector }}</code>
                </td>
                <td>
                  <code>{{ theme.source }}</code>
                </td>
                <td>{{ overrideCounts.get(theme.name) }} of {{ total }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <h2>Tokens</h2>
      <div class="filter">
        <label for="token-filter">Filter</label>
        <input
          id="token-filter"
          type="search"
          autocomplete="off"
          placeholder="name, path, alias or value"
          [value]="query()"
          (input)="onQuery($event)"
        />
        <span class="filter__count" role="status">
          {{ shown() }} of {{ total }} shown
        </span>
      </div>

      @for (group of groups(); track group.tier) {
        <section class="tier-group">
          <h3 [id]="'tier-' + group.tier">
            {{ group.title }}
            <span class="count">{{ group.tokens.length }}</span>
          </h3>
          @if (group.blurb) {
            <p>{{ group.blurb }}</p>
          }
          <div class="docs-api-scroll">
            <table class="ref-table">
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Alias</th>
                  <th scope="col">Light</th>
                  @for (theme of themes; track theme.name) {
                    <th scope="col">{{ theme.name }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (token of group.tokens; track token.name) {
                  <tr>
                    <th scope="row">
                      <code>{{ token.name }}</code>
                    </th>
                    <td>
                      @if (token.alias; as alias) {
                        <code>{{ alias }}</code>
                      } @else {
                        <span class="literal">literal</span>
                      }
                    </td>
                    <td>
                      <docs-token-value [light]="token" [binding]="token" />
                    </td>
                    @for (theme of themes; track theme.name) {
                      <td [class.cell--inherited]="inherited(token, theme)">
                        <docs-token-value
                          [light]="token"
                          [binding]="bindingIn(token, theme)"
                        />
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @empty {
        <p class="empty">No tokens match “{{ query() }}”.</p>
      }
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
        margin: 0 0 1rem;
        max-width: 62ch;
        font-size: 1.05rem;
        color: var(--ui-color-text-muted);
      }
      .guide h2 {
        margin: 2.5rem 0 0.75rem;
        font-size: 1.35rem;
        font-weight: 700;
      }
      .guide h3 {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin: 2rem 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        text-transform: capitalize;
      }
      .count {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.1rem 0.5rem;
        border-radius: 999px;
        background: var(--ui-color-surface-hover);
        color: var(--ui-color-text-muted);
      }
      .guide p {
        max-width: 64ch;
      }
      .guide code {
        font-family: var(--docs-mono);
        font-size: 0.85em;
      }
      .filter {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin: 1rem 0 0.5rem;
      }
      .filter label {
        font-size: 0.875rem;
        font-weight: 600;
      }
      .filter input {
        flex: 1 1 16rem;
        max-width: 28rem;
        padding: 0.45rem 0.7rem;
        font: inherit;
        font-size: 0.9rem;
        color: var(--ui-color-text);
        background: var(--ui-color-surface);
        border: 1px solid var(--ui-color-border);
        border-radius: 0.5rem;
      }
      .filter input:focus-visible {
        outline: var(--ui-focus-ring-width) solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
      .filter__count {
        font-size: 0.8rem;
        color: var(--ui-color-text-muted);
      }
      .docs-api-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .ref-table {
        width: 100%;
        min-width: 720px;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      .ref-table--presets {
        min-width: 520px;
      }
      .ref-table th,
      .ref-table td {
        text-align: left;
        padding: 0.45rem 0.7rem;
        vertical-align: top;
      }
      .ref-table thead th {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--ui-color-text-muted);
        border-bottom: 2px solid var(--ui-color-border);
      }
      .ref-table tbody th {
        font-weight: 400;
        white-space: nowrap;
      }
      .ref-table tbody th,
      .ref-table tbody td {
        border-bottom: 1px solid
          color-mix(in srgb, var(--ui-color-border) 60%, transparent);
      }
      .ref-table tbody tr:nth-child(even) > * {
        background: color-mix(
          in srgb,
          var(--ui-color-surface-hover) 45%,
          transparent
        );
      }
      .ref-table tbody tr:hover > * {
        background: var(--ui-color-surface-hover);
      }
      .ref-table code {
        font-family: var(--docs-mono);
        font-size: 0.8rem;
      }
      .literal,
      .cell--inherited {
        color: var(--ui-color-text-muted);
      }
      .empty {
        margin: 1.5rem 0;
        color: var(--ui-color-text-muted);
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
export class TokenReferenceComponent {
  protected readonly themes: TokenTheme[] = TOKEN_REFERENCE.themes;
  protected readonly total = TOKEN_REFERENCE.tokens.length;
  protected readonly overrideCounts = new Map(
    TOKEN_REFERENCE.themes.map((theme) => [
      theme.name,
      TOKEN_REFERENCE.tokens.filter((t) => theme.name in t.themes).length,
    ]),
  );

  protected readonly query = signal("");

  /** Tiers in emission order, each holding the tokens the filter keeps. */
  protected readonly groups = computed<TierGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    const keep = (t: TokenEntry): boolean =>
      q === "" ||
      t.name.includes(q) ||
      t.path.includes(q) ||
      (t.alias?.includes(q) ?? false) ||
      t.value.toLowerCase().includes(q);
    const tiers = [...new Set(TOKEN_REFERENCE.tokens.map((t) => t.tier))];
    return tiers
      .map((tier) => ({
        tier,
        title: tier,
        blurb: TIER_BLURB[tier] ?? "",
        tokens: TOKEN_REFERENCE.tokens.filter(
          (t) => t.tier === tier && keep(t),
        ),
      }))
      .filter((group) => group.tokens.length > 0);
  });

  protected readonly shown = computed(() =>
    this.groups().reduce((n, group) => n + group.tokens.length, 0),
  );

  protected bindingIn(token: TokenEntry, theme: TokenTheme): TokenBinding {
    return token.themes[theme.name] ?? token;
  }

  /** True when the theme leaves the token exactly as the light default binds it. */
  protected inherited(token: TokenEntry, theme: TokenTheme): boolean {
    return !(theme.name in token.themes);
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
