import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { OnyxBadgeComponent } from "@onyx/ui/components";
import { LIBRARY_DOCS } from "../libraries/registry";
import { CodeBlockComponent } from "../ui/code-block.component";

/**
 * Detail page for a single Python library: install, quickstart (Python),
 * features, a grouped API reference, auth/rate-limit notes, and links —
 * rendered with onyx components and the docs code block.
 */
@Component({
  selector: "docs-library-page",
  standalone: true,
  imports: [CodeBlockComponent, OnyxBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lib(); as l) {
      <article>
        <div class="lib-head">
          <h1>{{ l.name }}</h1>
          <onyx-badge
            [variant]="l.tier === 'stable' ? 'success' : 'info'"
            size="sm"
          >
            {{ l.tier }}
          </onyx-badge>
          <onyx-badge variant="neutral" size="sm">{{ l.category }}</onyx-badge>
          <span class="lib-head__version">v{{ l.version }}</span>
        </div>
        <p class="docs-lead">{{ l.tagline }}</p>
        <p class="lib-desc">{{ l.description }}</p>

        <nav class="toc" aria-label="On this page">
          <a class="toc__link" href="#install">Install</a>
          <a class="toc__link" href="#quickstart">Quickstart</a>
          <a class="toc__link" href="#features">Features</a>
          <a class="toc__link" href="#api">API reference</a>
          <a class="toc__link" href="#notes">Auth &amp; rate limits</a>
        </nav>

        <h2 id="install">
          Install
          <a class="anchor" href="#install" aria-label="Link to Install section"
            >#</a
          >
        </h2>
        <docs-code-block [code]="l.install" language="bash" />

        <h2 id="quickstart">
          Quickstart
          <a
            class="anchor"
            href="#quickstart"
            aria-label="Link to Quickstart section"
            >#</a
          >
        </h2>
        <docs-code-block [code]="l.quickstart" language="python" />

        <h2 id="features">
          Features
          <a
            class="anchor"
            href="#features"
            aria-label="Link to Features section"
            >#</a
          >
        </h2>
        <ul class="lib-features">
          @for (f of l.features; track f) {
            <li>{{ f }}</li>
          }
        </ul>

        <h2 id="api">
          API reference
          <a
            class="anchor"
            href="#api"
            aria-label="Link to API reference section"
            >#</a
          >
        </h2>
        @for (group of l.api; track group.title) {
          <h3 class="lib-api__title">{{ group.title }}</h3>
          <div class="docs-api-scroll">
            <table class="docs-api">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (row of group.rows; track row.name) {
                  <tr>
                    <td>
                      <code>{{ row.name }}</code>
                    </td>
                    <td>
                      <code>{{ row.signature }}</code>
                    </td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <h2 id="notes">
          Auth &amp; rate limits
          <a
            class="anchor"
            href="#notes"
            aria-label="Link to Auth and rate limits section"
            >#</a
          >
        </h2>
        @for (note of l.notes; track note) {
          <p class="lib-note">{{ note }}</p>
        }

        <div class="lib-links">
          <a
            class="lib-links__a"
            [href]="l.pypiUrl"
            target="_blank"
            rel="noopener noreferrer"
            >PyPI ↗</a
          >
          <a
            class="lib-links__a"
            [href]="l.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            >GitHub ↗</a
          >
          <a
            class="lib-links__a"
            [href]="l.docsUrl"
            target="_blank"
            rel="noopener noreferrer"
            >API docs ↗</a
          >
        </div>
      </article>
    } @else {
      <article>
        <h1>Library not found</h1>
        <p class="docs-lead">No Python library matches this URL.</p>
      </article>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        scroll-behavior: smooth;
      }
      .lib-head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-bottom: 0.5rem;
      }
      .lib-head h1 {
        margin: 0;
        font-family: var(--docs-mono);
        font-size: 1.85rem;
        font-weight: 700;
      }
      .lib-head__version {
        font-family: var(--docs-mono);
        font-size: 0.85rem;
        color: var(--ui-color-text-muted);
      }
      .docs-lead {
        margin: 0 0 0.5rem;
        max-width: 60ch;
        font-size: 1.05rem;
        color: var(--ui-color-text-muted);
      }
      .lib-desc {
        margin: 0 0 1.25rem;
        max-width: 64ch;
        color: var(--ui-color-text);
      }
      .toc {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 0 0 2rem;
      }
      .toc__link {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.7rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 600;
        text-decoration: none;
        color: var(--ui-color-text-muted);
        background: var(--ui-color-surface);
        transition:
          color 0.15s ease,
          border-color 0.15s ease,
          background-color 0.15s ease;
      }
      .toc__link:hover {
        color: var(--ui-color-primary);
        border-color: var(--ui-color-primary);
        background: color-mix(in srgb, var(--ui-color-primary) 8%, transparent);
      }
      .toc__link:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
      article > h2 {
        position: relative;
        margin: 2.5rem 0 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--ui-color-border);
        font-size: 1.35rem;
        font-weight: 700;
        scroll-margin-top: 5rem;
      }
      .anchor {
        margin-left: 0.4rem;
        font-weight: 700;
        text-decoration: none;
        color: var(--ui-color-primary);
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      article > h2:hover .anchor,
      .anchor:focus-visible {
        opacity: 1;
      }
      .anchor:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
        border-radius: 0.25rem;
      }
      .lib-features {
        margin: 0;
        padding-left: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        color: var(--ui-color-text);
        font-size: 0.95rem;
      }
      .lib-api__title {
        margin: 1.5rem 0 0.6rem;
        font-family: var(--docs-mono);
        font-size: 1rem;
        font-weight: 700;
      }
      .docs-api-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .docs-api {
        width: 100%;
        min-width: 540px;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .docs-api th,
      .docs-api td {
        text-align: left;
        padding: 0.5rem 0.75rem;
        vertical-align: top;
      }
      .docs-api thead th {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--ui-color-text-muted);
        border-bottom: 2px solid var(--ui-color-border);
      }
      .docs-api tbody td {
        border-bottom: 1px solid
          color-mix(in srgb, var(--ui-color-border) 60%, transparent);
      }
      .docs-api tbody tr:nth-child(even) td {
        background: color-mix(
          in srgb,
          var(--ui-color-surface-hover) 45%,
          transparent
        );
      }
      .docs-api tbody tr:hover td {
        background: var(--ui-color-surface-hover);
      }
      .docs-api code {
        font-family: var(--docs-mono, ui-monospace, monospace);
      }
      .docs-api tbody td:first-child code {
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .lib-note {
        margin: 0 0 0.85rem;
        max-width: 70ch;
        font-size: 0.9rem;
        color: var(--ui-color-text-muted);
      }
      .lib-links {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        margin-top: 2.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--ui-color-border);
      }
      .lib-links__a {
        font-size: 0.9rem;
        font-weight: 600;
        text-decoration: none;
        color: var(--ui-color-primary);
      }
      .lib-links__a:hover {
        text-decoration: underline;
      }
      .lib-links__a:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
        border-radius: 0.25rem;
      }
      @media (max-width: 480px) {
        .lib-head h1 {
          font-size: 1.4rem;
        }
        .docs-lead {
          font-size: 0.9375rem;
        }
        article > h2 {
          font-size: 1.1rem;
          margin-top: 1.75rem;
        }
        .anchor {
          display: none;
        }
      }
    `,
  ],
})
export class LibraryPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get("id"))),
    { initialValue: this.route.snapshot.paramMap.get("id") },
  );
  protected readonly lib = computed(() =>
    LIBRARY_DOCS.find((l) => l.id === this.id()),
  );
}
