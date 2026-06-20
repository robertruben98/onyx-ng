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
});
