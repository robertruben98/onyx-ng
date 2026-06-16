import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

export type RowKey = string | number;
export type CellAlign = "start" | "center" | "end";

/** Column definition for {@link DataTableComponent}. */
export interface DataTableColumn<T> {
  /** Unique id (sort state, header id). */
  id: string;
  /** Header label. */
  header: string;
  /** Field accessor for the cell's text value. */
  field?: keyof T;
  /** Computed value accessor (alternative to `field`). */
  value?: (row: T) => unknown;
  /** Custom cell template; context: `$implicit` = row, `value` = cell value. */
  cell?: TemplateRef<{ $implicit: T; value: unknown }>;
  /** Horizontal alignment. */
  align?: CellAlign;
  /** CSS track size for this column (e.g. '8rem', 'minmax(0,2fr)'). */
  width?: string;
}

/**
 * Accessible, token-driven data grid (role=grid). v1 capability 1: column
 * configuration, field/value/template cells, empty & loading states. Sorting,
 * pagination, selection, virtual scroll and keyboard nav layer on top.
 */
@Component({
  selector: "ui-data-table",
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: "./data-table.component.html",
  styleUrl: "./data-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class.ui-data-table]": "true" },
})
export class DataTableComponent<T> {
  /** Column definitions. */
  readonly columns = input.required<DataTableColumn<T>[]>();
  /** Row data (all rows; processed client-side). */
  readonly rows = input<T[]>([]);
  /** Row identity: a field name or a function. Defaults to `row.id`. */
  readonly rowKey = input<keyof T | ((row: T) => RowKey)>();
  /** Loading state. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Text shown when there are no rows. */
  readonly emptyText = input("No data");
  /** Accessible name for the grid. */
  readonly caption = input("");

  /** Rows currently rendered (later narrowed by sort/pagination). */
  protected readonly visibleRows = computed(() => this.rows());

  /** CSS grid track template derived from column widths. */
  protected readonly templateColumns = computed(() =>
    this.columns()
      .map((c) => c.width ?? "minmax(0, 1fr)")
      .join(" "),
  );

  /** Total grid rows incl. header, for aria-rowcount. */
  protected readonly ariaRowCount = computed(() => this.rows().length + 1);

  /** Resolve a row's stable key. */
  protected rowKeyOf(row: T): RowKey {
    const key = this.rowKey();
    if (typeof key === "function") return key(row);
    if (key != null) return row[key] as unknown as RowKey;
    return (row as { id?: RowKey }).id ?? JSON.stringify(row);
  }

  /** Resolve a cell's display value. */
  protected cellValue(col: DataTableColumn<T>, row: T): unknown {
    if (col.value) return col.value(row);
    if (col.field != null) return row[col.field];
    return "";
  }
}
