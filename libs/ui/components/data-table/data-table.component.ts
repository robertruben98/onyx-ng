import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from "@angular/cdk/scrolling";
import { CheckboxComponent } from "../checkbox";

export type RowKey = string | number;
export type CellAlign = "start" | "center" | "end";
export type SortDirection = "asc" | "desc";
export type DataTableMode = "paginated" | "virtual";
export type SelectionMode = "none" | "single" | "multiple";

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
  selector: "onyx-data-table",
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, ScrollingModule, CheckboxComponent],
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
  /** Layout mode: paginated footer vs virtual scroll. */
  readonly mode = input<DataTableMode>("paginated");
  /** Options for the rows-per-page control. */
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);
  /** Row selection mode. */
  readonly selectable = input<SelectionMode>("none");
  /** Row height in px (CDK virtual scroll item size). */
  readonly rowHeight = input(44);
  /** Virtual scroll viewport height (CSS length). */
  readonly viewportHeight = input("400px");
  /** Max height for paginated mode; enables internal scroll with sticky header. */
  readonly maxHeight = input("");

  /** Active sort levels. Two-way bindable. */
  readonly sort = model<SortState[]>([]);
  /** Current page (0-based). Two-way bindable. */
  readonly pageIndex = model(0);
  /** Rows per page. Two-way bindable. */
  readonly pageSize = model(10);
  /** Selected row keys. Two-way bindable. */
  readonly selected = model<Set<RowKey>>(new Set());

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

  /** Total rows after sorting (pre-pagination). */
  protected readonly total = computed(() => this.sorted().length);
  /** Number of pages (≥ 1). */
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  /** Page index clamped to the valid range. */
  protected readonly currentPage = computed(() =>
    Math.min(Math.max(0, this.pageIndex()), this.pageCount() - 1),
  );

  /** Rows currently rendered (sorted, then paged in paginated mode). */
  protected readonly visibleRows = computed(() => {
    if (this.mode() === "virtual") return this.sorted();
    const start = this.currentPage() * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });

  /** Whether the pagination footer is shown. */
  protected readonly showFooter = computed(
    () => this.mode() === "paginated" && !this.loading() && this.total() > 0,
  );
  /** 1-based index of the first row on the current page. */
  protected readonly rangeStart = computed(() =>
    this.total() ? this.currentPage() * this.pageSize() + 1 : 0,
  );
  /** 1-based index of the last row on the current page. */
  protected readonly rangeEnd = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.total()),
  );

  /** CSS grid track template derived from column widths (+ selection column). */
  protected readonly templateColumns = computed(() => {
    const tracks = this.columns().map((c) => c.width ?? "minmax(0, 1fr)");
    if (this.selectable() !== "none") {
      tracks.unshift("var(--ui-data-table-select-col-width)");
    }
    return tracks.join(" ");
  });

  /** Column count incl. the selection column, for aria-colcount. */
  protected readonly colCount = computed(
    () => this.columns().length + (this.selectable() !== "none" ? 1 : 0),
  );

  /** Total grid rows incl. header, for aria-rowcount. */
  protected readonly ariaRowCount = computed(() => this.rows().length + 1);

  /** Keys of every row in the current (sorted) dataset. */
  private readonly allKeys = computed(() =>
    this.sorted().map((r) => this.rowKeyOf(r)),
  );
  /** True when every dataset row is selected. */
  protected readonly allSelected = computed(() => {
    const keys = this.allKeys();
    const sel = this.selected();
    return keys.length > 0 && keys.every((k) => sel.has(k));
  });
  /** True when some-but-not-all dataset rows are selected. */
  protected readonly someSelected = computed(() => {
    const keys = this.allKeys();
    const sel = this.selected();
    const hit = keys.filter((k) => sel.has(k)).length;
    return hit > 0 && hit < keys.length;
  });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  /** Active grid cell for roving-tabindex keyboard nav (row 0 = header). */
  protected readonly activeCell = signal<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });

  constructor() {
    // Reset roving focus to the first header cell when the row set or layout
    // changes (sort, page, mode, selection column) so indices never go stale.
    effect(() => {
      this.sorted();
      this.currentPage();
      this.mode();
      this.selectable();
      this.activeCell.set({ row: 0, col: 0 });
    });
  }

  /** Whether (row,col) is the active cell. */
  protected isActiveCell(row: number, col: number): boolean {
    const a = this.activeCell();
    return a.row === row && a.col === col;
  }

  /** Whether a row is selected. */
  protected isSelected(row: T): boolean {
    return this.selected().has(this.rowKeyOf(row));
  }

  /** Grid 2D keyboard navigation (arrows / Home / End / PageUp·Down) + activate. */
  protected onGridKeydown(event: KeyboardEvent): void {
    const a = this.activeCell();
    const rowMax = this.visibleRows().length; // header = 0, data rows = 1..N
    const colMax = this.colCount() - 1;
    let { row, col } = a;
    switch (event.key) {
      case "ArrowRight":
        col = Math.min(colMax, col + 1);
        break;
      case "ArrowLeft":
        col = Math.max(0, col - 1);
        break;
      case "ArrowDown":
        row = Math.min(rowMax, row + 1);
        break;
      case "ArrowUp":
        row = Math.max(0, row - 1);
        break;
      case "Home":
        col = 0;
        if (event.ctrlKey) row = 0;
        break;
      case "End":
        col = colMax;
        if (event.ctrlKey) row = rowMax;
        break;
      case "PageDown":
        row = Math.min(rowMax, row + this.pageJump());
        break;
      case "PageUp":
        row = Math.max(0, row - this.pageJump());
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.activateCell();
        return;
      default:
        return;
    }
    event.preventDefault();
    this.activeCell.set({ row, col });
    this.focusCell(row, col);
  }

  private pageJump(): number {
    return this.mode() === "paginated" ? this.pageSize() : 10;
  }

  private focusCell(row: number, col: number): void {
    const sel = `[data-row="${row}"][data-col="${col}"]`;
    const found = () => this.el.nativeElement.querySelector<HTMLElement>(sel);
    const cell = found();
    if (cell) {
      cell.focus();
      return;
    }
    // Virtual mode: bring the row into view, then focus (best-effort).
    const vp = this.viewport();
    if (vp && row > 0) {
      vp.scrollToIndex(row - 1);
      queueMicrotask(() => found()?.focus());
    }
  }

  private activateCell(): void {
    const { row, col } = this.activeCell();
    const cell = this.el.nativeElement.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    cell
      ?.querySelector<HTMLElement>('button, input, a, [role="checkbox"]')
      ?.click();
    // Keep focus on the cell (roving tabindex) rather than the inner control.
    cell?.focus();
  }

  /** Toggle a single row's selection (respects single/multiple). */
  protected toggleRow(row: T, checked: boolean): void {
    const key = this.rowKeyOf(row);
    if (this.selectable() === "single") {
      this.selected.set(checked ? new Set([key]) : new Set());
      return;
    }
    const next = new Set(this.selected());
    if (checked) next.add(key);
    else next.delete(key);
    this.selected.set(next);
  }

  /** Select or clear all dataset rows. */
  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? new Set(this.allKeys()) : new Set());
  }

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

  /** Go to the previous page. */
  protected prevPage(): void {
    this.pageIndex.set(Math.max(0, this.currentPage() - 1));
  }

  /** Go to the next page. */
  protected nextPage(): void {
    this.pageIndex.set(Math.min(this.pageCount() - 1, this.currentPage() + 1));
  }

  /** Change the page size and return to the first page. */
  protected changePageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.pageIndex.set(0);
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
