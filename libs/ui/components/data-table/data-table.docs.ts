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
  ],
  demos: dataTableDemos,
};
