import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { ButtonComponent } from "@onyx/ui/components";
import { Demo } from "../doc-model";
import { CodeBlockComponent } from "./code-block.component";

@Component({
  selector: "docs-demo-block",
  standalone: true,
  imports: [NgComponentOutlet, CodeBlockComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="docs-demo">
      <div class="docs-demo__intro">
        <h3 class="docs-demo__title">{{ demo().title }}</h3>
        @if (demo().description) {
          <p class="docs-demo__desc">{{ demo().description }}</p>
        }
      </div>
      <div class="docs-demo__card" [class.is-open]="open()">
        <div class="docs-demo__preview">
          <ng-container [ngComponentOutlet]="demo().component" />
        </div>
        <div class="docs-demo__bar">
          <ui-button
            variant="text"
            size="sm"
            [attr.aria-expanded]="open()"
            (clicked)="open.set(!open())"
          >
            {{ open() ? "Hide code" : "Show code" }}
          </ui-button>
        </div>
        @if (open()) {
          <docs-code-block [code]="demo().code" />
        }
      </div>
    </section>
  `,
  styles: [
    `
      .docs-demo {
        margin: 2rem 0;
      }
      .docs-demo__intro {
        margin-bottom: 0.6rem;
      }
      .docs-demo__title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }
      .docs-demo__desc {
        margin: 0.25rem 0 0;
        color: var(--ui-color-text-muted);
        font-size: 0.9375rem;
      }
      /* Unified demo card: preview, toolbar and code read as one surface. */
      .docs-demo__card {
        border: 1px solid var(--ui-color-border);
        border-radius: var(--docs-radius, 0.75rem);
        background: var(--ui-color-surface);
        overflow: hidden;
      }
      .docs-demo__preview {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        padding: 1.75rem;
        min-width: 0;
      }
      .docs-demo__bar {
        display: flex;
        justify-content: flex-end;
        padding: 0.35rem 0.5rem;
        border-top: 1px solid var(--ui-color-border);
        background: var(--docs-code-bg);
      }
      /* Tuck the code panel's own border under the card edges so the open
         state reads as one connected block (no gap, no double border). */
      .docs-demo__card docs-code-block {
        display: block;
        margin: -1px -1px -1px;
      }
      @media (max-width: 480px) {
        .docs-demo__preview {
          padding: 1.15rem;
        }
      }
    `,
  ],
})
export class DemoBlockComponent {
  readonly demo = input.required<Demo>();
  protected readonly open = signal(false);
}
