import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { OnyxButtonComponent } from "@onyx/ui/components";
import { highlight } from "./highlight";

@Component({
  selector: "docs-code-block",
  standalone: true,
  imports: [OnyxButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-code">
      <span class="docs-code__lang" aria-hidden="true">{{ language() }}</span>
      <onyx-button
        class="docs-code__copy"
        variant="secondary"
        size="sm"
        (clicked)="copy()"
      >
        {{ copied() ? "Copied" : "Copy" }}
      </onyx-button>
      <pre><code [innerHTML]="html()"></code></pre>
    </div>
  `,
  styles: [
    `
      .docs-code {
        position: relative;
      }
      .docs-code__lang {
        position: absolute;
        top: 0.5rem;
        left: 0.75rem;
        z-index: 1;
        font-family: var(--docs-mono);
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ui-color-text-muted);
        opacity: 0.7;
      }
      .docs-code__copy {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 1;
      }
      .docs-code pre {
        margin: 0;
        padding: 2.25rem 1rem 1rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        background: var(--docs-code-bg);
        border: 1px solid var(--ui-color-border);
        border-radius: 0.5rem;
      }
      .docs-code code {
        font-family: var(--docs-mono);
        font-size: 0.8125rem;
        line-height: 1.6;
        white-space: pre;
        color: var(--ui-color-text);
      }
      @media (max-width: 480px) {
        .docs-code pre {
          padding: 2rem 0.75rem 0.75rem;
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
  readonly language = input<"html" | "ts" | "bash" | "css">("html");
  protected readonly copied = signal(false);
  protected readonly html = computed(() =>
    highlight(this.code(), this.language()),
  );
  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
