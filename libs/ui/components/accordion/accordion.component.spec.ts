import { By } from "@angular/platform-browser";
import { fireEvent, render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { accordionDoc } from "./accordion.docs";
import { OnyxAccordionComponent } from "./accordion.component";
import { OnyxAccordionItemComponent } from "./accordion-item.component";
import * as accordionPublicApi from "./index";

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

  it("collapses an expanded item on a second click", async () => {
    const user = userEvent.setup();
    await renderAccordion();
    const button = screen.getByRole("button", { name: "One" });
    await user.click(button);
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
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
    const { fixture } = await renderAccordion();
    const item = fixture.debugElement.queryAll(
      By.directive(OnyxAccordionItemComponent),
    )[2].componentInstance as OnyxAccordionItemComponent & {
      toggle(): void;
    };
    item.toggle();
    fixture.detectChanges();
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
    it("ignores keyboard events when there are no items", async () => {
      const { container } = await render(`<onyx-accordion />`, {
        imports: [OnyxAccordionComponent],
      });
      expect(
        fireEvent.keyDown(container.querySelector("onyx-accordion")!, {
          key: "ArrowDown",
        }),
      ).toBe(true);
    });

    it("ignores keyboard events when no header has focus", async () => {
      const { container } = await renderAccordion();
      expect(
        fireEvent.keyDown(container.querySelector("onyx-accordion")!, {
          key: "ArrowDown",
        }),
      ).toBe(true);
    });

    it("ignores unsupported keys", async () => {
      const { container } = await renderAccordion();
      screen.getAllByRole("button")[0].focus();
      expect(
        fireEvent.keyDown(container.querySelector("onyx-accordion")!, {
          key: "Escape",
        }),
      ).toBe(true);
    });

    it("keeps focus in place when every item becomes disabled", async () => {
      const { container, fixture } = await render(
        `<onyx-accordion>
          <onyx-accordion-item heading="One" [disabled]="disabled" />
          <onyx-accordion-item heading="Two" [disabled]="disabled" />
        </onyx-accordion>`,
        {
          imports: [OnyxAccordionComponent, OnyxAccordionItemComponent],
          componentProperties: { disabled: false },
        },
      );
      const first = screen.getAllByRole("button")[0];
      first.focus();
      (
        fixture.componentInstance as unknown as { disabled: boolean }
      ).disabled = true;
      fixture.detectChanges();

      expect(
        fireEvent.keyDown(container.querySelector("onyx-accordion")!, {
          key: "ArrowDown",
        }),
      ).toBe(true);
      expect(document.activeElement).toBe(first);
    });

    it("reports no enabled item when the accordion is empty", async () => {
      const { fixture } = await render(`<onyx-accordion />`, {
        imports: [OnyxAccordionComponent],
      });
      const accordion = fixture.debugElement.query(
        By.directive(OnyxAccordionComponent),
      ).componentInstance as {
        nextEnabled(from: number, step: number): number | null;
      };
      expect(accordion.nextEnabled(0, 1)).toBeNull();
    });

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

  it("exports its public API and documentation demos", () => {
    expect(accordionPublicApi.OnyxAccordionComponent).toBe(
      OnyxAccordionComponent,
    );
    expect(accordionPublicApi.OnyxAccordionItemComponent).toBe(
      OnyxAccordionItemComponent,
    );
    expect(accordionPublicApi.ACCORDION_HOST).toBeDefined();
    expect(accordionDoc.id).toBe("accordion");
    expect(accordionDoc.demos).toHaveLength(2);
  });
});
