import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { COMPONENT_DOCS } from "../registry";

@Component({
  selector: "docs-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="docs-sidebar" aria-label="Components">
      <p class="docs-sidebar__label">Components</p>
      <ul>
        @for (doc of docs; track doc.id) {
          <li>
            <a
              [routerLink]="['/components', doc.id]"
              routerLinkActive="is-active"
            >
              {{ doc.title }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [
    `
      .docs-sidebar__label {
        margin: 0 0 0.5rem 0.75rem;
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ui-color-text-muted);
      }
      .docs-sidebar ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .docs-sidebar a {
        display: block;
        padding: 0.4375rem 0.75rem;
        border-radius: 0.5rem;
        color: var(--ui-color-text);
        text-decoration: none;
        font-size: 0.9rem;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
      }
      .docs-sidebar a:hover {
        background: var(--ui-color-surface-hover);
      }
      .docs-sidebar a.is-active {
        background: color-mix(
          in srgb,
          var(--ui-color-primary) 12%,
          transparent
        );
        color: var(--ui-color-primary);
        font-weight: 600;
      }
      .docs-sidebar a:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
    `,
  ],
})
export class SidebarComponent {
  protected readonly docs = COMPONENT_DOCS;
}
