import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TabsComponent } from "./tabs.component";
import { TabComponent } from "./tab.component";

const tpl = `
  <onyx-tabs ariaLabel="Sections" [(selectedIndex)]="index">
    <onyx-tab label="One">First panel</onyx-tab>
    <onyx-tab label="Two">Second panel</onyx-tab>
    <onyx-tab label="Three" [disabled]="true">Third panel</onyx-tab>
  </onyx-tabs>`;

function renderTabs(index = 0) {
  return render(tpl, {
    imports: [TabsComponent, TabComponent],
    componentProperties: { index },
  });
}

describe("TabsComponent", () => {
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

  it("has no axe violations", async () => {
    const { container } = await renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });
});
