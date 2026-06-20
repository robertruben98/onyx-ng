import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxAccordionComponent } from "./accordion.component";
import { OnyxAccordionItemComponent } from "./accordion-item.component";

function renderAccordion(multi = false) {
  return render(
    `<onyx-accordion [multi]="multi">
      <onyx-accordion-item heading="One">First body</onyx-accordion-item>
      <onyx-accordion-item heading="Two">Second body</onyx-accordion-item>
      <onyx-accordion-item heading="Three" [disabled]="true">Third body</onyx-accordion-item>
    </onyx-accordion>`,
    {
      imports: [OnyxAccordionComponent, OnyxAccordionItemComponent],
      componentProperties: { multi },
    },
  );
}

describe("OnyxAccordionComponent", () => {
  it("starts collapsed with aria-expanded=false", async () => {
    await renderAccordion();
    for (const name of ["One", "Two", "Three"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
  });

  it("expands an item on click", async () => {
    const user = userEvent.setup();
    await renderAccordion();
    await user.click(screen.getByRole("button", { name: "One" }));
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("region", { name: "One" })).not.toHaveAttribute(
      "hidden",
    );
  });

  it("collapses others in single mode", async () => {
    const user = userEvent.setup();
    await renderAccordion(false);
    await user.click(screen.getByRole("button", { name: "One" }));
    await user.click(screen.getByRole("button", { name: "Two" }));
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("keeps multiple open in multi mode", async () => {
    const user = userEvent.setup();
    await renderAccordion(true);
    await user.click(screen.getByRole("button", { name: "One" }));
    await user.click(screen.getByRole("button", { name: "Two" }));
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("does not toggle a disabled item", async () => {
    const user = userEvent.setup();
    await renderAccordion();
    await user.click(screen.getByRole("button", { name: "Three" }));
    expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("has no axe violations", async () => {
    const { container } = await renderAccordion();
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("keyboard navigation", () => {
    it("ArrowDown moves focus to the next header button", async () => {
      const user = userEvent.setup();
      await renderAccordion();
      const [btn1, btn2] = screen.getAllByRole("button");
      btn1.focus();
      await user.keyboard("{ArrowDown}");
      expect(btn2).toHaveFocus();
    });

    it("ArrowUp moves focus to the previous header button", async () => {
      const user = userEvent.setup();
      await renderAccordion();
      const [btn1, btn2] = screen.getAllByRole("button");
      btn2.focus();
      await user.keyboard("{ArrowUp}");
      expect(btn1).toHaveFocus();
    });

    it("Home moves focus to the first header button", async () => {
      const user = userEvent.setup();
      await renderAccordion();
      const buttons = screen.getAllByRole("button");
      buttons[1].focus();
      await user.keyboard("{Home}");
      expect(buttons[0]).toHaveFocus();
    });

    it("End moves focus to the last enabled header button", async () => {
      const user = userEvent.setup();
      await renderAccordion();
      const buttons = screen.getAllByRole("button");
      buttons[0].focus();
      await user.keyboard("{End}");
      // buttons[2] is disabled — End should skip it and land on buttons[1]
      expect(buttons[1]).toHaveFocus();
    });

    it("ArrowDown wraps from last enabled to first", async () => {
      const user = userEvent.setup();
      await renderAccordion();
      const buttons = screen.getAllByRole("button");
      // Focus the last enabled button (index 1, since index 2 is disabled)
      buttons[1].focus();
      await user.keyboard("{ArrowDown}");
      expect(buttons[0]).toHaveFocus();
    });

    it("ArrowUp wraps from first to last enabled", async () => {
      const user = userEvent.setup();
      await renderAccordion();
      const buttons = screen.getAllByRole("button");
      buttons[0].focus();
      await user.keyboard("{ArrowUp}");
      // Last enabled is index 1 (index 2 is disabled)
      expect(buttons[1]).toHaveFocus();
    });
  });
});
