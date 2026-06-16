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

const basicCode = `<ui-data-table
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
  template: `<ui-data-table
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

const emptyCode = `<ui-data-table caption="Team" [columns]="columns" [rows]="[]" emptyText="No members yet" />`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
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

const loadingCode = `<ui-data-table caption="Team" [columns]="columns" [rows]="[]" [loading]="true" />`;
@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
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

export const dataTableDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: DataTableBasicDemoComponent },
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
