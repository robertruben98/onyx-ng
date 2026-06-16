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

@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
    caption="Scores"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    [selectable]="mode"
    [(selected)]="chosen"
  />`,
})
class SelectHostComponent {
  readonly columns: DataTableColumn<Score>[] = [
    { id: "name", header: "Name", field: "name" },
  ];
  readonly rows = SCORES; // Charlie, Alice, Bob (ids 1,2,3)
  mode: "none" | "single" | "multiple" = "multiple";
  chosen = new Set<number | string>();
}

describe("DataTableComponent — selection", () => {
  it("renders no checkboxes when selectable is none", async () => {
    await render(SelectHostComponent, {
      componentProperties: { mode: "none" },
    });
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("renders a select-all header checkbox plus one per row in multiple mode", async () => {
    await render(SelectHostComponent);
    expect(screen.getAllByRole("checkbox")).toHaveLength(4); // header + 3 rows
  });

  it("selects a row, updating the model and aria-selected", async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SelectHostComponent);
    const rowCheckboxes = screen.getAllByRole("checkbox").slice(1);
    await user.click(rowCheckboxes[0]); // Charlie (id 1)
    expect(fixture.componentInstance.chosen.has(1)).toBe(true);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveAttribute("aria-selected", "true");
  });

  it("select-all selects every row; clearing deselects", async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SelectHostComponent);
    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    await user.click(headerCheckbox);
    expect(fixture.componentInstance.chosen.size).toBe(3);
    await user.click(headerCheckbox);
    expect(fixture.componentInstance.chosen.size).toBe(0);
  });

  it("header checkbox is indeterminate on partial selection", async () => {
    const user = userEvent.setup();
    await render(SelectHostComponent);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]); // one row
    expect((checkboxes[0] as HTMLInputElement).indeterminate).toBe(true);
  });

  it("single mode keeps at most one selected", async () => {
    const user = userEvent.setup();
    const { fixture } = await render(SelectHostComponent, {
      componentProperties: { mode: "single" },
    });
    const rowCheckboxes = screen.getAllByRole("checkbox"); // no header in single
    await user.click(rowCheckboxes[0]);
    await user.click(rowCheckboxes[1]);
    expect(fixture.componentInstance.chosen.size).toBe(1);
    expect(fixture.componentInstance.chosen.has(2)).toBe(true);
  });

  it("has no axe violations with selection", async () => {
    const { container } = await render(SelectHostComponent);
    expect(await axe(container)).toHaveNoViolations();
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `<ui-data-table
    caption="Items"
    [rowKey]="'id'"
    [columns]="columns"
    [rows]="rows"
    mode="virtual"
    [rowHeight]="40"
    viewportHeight="200px"
  />`,
})
class VirtualHostComponent {
  readonly columns: DataTableColumn<Item>[] = [
    { id: "label", header: "Label", field: "label" },
  ];
  readonly rows: Item[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    label: `Item ${i + 1}`,
  }));
}

// NOTE (declared limit): jsdom has no layout, so CDK virtual scroll does not
// truly virtualize here. These tests assert the viewport wiring + that the
// pagination footer is absent + axe — not the count of rendered rows.
describe("DataTableComponent — virtual scroll", () => {
  it("renders a CDK virtual-scroll viewport in virtual mode", async () => {
    const { container } = await render(VirtualHostComponent);
    expect(
      container.querySelector("cdk-virtual-scroll-viewport"),
    ).toBeInTheDocument();
  });

  it("does not render the pagination footer in virtual mode", async () => {
    await render(VirtualHostComponent);
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the grid and header semantics", async () => {
    await render(VirtualHostComponent);
    expect(screen.getByRole("grid", { name: "Items" })).toHaveAttribute(
      "aria-rowcount",
      "1001",
    );
    expect(
      screen.getByRole("columnheader", { name: "Label" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations in virtual mode", async () => {
    const { container } = await render(VirtualHostComponent);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DataTableComponent — keyboard navigation", () => {
  function focusCell(
    container: Element,
    row: number,
    col: number,
  ): HTMLElement {
    const cell = container.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`,
    )!;
    cell.focus();
    return cell;
  }
  const at = () => ({
    row: document.activeElement?.getAttribute("data-row"),
    col: document.activeElement?.getAttribute("data-col"),
  });

  it("makes only the active cell tabbable (roving tabindex)", async () => {
    const { container } = await render(SortHostComponent);
    expect(
      container.querySelector('[data-row="0"][data-col="0"]'),
    ).toHaveAttribute("tabindex", "0");
    expect(
      container.querySelector('[data-row="0"][data-col="1"]'),
    ).toHaveAttribute("tabindex", "-1");
  });

  it("moves the focus with arrow keys (2D)", async () => {
    const user = userEvent.setup();
    const { container } = await render(SortHostComponent);
    focusCell(container, 0, 0);
    await user.keyboard("{ArrowRight}");
    expect(at()).toEqual({ row: "0", col: "1" });
    await user.keyboard("{ArrowDown}");
    expect(at()).toEqual({ row: "1", col: "1" });
    await user.keyboard("{ArrowLeft}");
    expect(at()).toEqual({ row: "1", col: "0" });
    await user.keyboard("{ArrowUp}");
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  it("supports Home/End and Ctrl+Home/Ctrl+End", async () => {
    const user = userEvent.setup();
    const { container } = await render(SortHostComponent);
    focusCell(container, 0, 0);
    await user.keyboard("{End}");
    expect(at()).toEqual({ row: "0", col: "1" });
    await user.keyboard("{Home}");
    expect(at()).toEqual({ row: "0", col: "0" });
    await user.keyboard("{Control>}{End}{/Control}");
    expect(at()).toEqual({ row: "3", col: "1" }); // last row (3 rows), last col
    await user.keyboard("{Control>}{Home}{/Control}");
    expect(at()).toEqual({ row: "0", col: "0" });
  });

  it("activates a sortable header cell with Enter", async () => {
    const user = userEvent.setup();
    const { container } = await render(SortHostComponent);
    focusCell(container, 0, 0); // Name header
    await user.keyboard("{Enter}");
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("resets the active cell to the header after sorting", async () => {
    const user = userEvent.setup();
    const { container } = await render(SortHostComponent);
    focusCell(container, 0, 0);
    await user.keyboard("{ArrowDown}{ArrowRight}"); // active cell now (1,1)
    expect(
      container.querySelector('[data-row="1"][data-col="1"]'),
    ).toHaveAttribute("tabindex", "0");
    // Sorting changes the row set → roving focus resets to (0,0).
    await user.click(
      within(screen.getByRole("columnheader", { name: /Name/ })).getByRole(
        "button",
      ),
    );
    expect(
      container.querySelector('[data-row="0"][data-col="0"]'),
    ).toHaveAttribute("tabindex", "0");
    expect(
      container.querySelector('[data-row="1"][data-col="1"]'),
    ).toHaveAttribute("tabindex", "-1");
  });

  it("has no axe violations with keyboard wiring", async () => {
    const { container } = await render(SortHostComponent);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DataTableComponent — sticky header", () => {
  it("applies max-height and internal scroll when maxHeight is set", async () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent],
      template: `<ui-data-table
        caption="t"
        [columns]="cols"
        [rows]="rows"
        maxHeight="200px"
      />`,
    })
    class MaxHeightHostComponent {
      readonly cols: DataTableColumn<Item>[] = [
        { id: "label", header: "Label", field: "label" },
      ];
      readonly rows = ITEMS;
    }
    await render(MaxHeightHostComponent);
    const grid = screen.getByRole("grid");
    expect(grid.style.maxHeight).toBe("200px");
    expect(grid.style.overflowY).toBe("auto");
  });
});
