import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ApiRow } from "../doc-model";

@Component({
  selector: "docs-api-table",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-api-scroll">
      <table class="docs-api">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.name) {
            <tr>
              <td>
                <code>{{ row.name }}</code>
              </td>
              <td>
                <code>{{ row.type }}</code>
              </td>
              <td>
                <code>{{ row.default }}</code>
              </td>
              <td>{{ row.description }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
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
      /* Zebra striping for scannability. */
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
      .docs-api th:last-child,
      .docs-api td:last-child {
        min-width: 160px;
      }
      .docs-api code {
        font-family: var(--docs-mono, ui-monospace, monospace);
      }
      /* Emphasize the property Name column. */
      .docs-api tbody td:first-child code {
        font-weight: 600;
        color: var(--ui-color-text);
      }
      @media (max-width: 480px) {
        .docs-api {
          font-size: 0.8125rem;
        }
        .docs-api th,
        .docs-api td {
          padding: 0.375rem 0.5rem;
        }
      }
    `,
  ],
})
export class ApiTableComponent {
  readonly rows = input.required<ApiRow[]>();
}
