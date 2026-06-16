import { Component, signal } from "@angular/core";
import { render, screen, within } from "@testing-library/angular";
import { axe } from "jest-axe";
import { DataTableComponent, DataTableColumn } from "./data-table.component";

interface Person {
  id: number;
  name: string;
  role: string;
}

const COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "role", header: "Role", field: "role", align: "end" },
];

const ROWS: Person[] = [
  { id: 1, name: "Ada", role: "Lead" },
  { id: 2, name: "Grace", role: "Eng" },
];

@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
    caption="People"
    [columns]="columns"
    [rows]="rows()"
    [loading]="loading()"
    [rowKey]="'id'"
  />`,
})
class HostComponent {
  readonly columns = COLUMNS;
  readonly rows = signal<Person[]>(ROWS);
  readonly loading = signal(false);
}

describe("DataTableComponent — foundation", () => {
  it("exposes a labelled grid with row/column counts", async () => {
    await render(HostComponent);
    const grid = screen.getByRole("grid", { name: "People" });
    expect(grid).toHaveAttribute("aria-colcount", "2");
    expect(grid).toHaveAttribute("aria-rowcount", "3"); // 2 rows + header
  });

  it("renders column headers", async () => {
    await render(HostComponent);
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent?.trim())).toEqual(["Name", "Role"]);
  });

  it("renders a gridcell per field value", async () => {
    await render(HostComponent);
    const rows = screen.getAllByRole("row");
    // row[0] is the header row; data rows follow.
    expect(within(rows[1]).getByText("Ada")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Lead")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(4);
  });

  it("sets aria-rowindex (header=1, data rows offset by 2)", async () => {
    await render(HostComponent);
    const rows = screen.getAllByRole("row");
    expect(rows[0]).toHaveAttribute("aria-rowindex", "1");
    expect(rows[1]).toHaveAttribute("aria-rowindex", "2");
    expect(rows[2]).toHaveAttribute("aria-rowindex", "3");
  });

  it("supports a computed value accessor", async () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent],
      template: `<ui-data-table caption="t" [columns]="cols" [rows]="rows" />`,
    })
    class ValueAccessorHostComponent {
      readonly cols: DataTableColumn<Person>[] = [
        { id: "u", header: "User", value: (r) => r.name.toUpperCase() },
      ];
      readonly rows = ROWS;
    }
    await render(ValueAccessorHostComponent);
    expect(screen.getByText("ADA")).toBeInTheDocument();
  });

  it("shows the empty state when there are no rows", async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.rows.set([]);
    fixture.detectChanges();
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1); // header only
  });

  it("shows a loading status and marks the grid busy", async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(screen.getByRole("grid")).toHaveAttribute("aria-busy", "true");
  });

  it("has no axe violations", async () => {
    const { container } = await render(HostComponent);
    expect(await axe(container)).toHaveNoViolations();
  });
});
