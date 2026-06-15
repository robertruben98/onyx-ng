import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { BadgeComponent } from "./badge.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("BadgeComponent", () => {
  it("projects its content", async () => {
    await render(`<ui-badge>New</ui-badge>`, { imports: [BadgeComponent] });
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the variant class on the host", async () => {
    const { container } = await render(
      `<ui-badge variant="success">OK</ui-badge>`,
      {
        imports: [BadgeComponent],
      },
    );
    expect(container.querySelector("ui-badge")).toHaveClass(
      "ui-badge--success",
    );
  });

  it("defaults to the neutral variant", async () => {
    const { container } = await render(`<ui-badge>Default</ui-badge>`, {
      imports: [BadgeComponent],
    });
    expect(container.querySelector("ui-badge")).toHaveClass(
      "ui-badge--neutral",
    );
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s variant)",
    async (variant) => {
      const { container } = await render(
        `<ui-badge [variant]="variant">Label</ui-badge>`,
        { imports: [BadgeComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
