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

@Component({
  selector: "docs-component-page",
  standalone: true,
  imports: [ApiTableComponent, DemoBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc(); as d) {
      <article>
        <h1>{{ d.title }}</h1>
        <p class="docs-lead">{{ d.description }}</p>
        <h2>Examples</h2>
        @for (demo of d.demos; track demo.title) {
          <docs-demo-block [demo]="demo" />
        }
        <h2>API</h2>
        <docs-api-table [rows]="d.api" />
      </article>
    }
  `,
  styles: [
    `
      article > h1 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
        font-weight: 700;
      }
      .docs-lead {
        margin: 0 0 2rem;
        max-width: 60ch;
        font-size: 1.05rem;
        color: var(--ui-color-text-muted);
      }
      article > h2 {
        margin: 2.5rem 0 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--ui-color-border);
        font-size: 1.35rem;
        font-weight: 700;
      }
      @media (max-width: 480px) {
        article > h1 {
          font-size: 1.5rem;
        }
        .docs-lead {
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
        }
        article > h2 {
          font-size: 1.1rem;
          margin-top: 1.75rem;
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
}
