import { By } from "@angular/platform-browser";
import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxTabsComponent } from "./tabs.component";
import { OnyxTabComponent } from "./tab.component";

const tpl = `
  <onyx-tabs ariaLabel="Sections" [(selectedIndex)]="index">
    <onyx-tab label="One">First panel</onyx-tab>
    <onyx-tab label="Two">Second panel</onyx-tab>
    <onyx-tab label="Three" [disabled]="true">Third panel</onyx-tab>
  </onyx-tabs>`;

interface TabsInternals {
  selectedIndex(): number;
  select(index: number): void;
  onKeydown(event: KeyboardEvent, index: number): void;
  nextEnabled(from: number, step: number): number | null;
}

function renderTabs(index = 0) {
  return render(tpl, {
    imports: [OnyxTabsComponent, OnyxTabComponent],
    componentProperties: { index },
  });
}

describe("OnyxTabsComponent", () => {
  it("renders a tablist with one tab per child", async () => {
    await renderTabs();
    expect(
      screen.getByRole("tablist", { name: "Sections" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("selects the first tab by default and wires ARIA", async () => {
    await renderTabs();
    const first = screen.getByRole("tab", { name: "One" });
    expect(first).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "One" });
    expect(panel).not.toHaveAttribute("hidden");
  });

  it("switches panel on click", async () => {
    const user = userEvent.setup();
    await renderTabs();
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: "Two" })).not.toHaveAttribute(
      "hidden",
    );
  });

  it("moves selection with arrow keys and skips disabled tabs", async () => {
    const user = userEvent.setup();
    await renderTabs();
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Next ArrowRight skips disabled "Three" and wraps to "One".
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("does not select a disabled tab on click", async () => {
    const user = userEvent.setup();
    await renderTabs();
    await user.click(screen.getByRole("tab", { name: "Three" }));
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("supports reverse arrows, Home, End and ignores other keys", async () => {
    const user = userEvent.setup();
    await renderTabs(1);
    const second = screen.getByRole("tab", { name: "Two" });
    second.focus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    await user.keyboard("x");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
  });

  it("guards direct disabled selection", async () => {
    const { fixture } = await renderTabs();
    const tabs = fixture.debugElement.query(By.directive(OnyxTabsComponent))
      .componentInstance as unknown as TabsInternals;

    tabs.select(2);

    expect(tabs.selectedIndex()).toBe(0);
  });

  it("returns without navigation for empty tabs", async () => {
    const { fixture } = await render(`<onyx-tabs />`, {
      imports: [OnyxTabsComponent],
    });
    const tabs = fixture.debugElement.query(
      By.directive(OnyxTabsComponent),
    ).componentInstance as unknown as TabsInternals;
    const emptyEvent = new KeyboardEvent("keydown", { key: "Home" });
    const emptyPrevent = jest.spyOn(emptyEvent, "preventDefault");

    tabs.onKeydown(emptyEvent, 0);

    expect(tabs.nextEnabled(-1, 1)).toBeNull();
    expect(emptyPrevent).not.toHaveBeenCalled();
  });

  it("returns without navigation when every tab is disabled", async () => {
    const { fixture } = await render(
      `<onyx-tabs>
        <onyx-tab label="One" [disabled]="true">One</onyx-tab>
        <onyx-tab label="Two" [disabled]="true">Two</onyx-tab>
      </onyx-tabs>`,
      { imports: [OnyxTabsComponent, OnyxTabComponent] },
    );
    const tabs = fixture.debugElement.query(
      By.directive(OnyxTabsComponent),
    ).componentInstance as unknown as TabsInternals;

    expect(tabs.nextEnabled(0, 1)).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = await renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });
});
