import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { OnyxBadgeComponent } from "./badge.component";

// Disable the "region" rule — isolated component test, no page landmark needed.
const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxBadgeComponent", () => {
  // B1: renders with correct ARIA role and content
  it('renders with role="status"', async () => {
    await render(`<onyx-badge>Active</onyx-badge>`, { imports: [OnyxBadgeComponent] });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders projected text inside the badge label", async () => {
    await render(`<onyx-badge>Pending</onyx-badge>`, { imports: [OnyxBadgeComponent] });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  // B2: variant CSS classes applied on the inner badge span
  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    'applies the correct class for variant "%s"',
    async (variant) => {
      const { container } = await render(
        `<onyx-badge [variant]="variant">Label</onyx-badge>`,
        { imports: [OnyxBadgeComponent], componentProperties: { variant } },
      );
      const badge = container.querySelector(".ui-badge") as HTMLElement;
      expect(badge).toHaveClass(`ui-badge--${variant}`);
    },
  );

  // B3: size CSS classes
  it("applies ui-badge--sm class when size is sm", async () => {
    const { container } = await render(`<onyx-badge size="sm">Label</onyx-badge>`, {
      imports: [OnyxBadgeComponent],
    });
    const badge = container.querySelector(".ui-badge") as HTMLElement;
    expect(badge).toHaveClass("ui-badge--sm");
  });

  it("applies ui-badge--md class when size is md (default)", async () => {
    const { container } = await render(`<onyx-badge>Label</onyx-badge>`, {
      imports: [OnyxBadgeComponent],
    });
    const badge = container.querySelector(".ui-badge") as HTMLElement;
    expect(badge).toHaveClass("ui-badge--md");
  });

  // B4: dot mode
  it("applies ui-badge--dot class and hides label text when dot is true", async () => {
    const { container } = await render(
      `<onyx-badge [dot]="true">Online</onyx-badge>`,
      { imports: [OnyxBadgeComponent] },
    );
    const badge = container.querySelector(".ui-badge") as HTMLElement;
    expect(badge).toHaveClass("ui-badge--dot");
    // Label span carries aria-hidden so screen readers skip repeated text
    const label = badge.querySelector(".ui-badge__label");
    expect(label).toHaveAttribute("aria-hidden", "true");
  });

  it("shows label text without aria-hidden when dot is false", async () => {
    const { container } = await render(`<onyx-badge>Active</onyx-badge>`, {
      imports: [OnyxBadgeComponent],
    });
    const label = container.querySelector(".ui-badge__label");
    expect(label).not.toHaveAttribute("aria-hidden");
  });

  // B5: axe passes for all variants
  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    'has no axe violations for variant "%s"',
    async (variant) => {
      const { container } = await render(
        `<onyx-badge [variant]="variant">Label</onyx-badge>`,
        { imports: [OnyxBadgeComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  it("has no axe violations in dot mode", async () => {
    const { container } = await render(
      `<onyx-badge [dot]="true">Online</onyx-badge>`,
      { imports: [OnyxBadgeComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
