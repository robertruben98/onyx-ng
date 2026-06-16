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
      <div class="docs-demo__header">
        <h3 class="docs-demo__title">{{ demo().title }}</h3>
        <ui-button variant="text" size="sm" (clicked)="open.set(!open())">
          {{ open() ? "Hide code" : "Show code" }}
        </ui-button>
      </div>
      @if (demo().description) {
        <p class="docs-demo__desc">{{ demo().description }}</p>
      }
      <div class="docs-demo__preview">
        <ng-container [ngComponentOutlet]="demo().component" />
      </div>
      @if (open()) {
        <docs-code-block [code]="demo().code" />
      }
    </section>
  `,
  styles: [
    `
      .docs-demo {
        margin: 2rem 0;
      }
      .docs-demo__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.25rem;
      }
      .docs-demo__title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }
      .docs-demo__desc {
        margin: 0 0 0.75rem;
        color: var(--ui-color-text-muted);
        font-size: 0.9375rem;
      }
      .docs-demo__preview {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        padding: 1.75rem;
        background: var(--ui-color-surface);
        border: 1px solid var(--ui-color-border);
        border-radius: 0.75rem;
        min-width: 0;
      }
      docs-code-block {
        display: block;
        margin-top: 0.75rem;
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
