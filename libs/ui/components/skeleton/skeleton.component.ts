import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type SkeletonVariant = "text" | "circle" | "rect";

@Component({
  selector: "onyx-skeleton",
  standalone: true,
  templateUrl: "./skeleton.component.html",
  styleUrl: "./skeleton.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "aria-hidden": "true",
    "[class.ui-skeleton--text]": "variant() === 'text'",
    "[class.ui-skeleton--circle]": "variant() === 'circle'",
    "[class.ui-skeleton--rect]": "variant() === 'rect'",
  },
})
export class OnyxSkeletonComponent {
  /** Shape preset: text (line blocks), circle (avatar), rect (card/image). */
  readonly variant = input<SkeletonVariant>("text");

  /**
   * Number of shimmer lines to render. Only meaningful for the `text` variant;
   * circle and rect always render a single block.
   */
  readonly lines = input(1);

  /** Array used by `@for` in the template to iterate over lines. */
  protected readonly lineRange = computed(() =>
    Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i),
  );
}
