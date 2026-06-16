# DataTable (`ui-data-table`) — Design Spec

Date: 2026-06-16
Status: Approved (design decisions chosen by user during brainstorming)
Component: `libs/ui/components/data-table`

## 1. Purpose & scope

A generic, accessible, token-driven data grid for the onyx-ng library. Built as a
mini-project: each capability is implemented, reviewed (spec + quality), verified
against the full DoD, and committed before the next begins.

**In scope (v1):** configurable columns; column sort (single + multi-column);
pagination; row selection (single / multiple / select-all); virtual scroll (CDK);
sticky header; empty & loading states; grid keyboard navigation + ARIA.

**Out of scope (v1):** global/column filtering, column drag reorder/resize, row
expansion, inline editing. (Candidates for v2.)

## 2. Structural approach

Render with `<div>`s carrying explicit ARIA grid roles — **not** a native
`<table>`. Rationale: CDK `cdk-virtual-scroll-viewport`, a sticky header, and 2D
cell keyboard navigation compose cleanly with a CSS-grid/flex div layout, whereas
a native table's row model is broken by the virtual viewport. Accessibility is
preserved explicitly:

- container: `role="grid"`, `aria-label` (from `caption`), `aria-rowcount`,
  `aria-colcount`, `aria-busy` (loading).
- header: `role="row"` with `role="columnheader"` cells; sortable headers are
  `<button>`s with `aria-sort`.
- body rows: `role="row"`, `aria-selected` when selectable; cells `role="gridcell"`.

Alternative rejected: native `<table>` — simpler semantics, incompatible with CDK
virtual scroll.

## 3. Public API (`ui-data-table`, generic `<T>`)

### Inputs (signal inputs)

- `columns = input.required<DataTableColumn<T>[]>()`
- `rows = input<T[]>([])`
- `rowKey = input<keyof T | ((row: T) => RowKey)>()` — normalized internally to a
  function; default tries `row.id`.
- `mode = input<'paginated' | 'virtual'>('paginated')` — mutually exclusive modes.
- `pageSize = input(10)`, `pageSizeOptions = input<number[]>([10, 25, 50])` (paginated).
- `rowHeight = input(44)` — CDK `itemSize` (virtual). `viewportHeight = input('400px')`.
- `selectable = input<'none' | 'single' | 'multiple'>('none')`.
- `multiSort = input(false)` — enable additive multi-column sort via Shift+click.
- `loading = input(false)`, `emptyText = input('No data')`, `caption = input('')`.

### Two-way models

- `selected = model<Set<RowKey>>(new Set())` — selected row keys.
- `sort = model<SortState[]>([])` — `{ columnId, direction: 'asc' | 'desc' }[]`;
  single-sort keeps length ≤ 1.
- `pageIndex = model(0)`.

(Two-way models cover change notification; no separate `*Change` outputs in v1.)

### Types

```ts
type RowKey = string | number;
interface SortState {
  columnId: string;
  direction: "asc" | "desc";
}
interface DataTableColumn<T> {
  id: string; // unique; used for sort state + header id
  header: string;
  field?: keyof T; // text value accessor
  value?: (row: T) => unknown; // computed text value (alt to field)
  cell?: TemplateRef<{ $implicit: T; value: unknown }>; // custom cell
  align?: "start" | "center" | "end";
  width?: string; // CSS length, applied via inline style binding
  sortable?: boolean; // default false
  sortAccessor?: (row: T) => string | number; // sort key; defaults to field value
}
```

`width` is consumer-provided and applied as an inline `[style]` binding in the
template (not in component SCSS), so the Stylelint token rule does not apply to it.

## 4. Data pipeline (client-side, computed signals)

`rows → sorted → paged → visible`

- `sorted = computed`: stable multi-key comparator from `sort()`; each level uses
  the column's `sortAccessor` (or `field`/`value`). Null/undefined sort last.
- `paged = computed`: paginated mode slices `sorted` by `pageIndex`/`pageSize`;
  virtual mode passes `sorted` through unchanged.
- `visible = paged` — what is rendered.
- Selection: `selected` holds keys. **select-all operates over the entire sorted
  dataset** (not just the current page); header checkbox shows `indeterminate`
  when some-but-not-all are selected. `single` mode keeps the set at size ≤ 1.

## 5. Capabilities = commit order

Each capability: implement → review subagent (spec compliance + quality) → address
findings → run all 5 DoD checks → commit `feat(data-table): …`. No red advances.

1. **Foundation** — render; columns (`field`/`value`/`cell` templates, `align`,
   `width`); empty & loading states; ARIA grid roles; base component tokens;
   `index.ts` + barrel export + docs registry + `.docs.ts`/`.demos.ts`.
2. **Sorting** — single + multi (Shift+click), sortable headers as `<button>`,
   `aria-sort`, cycle asc → desc → none.
3. **Pagination** — footer (prev/next, page numbers, page-size select),
   `pageIndex` model, range readout.
4. **Selection** — single/multiple/select-all using `ui-checkbox`, `selected`
   model, `aria-selected` on rows, header indeterminate checkbox.
5. **Virtual scroll** — `cdk-virtual-scroll-viewport` + `*cdkVirtualFor`,
   `rowHeight`/`viewportHeight`; mode switch (excludes pagination footer).
6. **Grid keyboard navigation** — roving tabindex (one active cell), arrows (2D),
   Home/End (row), Ctrl+Home/End (grid), PageUp/PageDown (by page), Enter/Space to
   activate the cell's control (sort button, row checkbox).

## 6. Styling & tokens

All SCSS references only `--ui-data-table-*` component tokens (added to
`component.json`) and semantic tokens; zero hardcoded values. Dark mode works via
semantic re-mapping (no component changes). Focus visible via `--ui-focus-ring`.
Token groups: surface/border, header bg/text, row hover/selected bg, cell padding,
font size, sort-indicator color, footer controls, empty/loading text.

## 7. Testing strategy & declared limits

- jest-axe: 0 violations for grid (closed states, sorted, selected). `caption`
  supplies the grid's accessible name in tests.
- Interaction tests per capability: cell rendering (field/value/template),
  empty/loading; sort + multi-sort ordering and `aria-sort`; page slicing +
  pageIndex; selection Set updates, single-mode cap, select-all + indeterminate;
  keyboard movement and activation (paginated mode).

**Declared limits (anti-trampa):**

1. **jsdom has no layout** → CDK virtual scroll does not truly virtualize under
   jest. Virtual-scroll tests assert the data pipeline, the presence of the
   `cdk-virtual-scroll-viewport` / `cdkVirtualFor` wiring, and axe — not the count
   of rendered rows.
2. **2D keyboard + virtualization** → focus only exists on rendered cells. Full 2D
   roving is guaranteed in paginated mode (all page rows in DOM). In virtual mode,
   vertical navigation uses `viewport.scrollToIndex(...)` to bring the target row
   into view, then focuses it (best-effort); horizontal nav stays within the
   rendered row.

## 8. Execution model

Main agent implements each capability (tight coupling + full session context),
then dispatches a review subagent per capability checking (a) spec compliance and
(b) code quality / rule adherence (OnPush, signals, token-only SCSS, CDK usage).
Findings are addressed before the DoD checks and commit.
