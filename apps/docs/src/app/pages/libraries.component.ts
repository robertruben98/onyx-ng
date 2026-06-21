import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  OnyxBadgeComponent,
  OnyxCardComponent,
  OnyxGridComponent,
} from "@onyx/ui/components";
import { LIBRARY_DOCS } from "../libraries/registry";
import { LibraryTier } from "../library-model";

/** Maps a library tier to a badge variant. */
const TIER_VARIANT: Record<LibraryTier, "success" | "info"> = {
  stable: "success",
  beta: "info",
};

/**
 * Index page for the Python Libraries section: an overview plus a responsive
 * grid of cards, one per library, each linking to its detail page.
 */
@Component({
  selector: "docs-libraries",
  standalone: true,
  imports: [
    RouterLink,
    OnyxGridComponent,
    OnyxCardComponent,
    OnyxBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <h1>Python Libraries</h1>
      <p class="docs-lead">
        Typed Python client libraries for crypto and DeFi APIs — price oracles,
        DEX aggregators, cross-chain bridges, and lending analytics. Every
        library ships sync and async clients, pydantic v2 models, and full type
        hints.
      </p>

      <onyx-grid [columns]="1" [columnsSm]="2" [columnsLg]="3" gap="md">
        @for (lib of libraries; track lib.id) {
          <onyx-card variant="outlined" class="lib-card">
            <a
              class="lib-card__link"
              [routerLink]="['/libraries', lib.id]"
              [attr.aria-label]="'Open ' + lib.name + ' documentation'"
            >
              <div class="lib-card__head">
                <h2 class="lib-card__name">{{ lib.name }}</h2>
                <onyx-badge [variant]="tierVariant(lib.tier)" size="sm">
                  {{ lib.tier }}
                </onyx-badge>
              </div>
              <p class="lib-card__tagline">{{ lib.tagline }}</p>
              <div class="lib-card__meta">
                <onyx-badge variant="neutral" size="sm">{{
                  lib.category
                }}</onyx-badge>
                <span class="lib-card__version">v{{ lib.version }}</span>
              </div>
              <code class="lib-card__install"
                >pip install {{ lib.pypiName }}</code
              >
            </a>
            <div class="lib-card__foot">
              <a
                class="lib-card__ext"
                [href]="lib.pypiUrl"
                target="_blank"
                rel="noopener noreferrer"
                >PyPI</a
              >
              <a
                class="lib-card__ext"
                [href]="lib.githubUrl"
                target="_blank"
                rel="noopener noreferrer"
                >GitHub</a
              >
            </div>
          </onyx-card>
        }
      </onyx-grid>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      article > h1 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
        font-weight: 700;
      }
      .docs-lead {
        margin: 0 0 2rem;
        max-width: 60ch;
        font-size: 1.05rem;
        color: var(--ui-color-text-muted);
      }
      .lib-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .lib-card__link {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        text-decoration: none;
        color: inherit;
        border-radius: var(--ui-radius);
      }
      .lib-card__link:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 3px;
      }
      .lib-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .lib-card__name {
        margin: 0;
        font-family: var(--docs-mono);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--ui-color-text);
      }
      .lib-card__link:hover .lib-card__name {
        color: var(--ui-color-primary);
      }
      .lib-card__tagline {
        margin: 0;
        font-size: 0.9rem;
        color: var(--ui-color-text-muted);
      }
      .lib-card__meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .lib-card__version {
        font-family: var(--docs-mono);
        font-size: 0.75rem;
        color: var(--ui-color-text-muted);
      }
      .lib-card__install {
        display: block;
        margin-top: 0.25rem;
        padding: 0.5rem 0.65rem;
        font-family: var(--docs-mono);
        font-size: 0.78rem;
        color: var(--ui-color-text);
        background: var(--docs-code-bg);
        border: 1px solid var(--ui-color-border);
        border-radius: 0.4rem;
        overflow-x: auto;
        white-space: nowrap;
      }
      .lib-card__foot {
        display: flex;
        gap: 1rem;
        margin-top: 0.85rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--ui-color-border);
      }
      .lib-card__ext {
        font-size: 0.8125rem;
        font-weight: 600;
        text-decoration: none;
        color: var(--ui-color-primary);
      }
      .lib-card__ext:hover {
        text-decoration: underline;
      }
      .lib-card__ext:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
        border-radius: 0.25rem;
      }
      @media (max-width: 480px) {
        article > h1 {
          font-size: 1.5rem;
        }
        .docs-lead {
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
        }
      }
    `,
  ],
})
export class LibrariesComponent {
  protected readonly libraries = LIBRARY_DOCS;
  protected tierVariant(tier: LibraryTier): "success" | "info" {
    return TIER_VARIANT[tier];
  }
}
