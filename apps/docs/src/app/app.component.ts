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
      <div class="docs-topbar__inner">
        <span class="docs-brand">
          <span class="docs-brand__dot" aria-hidden="true"></span>
          Onyx <span class="docs-brand__accent">UI</span>
        </span>
        <docs-theme-controls />
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
      }
      @media (max-width: 720px) {
        .docs-layout {
          grid-template-columns: 1fr;
        }
        .docs-aside {
          position: static;
          max-height: none;
        }
      }
    `,
  ],
})
export class AppComponent {}
