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
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        color: var(--ui-color-text);
        text-decoration: none;
      }
      .docs-sidebar a.is-active {
        background: var(--ui-color-surface-hover);
        color: var(--ui-color-primary);
        font-weight: 600;
      }
    `,
  ],
})
export class SidebarComponent {
  protected readonly docs = COMPONENT_DOCS;
}
