import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { fireEvent, render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxMenuComponent, MenuItem } from "./menu.component";

const axeOptions = { rules: { region: { enabled: false } } };

const ITEMS: MenuItem[] = [
  { id: "edit", label: "Edit" },
  { id: "dup", label: "Duplicate" },
  { id: "del", label: "Delete", disabled: true },
];

interface MenuInternals {
  open(): boolean;
  toggle(): void;
  activate(item: MenuItem): void;
  close(): void;
  itemElements(): HTMLButtonElement[];
}

function renderMenu(onSelect = jest.fn()) {
  return render(
    `<onyx-menu [items]="items" (itemSelect)="onSelect($event)">Actions</onyx-menu>`,
    {
      imports: [OnyxMenuComponent],
      componentProperties: { items: ITEMS, onSelect },
    },
  );
}

describe("OnyxMenuComponent", () => {
  it("renders a collapsed trigger with aria-haspopup=menu", async () => {
    await renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu and lists items", async () => {
    const user = userEvent.setup();
    await renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("emits the chosen item and closes on click", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await renderMenu(onSelect);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Duplicate" }),
    );
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dup" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("focuses the first item on open and moves with ArrowDown", async () => {
    const user = userEvent.setup();
    await renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus(),
    );
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("does not emit for a disabled item", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await renderMenu(onSelect);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    await renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("supports trigger, reverse, boundary and Tab keyboard navigation", async () => {
    const user = userEvent.setup();
    await renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });

    trigger.focus();
    await user.keyboard("{ArrowUp}");
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus(),
    );

    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Tab}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );

    trigger.focus();
    await user.keyboard("x");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("keeps an open menu open for supported trigger keys and toggles by click", async () => {
    const user = userEvent.setup();
    await renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    await user.click(trigger);
    await screen.findByRole("menu");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("closes on backdrop click", async () => {
    const user = userEvent.setup();
    await renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    await user.click(
      document.querySelector(".cdk-overlay-backdrop") as HTMLElement,
    );
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("ignores menu key presses when there are no enabled items", async () => {
    const user = userEvent.setup();
    await render(`<onyx-menu [items]="items">Empty</onyx-menu>`, {
      imports: [OnyxMenuComponent],
      componentProperties: {
        items: [{ label: "Unavailable", disabled: true }],
      },
    });
    await user.click(screen.getByRole("button", { name: "Empty" }));
    const menu = await screen.findByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("guards disabled activation and closed internal operations", async () => {
    const onSelect = jest.fn();
    const { fixture } = await renderMenu(onSelect);
    const menu = fixture.debugElement.query(By.directive(OnyxMenuComponent))
      .componentInstance as unknown as MenuInternals;

    menu.activate(ITEMS[2]);
    menu.close();

    expect(onSelect).not.toHaveBeenCalled();
    expect(menu.itemElements()).toEqual([]);
  });

  it("does not open when a required view child is unavailable", () => {
    TestBed.configureTestingModule({ imports: [OnyxMenuComponent] });
    const fixture = TestBed.createComponent(OnyxMenuComponent);
    const menu = fixture.componentInstance as unknown as MenuInternals;
    Object.defineProperty(menu, "panelTpl", { value: () => undefined });

    menu.toggle();

    expect(menu.open()).toBe(false);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    await renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
