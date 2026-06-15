import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { Demo } from "../doc-model";
import { CodeBlockComponent } from "./code-block.component";

@Component({
  selector: "docs-demo-block",
  standalone: true,
  imports: [NgComponentOutlet, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="docs-demo">
      <h3>{{ demo().title }}</h3>
      @if (demo().description) {
        <p>{{ demo().description }}</p>
      }
      <div class="docs-demo__preview">
        <ng-container [ngComponentOutlet]="demo().component" />
      </div>
      <button
        type="button"
        class="docs-demo__toggle"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        {{ open() ? "Hide code" : "Show code" }}
      </button>
      @if (open()) {
        <docs-code-block [code]="demo().code" />
      }
    </section>
  `,
  styles: [
    `
      .docs-demo {
        margin: 1.5rem 0;
      }
      .docs-demo__preview {
        padding: 1.5rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }
      .docs-demo__toggle {
        margin: 0.5rem 0;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--ui-color-border);
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
    `,
  ],
})
export class DemoBlockComponent {
  readonly demo = input.required<Demo>();
  protected readonly open = signal(false);
}
