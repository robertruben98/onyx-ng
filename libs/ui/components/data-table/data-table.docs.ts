import { ComponentDoc } from "@onyx/ui/docs-model";
import { dataTableDemos } from "./data-table.demos";

export const dataTableDoc: ComponentDoc = {
  id: "data-table",
  title: "Data Table",
  description:
    "Accessible role=grid data table. v1: configurable columns (field/value/template, alignment, width) with empty and loading states. Sorting, pagination, selection, virtual scroll and keyboard navigation build on top.",
  api: [
    {
      name: "columns",
      type: "DataTableColumn<T>[]",
      default: "(required)",
      description:
        "Column definitions ({ id, header, field?, value?, cell?, align?, width? }).",
    },
    {
      name: "rows",
      type: "T[]",
      default: "[]",
      description: "Row data (processed client-side).",
    },
    {
      name: "rowKey",
      type: "keyof T | (row) => string | number",
      default: "row.id",
      description: "Stable row identity for tracking and selection.",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description: "Shows a loading status and marks the grid busy.",
    },
    {
      name: "emptyText",
      type: "string",
      default: "'No data'",
      description: "Text shown when there are no rows.",
    },
    {
      name: "caption",
      type: "string",
      default: "''",
      description: "Accessible name for the grid.",
    },
    {
      name: "multiSort",
      type: "boolean",
      default: "false",
      description: "Allow additive multi-column sort via Shift+click.",
    },
    {
      name: "sort",
      type: "SortState[]",
      default: "[]",
      description: "Active sort levels. Two-way bindable via [(sort)].",
    },
    {
      name: "column.sortable",
      type: "boolean",
      default: "false",
      description: "Makes a column's header a sort toggle (asc → desc → none).",
    },
    {
      name: "mode",
      type: "'paginated' | 'virtual'",
      default: "'paginated'",
      description: "Layout mode (pagination footer vs virtual scroll).",
    },
    {
      name: "pageSize",
      type: "number",
      default: "10",
      description: "Rows per page. Two-way bindable.",
    },
    {
      name: "pageSizeOptions",
      type: "number[]",
      default: "[10, 25, 50]",
      description: "Choices for the rows-per-page control.",
    },
    {
      name: "pageIndex",
      type: "number",
      default: "0",
      description: "Current page (0-based). Two-way bindable.",
    },
    {
      name: "selectable",
      type: "'none' | 'single' | 'multiple'",
      default: "'none'",
      description: "Row selection mode.",
    },
    {
      name: "selected",
      type: "Set<RowKey>",
      default: "new Set()",
      description: "Selected row keys. Two-way bindable via [(selected)].",
    },
    {
      name: "rowHeight",
      type: "number",
      default: "44",
      description: "Row height in px (virtual mode item size).",
    },
    {
      name: "viewportHeight",
      type: "string",
      default: "'400px'",
      description: "Virtual scroll viewport height.",
    },
    {
      name: "maxHeight",
      type: "string",
      default: "''",
      description:
        "Constrains paginated height; body scrolls with a sticky header.",
    },
  ],
  demos: dataTableDemos,
};
