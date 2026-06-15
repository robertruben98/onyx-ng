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
      .docs-lead {
        color: var(--ui-color-text);
        opacity: 0.8;
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
