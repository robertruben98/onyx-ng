import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
  model,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

export type RowKey = string | number;
export type CellAlign = "start" | "center" | "end";
export type SortDirection = "asc" | "desc";

/** One level of the (multi-)column sort. */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

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
  /** Whether the column can be sorted. */
  sortable?: boolean;
  /** Sort key accessor; defaults to the `value`/`field` value. */
  sortAccessor?: (row: T) => string | number;
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
  /** Allow additive multi-column sort via Shift+click. */
  readonly multiSort = input(false, { transform: booleanAttribute });

  /** Active sort levels. Two-way bindable. */
  readonly sort = model<SortState[]>([]);

  /** Rows after applying the active sort. */
  protected readonly sorted = computed(() => {
    const sort = this.sort();
    const rows = this.rows();
    if (!sort.length) return rows;
    const cols = new Map(this.columns().map((c) => [c.id, c]));
    return [...rows].sort((a, b) => {
      for (const level of sort) {
        const col = cols.get(level.columnId);
        if (!col) continue;
        const cmp = this.compare(
          this.sortValue(col, a),
          this.sortValue(col, b),
        );
        if (cmp !== 0) return level.direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  });

  /** Rows currently rendered (later narrowed by pagination/virtual). */
  protected readonly visibleRows = computed(() => this.sorted());

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

  /** Current sort direction for a column, or null if unsorted. */
  protected sortDirectionOf(col: DataTableColumn<T>): SortDirection | null {
    return this.sort().find((s) => s.columnId === col.id)?.direction ?? null;
  }

  /** aria-sort value for a header cell. */
  protected ariaSort(
    col: DataTableColumn<T>,
  ): "ascending" | "descending" | "none" | null {
    if (!col.sortable) return null;
    const dir = this.sortDirectionOf(col);
    return dir ? (dir === "asc" ? "ascending" : "descending") : "none";
  }

  /** Cycle a column's sort: none → asc → desc → none. Shift adds a level. */
  protected toggleSort(col: DataTableColumn<T>, event: MouseEvent): void {
    if (!col.sortable) return;
    const additive = this.multiSort() && event.shiftKey;
    const current = this.sort();
    const dir = this.sortDirectionOf(col);
    const next: SortState | null =
      dir === null
        ? { columnId: col.id, direction: "asc" }
        : dir === "asc"
          ? { columnId: col.id, direction: "desc" }
          : null;
    if (additive) {
      const without = current.filter((s) => s.columnId !== col.id);
      this.sort.set(next ? [...without, next] : without);
    } else {
      this.sort.set(next ? [next] : []);
    }
  }

  private sortValue(col: DataTableColumn<T>, row: T): unknown {
    if (col.sortAccessor) return col.sortAccessor(row);
    return this.cellValue(col, row);
  }

  private compare(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  }
}
