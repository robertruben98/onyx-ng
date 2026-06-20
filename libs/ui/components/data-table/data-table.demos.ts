import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { DataTableComponent, DataTableColumn } from "./data-table.component";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROWS: Person[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@onyx.dev", role: "Lead" },
  { id: 2, name: "Grace Hopper", email: "grace@onyx.dev", role: "Engineer" },
  { id: 3, name: "Alan Turing", email: "alan@onyx.dev", role: "Engineer" },
];

const basicCode = `<onyx-data-table
  caption="Team members"
  [rowKey]="'id'"
  [columns]="columns"
  [rows]="rows"
  [multiSort]="true"
/>

// columns (Shift+click headers for multi-column sort)
[
  { id: 'name',  header: 'Name',  field: 'name',  sortable: true },
  { id: 'email', header: 'Email', field: 'email', sortable: true },
  { id: 'role',  header: 'Role',  field: 'role',  sortable: true, align: 'end' },
]`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<onyx-data-table
    caption="Team members"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    [multiSort]="true"
  />`,
})
class DataTableBasicDemoComponent {
  protected readonly rows = ROWS;
  protected readonly columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name", sortable: true },
    { id: "email", header: "Email", field: "email", sortable: true },
    { id: "role", header: "Role", field: "role", sortable: true, align: "end" },
  ];
}

const emptyCode = `<onyx-data-table caption="Team" [columns]="columns" [rows]="[]" emptyText="No members yet" />`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<onyx-data-table
    caption="Team"
    [columns]="columns"
    [rows]="[]"
    emptyText="No members yet"
  />`,
})
class DataTableEmptyDemoComponent {
  protected readonly columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name" },
    { id: "role", header: "Role", field: "role" },
  ];
}

const loadingCode = `<onyx-data-table caption="Team" [columns]="columns" [rows]="[]" [loading]="true" />`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<onyx-data-table
    caption="Team"
    [columns]="columns"
    [rows]="[]"
    [loading]="true"
  />`,
})
class DataTableLoadingDemoComponent {
  protected readonly columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name" },
    { id: "role", header: "Role", field: "role" },
  ];
}

const paginatedCode = `<onyx-data-table
  caption="Catalogue"
  [rowKey]="'id'"
  [columns]="columns"
  [rows]="rows"
  [pageSize]="6"
  [pageSizeOptions]="[6, 12, 24]"
/>`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<onyx-data-table
    caption="Catalogue"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    [pageSize]="6"
    [pageSizeOptions]="[6, 12, 24]"
  />`,
})
class DataTablePaginatedDemoComponent {
  protected readonly columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name", sortable: true },
    { id: "email", header: "Email", field: "email" },
    { id: "role", header: "Role", field: "role", sortable: true, align: "end" },
  ];
  protected readonly rows: Person[] = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: `Member ${i + 1}`,
    email: `member${i + 1}@onyx.dev`,
    role: i % 2 ? "Engineer" : "Lead",
  }));
}

const selectionCode = `<onyx-data-table
  caption="Team members"
  [rowKey]="'id'"
  [columns]="columns"
  [rows]="rows"
  selectable="multiple"
  [(selected)]="selected"
/>`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<onyx-data-table
    caption="Team members"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    selectable="multiple"
    [(selected)]="selected"
  />`,
})
class DataTableSelectionDemoComponent {
  protected readonly rows = ROWS;
  protected selected = new Set<number | string>();
  protected readonly columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name" },
    { id: "email", header: "Email", field: "email" },
    { id: "role", header: "Role", field: "role", align: "end" },
  ];
}

const virtualCode = `<onyx-data-table
  caption="10 000 rows"
  [rowKey]="'id'"
  [columns]="columns"
  [rows]="rows"
  mode="virtual"
  [rowHeight]="40"
  viewportHeight="320px"
/>`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<onyx-data-table
    caption="10 000 rows"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    mode="virtual"
    [rowHeight]="40"
    viewportHeight="320px"
  />`,
})
class DataTableVirtualDemoComponent {
  protected readonly columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name", field: "name" },
    { id: "email", header: "Email", field: "email" },
    { id: "role", header: "Role", field: "role", align: "end" },
  ];
  protected readonly rows: Person[] = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `Member ${i + 1}`,
    email: `member${i + 1}@onyx.dev`,
    role: i % 2 ? "Engineer" : "Lead",
  }));
}

export const dataTableDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: DataTableBasicDemoComponent },
  {
    title: "Pagination",
    code: paginatedCode,
    component: DataTablePaginatedDemoComponent,
  },
  {
    title: "Virtual scroll",
    code: virtualCode,
    component: DataTableVirtualDemoComponent,
  },
  {
    title: "Selection",
    code: selectionCode,
    component: DataTableSelectionDemoComponent,
  },
  {
    title: "Empty state",
    code: emptyCode,
    component: DataTableEmptyDemoComponent,
  },
  {
    title: "Loading",
    code: loadingCode,
    component: DataTableLoadingDemoComponent,
  },
];
