import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type GridSpan = GridColumns | "full";

function gridColumn(span: GridSpan): string {
  return span === "full" ? "1 / -1" : `span ${span}`;
}

/**
 * Applies responsive column spans to a direct child of `onyx-grid`.
 * Keeping this as a directive lets consumers retain the most appropriate
 * semantic element for each grid item.
 */
@Directive({
  selector: "[onyxGridItem]",
  standalone: true,
  host: {
    "[style.--onyx-grid-item-span]": "resolvedSpan()",
    "[style.--onyx-grid-item-span-sm]": "resolvedSpanSm()",
    "[style.--onyx-grid-item-span-md]": "resolvedSpanMd()",
    "[style.--onyx-grid-item-span-lg]": "resolvedSpanLg()",
  },
})
export class OnyxGridItemDirective {
  /** Number of columns occupied at the base breakpoint, or the full row. */
  readonly span = input<GridSpan>(1);
  /** Optional span override when the grid is at least the small breakpoint. */
  readonly spanSm = input<GridSpan>();
  /** Optional span override when the grid is at least the medium breakpoint. */
  readonly spanMd = input<GridSpan>();
  /** Optional span override when the grid is at least the large breakpoint. */
  readonly spanLg = input<GridSpan>();

  protected readonly resolvedSpan = computed(() => gridColumn(this.span()));
  protected readonly resolvedSpanSm = computed(() => {
    const span = this.spanSm();
    return span === undefined ? null : gridColumn(span);
  });
  protected readonly resolvedSpanMd = computed(() => {
    const span = this.spanMd();
    return span === undefined ? null : gridColumn(span);
  });
  protected readonly resolvedSpanLg = computed(() => {
    const span = this.spanLg();
    return span === undefined ? null : gridColumn(span);
  });
}

/**
 * Token-driven CSS Grid layout primitive with container-responsive columns.
 * It deliberately adds no ARIA role: consumers keep the semantics of their
 * projected content and may add a role only when their content model needs it.
 */
@Component({
  selector: "onyx-grid",
  standalone: true,
  templateUrl: "./grid.component.html",
  styleUrl: "./grid.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.onyx-grid-host]": "true",
    "[class.onyx-grid-host--dense]": "dense()",
    "[class.onyx-grid-host--gap-none]": "gap() === 'none'",
    "[class.onyx-grid-host--gap-xs]": "gap() === 'xs'",
    "[class.onyx-grid-host--gap-sm]": "gap() === 'sm'",
    "[class.onyx-grid-host--gap-md]": "gap() === 'md'",
    "[class.onyx-grid-host--gap-lg]": "gap() === 'lg'",
    "[class.onyx-grid-host--gap-xl]": "gap() === 'xl'",
    "[style.--onyx-grid-columns]": "columns()",
    "[style.--onyx-grid-columns-sm]": "columnsSm()",
    "[style.--onyx-grid-columns-md]": "columnsMd()",
    "[style.--onyx-grid-columns-lg]": "columnsLg()",
  },
})
export class OnyxGridComponent {
  /** Column count at the base breakpoint. */
  readonly columns = input<GridColumns>(1);
  /** Optional column override when the grid is at least the small breakpoint. */
  readonly columnsSm = input<GridColumns>();
  /** Optional column override when the grid is at least the medium breakpoint. */
  readonly columnsMd = input<GridColumns>();
  /** Optional column override when the grid is at least the large breakpoint. */
  readonly columnsLg = input<GridColumns>();
  /** Token-backed spacing between rows and columns. */
  readonly gap = input<GridGap>("md");
  /**
   * Allows later items to fill holes created by spanning items. Avoid it when
   * visual reordering would make the DOM reading order difficult to follow.
   */
  readonly dense = input(false, { transform: booleanAttribute });
}
