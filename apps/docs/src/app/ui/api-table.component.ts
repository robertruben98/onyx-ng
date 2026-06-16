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
        border-bottom: 1px solid var(--ui-color-border);
        vertical-align: top;
      }
      .docs-api th:last-child,
      .docs-api td:last-child {
        min-width: 160px;
      }
      .docs-api code {
        font-family: ui-monospace, monospace;
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
