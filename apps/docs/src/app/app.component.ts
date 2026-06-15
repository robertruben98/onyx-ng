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
      <span class="docs-brand">Onyx UI</span>
      <docs-theme-controls />
    </header>
    <div class="docs-layout">
      <aside class="docs-aside"><docs-sidebar /></aside>
      <main class="docs-main"><router-outlet /></main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
      .docs-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        border-bottom: 1px solid var(--ui-color-border);
      }
      .docs-brand {
        font-weight: 600;
        font-size: 1.125rem;
      }
      .docs-layout {
        display: grid;
        grid-template-columns: 220px 1fr;
      }
      .docs-aside {
        padding: 1rem;
        border-right: 1px solid var(--ui-color-border);
        min-height: calc(100vh - 56px);
      }
      .docs-main {
        padding: 1.5rem 2rem;
        max-width: 880px;
      }
    `,
  ],
})
export class AppComponent {}
