import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { BadgeComponent } from "./badge.component";

// Disable the "region" rule — isolated component test, no page landmark needed.
const axeOptions = { rules: { region: { enabled: false } } };

describe("BadgeComponent", () => {
  // B1: renders with correct ARIA role and content
  it('renders with role="status"', async () => {
    await render(`<ui-badge>Active</ui-badge>`, { imports: [BadgeComponent] });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders projected text inside the badge label", async () => {
    await render(`<ui-badge>Pending</ui-badge>`, { imports: [BadgeComponent] });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  // B2: variant CSS classes applied on the inner badge span
  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    'applies the correct class for variant "%s"',
    async (variant) => {
      const { container } = await render(
        `<ui-badge [variant]="variant">Label</ui-badge>`,
        { imports: [BadgeComponent], componentProperties: { variant } },
      );
      const badge = container.querySelector(".ui-badge") as HTMLElement;
      expect(badge).toHaveClass(`ui-badge--${variant}`);
    },
  );

  // B3: size CSS classes
  it("applies ui-badge--sm class when size is sm", async () => {
    const { container } = await render(`<ui-badge size="sm">Label</ui-badge>`, {
      imports: [BadgeComponent],
    });
    const badge = container.querySelector(".ui-badge") as HTMLElement;
    expect(badge).toHaveClass("ui-badge--sm");
  });

  it("applies ui-badge--md class when size is md (default)", async () => {
    const { container } = await render(`<ui-badge>Label</ui-badge>`, {
      imports: [BadgeComponent],
    });
    const badge = container.querySelector(".ui-badge") as HTMLElement;
    expect(badge).toHaveClass("ui-badge--md");
  });

  // B4: dot mode
  it("applies ui-badge--dot class and hides label text when dot is true", async () => {
    const { container } = await render(
      `<ui-badge [dot]="true">Online</ui-badge>`,
      { imports: [BadgeComponent] },
    );
    const badge = container.querySelector(".ui-badge") as HTMLElement;
    expect(badge).toHaveClass("ui-badge--dot");
    // Label span carries aria-hidden so screen readers skip repeated text
    const label = badge.querySelector(".ui-badge__label");
    expect(label).toHaveAttribute("aria-hidden", "true");
  });

  it("shows label text without aria-hidden when dot is false", async () => {
    const { container } = await render(`<ui-badge>Active</ui-badge>`, {
      imports: [BadgeComponent],
    });
    const label = container.querySelector(".ui-badge__label");
    expect(label).not.toHaveAttribute("aria-hidden");
  });

  // B5: axe passes for all variants
  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    'has no axe violations for variant "%s"',
    async (variant) => {
      const { container } = await render(
        `<ui-badge [variant]="variant">Label</ui-badge>`,
        { imports: [BadgeComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  it("has no axe violations in dot mode", async () => {
    const { container } = await render(
      `<ui-badge [dot]="true">Online</ui-badge>`,
      { imports: [BadgeComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
