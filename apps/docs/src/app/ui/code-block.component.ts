import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";

@Component({
  selector: "docs-code-block",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-code">
      <button type="button" class="docs-code__copy" (click)="copy()">
        {{ copied() ? "Copied" : "Copy" }}
      </button>
      <pre><code>{{ code() }}</code></pre>
    </div>
  `,
  styles: [
    `
      .docs-code {
        position: relative;
      }
      .docs-code__copy {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--ui-color-border);
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
      }
      .docs-code pre {
        margin: 0;
        padding: 1rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        background: var(--ui-color-surface-hover);
        border-radius: 0.5rem;
      }
      .docs-code code {
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
        white-space: pre;
      }
      @media (max-width: 480px) {
        .docs-code pre {
          padding: 0.75rem;
        }
        .docs-code code {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  protected readonly copied = signal(false);
  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
