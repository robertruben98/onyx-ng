import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { COMPONENT_DOCS } from "../registry";
import { ApiTableComponent } from "../ui/api-table.component";
import { DemoBlockComponent } from "../ui/demo-block.component";
import { CodeBlockComponent } from "../ui/code-block.component";

@Component({
  selector: "docs-component-page",
  standalone: true,
  imports: [ApiTableComponent, DemoBlockComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc(); as d) {
      <article>
        <h1>{{ d.title }}</h1>
        <p class="docs-lead">{{ d.description }}</p>
        <nav class="toc" aria-label="On this page">
          <a class="toc__link" href="#import">Import</a>
          <a class="toc__link" href="#examples">Examples</a>
          <a class="toc__link" href="#api">API</a>
        </nav>
        <h2 id="import">
          Import
          <a class="anchor" href="#import" aria-label="Link to Import section"
            >#</a
          >
        </h2>
        <docs-code-block [code]="importSnippet()" language="ts" />
        <h2 id="examples">
          Examples
          <a
            class="anchor"
            href="#examples"
            aria-label="Link to Examples section"
            >#</a
          >
        </h2>
        @for (demo of d.demos; track demo.title) {
          <docs-demo-block [demo]="demo" />
        }
        <h2 id="api">
          API
          <a class="anchor" href="#api" aria-label="Link to API section">#</a>
        </h2>
        <docs-api-table [rows]="d.api" />
      </article>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        scroll-behavior: smooth;
      }
      article > h1 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
        font-weight: 700;
      }
      .docs-lead {
        margin: 0 0 1.25rem;
        max-width: 60ch;
        font-size: 1.05rem;
        color: var(--ui-color-text-muted);
      }
      .toc {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 0 0 2rem;
      }
      .toc__link {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.7rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 600;
        text-decoration: none;
        color: var(--ui-color-text-muted);
        background: var(--ui-color-surface);
        transition:
          color 0.15s ease,
          border-color 0.15s ease,
          background-color 0.15s ease;
      }
      .toc__link:hover {
        color: var(--ui-color-primary);
        border-color: var(--ui-color-primary);
        background: color-mix(in srgb, var(--ui-color-primary) 8%, transparent);
      }
      .toc__link:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
      article > h2 {
        position: relative;
        margin: 2.5rem 0 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--ui-color-border);
        font-size: 1.35rem;
        font-weight: 700;
        scroll-margin-top: 5rem;
      }
      .anchor {
        margin-left: 0.4rem;
        font-weight: 700;
        text-decoration: none;
        color: var(--ui-color-primary);
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      article > h2:hover .anchor,
      .anchor:focus-visible {
        opacity: 1;
      }
      .anchor:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
        border-radius: 0.25rem;
      }
      @media (max-width: 480px) {
        article > h1 {
          font-size: 1.5rem;
        }
        .docs-lead {
          font-size: 0.9375rem;
          margin-bottom: 1rem;
        }
        article > h2 {
          font-size: 1.1rem;
          margin-top: 1.75rem;
        }
        .toc {
          margin-bottom: 1.5rem;
        }
        /* keep the hover-only anchor from cluttering small screens */
        .anchor {
          display: none;
        }
      }
    `,
  ],
})
export class ComponentPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get("id"))),
    { initialValue: this.route.snapshot.paramMap.get("id") },
  );
  protected readonly doc = computed(() =>
    COMPONENT_DOCS.find((d) => d.id === this.id()),
  );
  protected readonly importSnippet = computed(() => {
    const d = this.doc();
    if (!d) return "";
    const className = "Onyx" + d.title.replace(/\s+/g, "") + "Component";
    return `import { ${className} } from '@robertruben98/onyx-ui';`;
  });
}
