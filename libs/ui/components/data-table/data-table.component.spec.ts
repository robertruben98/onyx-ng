import { Component, signal } from "@angular/core";
import { render, screen, within } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
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

interface Score {
  id: number;
  name: string;
  points: number;
}

const SCORE_COLUMNS: DataTableColumn<Score>[] = [
  { id: "name", header: "Name", field: "name", sortable: true },
  { id: "points", header: "Points", field: "points", sortable: true },
];

const SCORES: Score[] = [
  { id: 1, name: "Charlie", points: 30 },
  { id: 2, name: "Alice", points: 10 },
  { id: 3, name: "Bob", points: 20 },
];

@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
    caption="Scores"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    [multiSort]="multi"
  />`,
})
class SortHostComponent {
  readonly columns = SCORE_COLUMNS;
  readonly rows = SCORES;
  multi = false;
}

function names(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.querySelector(".ui-dt__td")?.textContent?.trim() ?? "");
}

describe("DataTableComponent — sorting", () => {
  it("renders sortable headers as buttons with aria-sort=none", async () => {
    await render(SortHostComponent);
    const header = screen.getByRole("columnheader", { name: /Name/ });
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(within(header).getByRole("button")).toBeInTheDocument();
  });

  it("cycles ascending → descending → none on click", async () => {
    const user = userEvent.setup();
    await render(SortHostComponent);
    const nameBtn = within(
      screen.getByRole("columnheader", { name: /Name/ }),
    ).getByRole("button");

    await user.click(nameBtn);
    expect(names()).toEqual(["Alice", "Bob", "Charlie"]);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );

    await user.click(nameBtn);
    expect(names()).toEqual(["Charlie", "Bob", "Alice"]);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );

    await user.click(nameBtn);
    expect(names()).toEqual(["Charlie", "Alice", "Bob"]); // back to source order
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("sorts numerically by a numeric field", async () => {
    const user = userEvent.setup();
    await render(SortHostComponent);
    const pointsBtn = within(
      screen.getByRole("columnheader", { name: /Points/ }),
    ).getByRole("button");
    await user.click(pointsBtn);
    expect(names()).toEqual(["Alice", "Bob", "Charlie"]); // 10,20,30
  });

  it("replaces sort when not in multi mode", async () => {
    const user = userEvent.setup();
    await render(SortHostComponent);
    await user.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    await user.click(
      within(screen.getByRole("columnheader", { name: /Points/ })).getByRole(
        "button",
      ),
    );
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "none",
    );
    expect(
      screen.getByRole("columnheader", { name: /Points/ }),
    ).toHaveAttribute("aria-sort", "ascending");
  });

  it("has no axe violations when sorted", async () => {
    const user = userEvent.setup();
    const { container } = await render(SortHostComponent);
    await user.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

interface Item {
  id: number;
  label: string;
}
const ITEMS: Item[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  label: `Item ${i + 1}`,
}));

@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
    caption="Items"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows()"
    [pageSize]="5"
    [pageSizeOptions]="[5, 10]"
    [loading]="loading()"
  />`,
})
class PageHostComponent {
  readonly columns: DataTableColumn<Item>[] = [
    { id: "label", header: "Label", field: "label" },
  ];
  readonly rows = signal<Item[]>(ITEMS);
  readonly loading = signal(false);
}

function dataRowCount(): number {
  return screen.getAllByRole("row").length - 1; // minus header
}

describe("DataTableComponent — pagination", () => {
  it("shows only the first page and a range readout", async () => {
    await render(PageHostComponent);
    expect(dataRowCount()).toBe(5);
    expect(screen.getByText(/1–5 of 12/)).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("navigates with next / previous", async () => {
    const user = userEvent.setup();
    await render(PageHostComponent);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/6–10 of 12/)).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByText(/1–5 of 12/)).toBeInTheDocument();
  });

  it("disables prev on the first page and next on the last", async () => {
    const user = userEvent.setup();
    await render(PageHostComponent);
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(dataRowCount()).toBe(2); // 12 - 10
  });

  it("changes page size and resets to the first page", async () => {
    const user = userEvent.setup();
    await render(PageHostComponent);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.selectOptions(screen.getByRole("combobox"), "10");
    expect(dataRowCount()).toBe(10);
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("hides the footer while loading", async () => {
    const { fixture } = await render(PageHostComponent);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();
  });

  it("has no axe violations with pagination", async () => {
    const { container } = await render(PageHostComponent);
    expect(await axe(container)).toHaveNoViolations();
  });
});
