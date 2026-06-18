import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { ThemeControlsComponent } from "./theme/theme-controls.component";
import { SearchComponent } from "./search/search.component";

@Component({
  selector: "docs-root",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    SidebarComponent,
    ThemeControlsComponent,
    SearchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="docs-topbar">
      <div class="docs-topbar__inner">
        <a
          class="docs-brand"
          routerLink="/introduction"
          aria-label="Onyx UI home"
        >
          <span class="docs-brand__dot" aria-hidden="true"></span>
          Onyx <span class="docs-brand__accent">UI</span>
          <span class="docs-brand__ver">v0.0.0</span>
        </a>
        <div class="docs-topbar__actions">
          <docs-search />
          <a
            class="docs-topbar__gh"
            href="https://github.com/robertruben98/onyx-ng"
            target="_blank"
            rel="noopener"
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.49-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
          </a>
          <docs-theme-controls />
        </div>
      </div>
    </header>
    <div class="docs-layout">
      <aside class="docs-aside"><docs-sidebar /></aside>
      <main class="docs-main">
        <div class="docs-panel"><router-outlet /></div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
      .docs-topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--docs-topbar-bg);
        backdrop-filter: saturate(180%) blur(8px);
        border-bottom: 1px solid var(--ui-color-border);
      }
      .docs-topbar__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0.75rem 1.5rem;
      }
      .docs-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 1.125rem;
        letter-spacing: -0.02em;
        text-decoration: none;
        color: var(--ui-color-text);
      }
      .docs-brand:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 4px;
        border-radius: 0.4rem;
      }
      .docs-brand__ver {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--ui-color-text-muted);
        background: var(--ui-color-surface-hover);
        padding: 0.1rem 0.4rem;
        border-radius: 9999px;
        letter-spacing: 0;
      }
      .docs-topbar__actions {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
      }
      .docs-topbar__gh {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        color: var(--ui-color-text-muted);
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
      }
      .docs-topbar__gh:hover {
        background: var(--ui-color-surface-hover);
        color: var(--ui-color-text);
      }
      .docs-topbar__gh:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
      .docs-brand__dot {
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 9999px;
        background: var(--ui-color-primary);
        box-shadow: 0 0 0 4px
          color-mix(in srgb, var(--ui-color-primary) 22%, transparent);
      }
      .docs-brand__accent {
        color: var(--ui-color-primary);
      }
      .docs-layout {
        display: grid;
        grid-template-columns: 248px minmax(0, 1fr);
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
        align-items: start;
      }
      .docs-aside {
        position: sticky;
        top: 4.25rem;
        padding: 1.5rem 0;
        max-height: calc(100vh - 4.25rem);
        overflow-y: auto;
      }
      .docs-main {
        padding: 1.5rem 0 4rem;
        min-width: 0;
      }
      .docs-panel {
        background: var(--ui-color-surface);
        border: 1px solid var(--ui-color-border);
        border-radius: var(--docs-radius);
        box-shadow: var(--docs-shadow-panel);
        padding: 2rem 2.25rem;
        /* prevent content inside from pushing past the card edge */
        overflow: hidden;
      }
      @media (max-width: 720px) {
        .docs-layout {
          grid-template-columns: 1fr;
          gap: 0;
          padding: 0 0.75rem;
        }
        .docs-aside {
          position: static;
          max-height: none;
          padding: 0.75rem 0 0;
        }
        .docs-main {
          padding: 1rem 0 3rem;
        }
        .docs-panel {
          padding: 1.25rem 1rem;
          border-radius: 0.5rem;
        }
        .docs-topbar__inner {
          padding: 0.625rem 0.75rem;
        }
      }
      @media (max-width: 480px) {
        .docs-layout {
          padding: 0 0.5rem;
        }
        .docs-panel {
          padding: 1rem 0.75rem;
        }
      }
    `,
  ],
})
export class AppComponent {}
