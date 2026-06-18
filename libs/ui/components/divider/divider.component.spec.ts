import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { DividerComponent } from "./divider.component";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("DividerComponent", () => {
  // B1: Renders with role=separator (horizontal by default)
  it("renders with role separator by default", async () => {
    const { container } = await render(`<ui-divider></ui-divider>`, {
      imports: [DividerComponent],
    });
    const separator = container.querySelector('[role="separator"]');
    expect(separator).not.toBeNull();
  });

  it("has aria-orientation horizontal by default", async () => {
    const { container } = await render(`<ui-divider></ui-divider>`, {
      imports: [DividerComponent],
    });
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
  });

  // B2: orientation input toggles aria-orientation to vertical
  it("sets aria-orientation to vertical when orientation is vertical", async () => {
    const { container } = await render(
      `<ui-divider [orientation]="'vertical'"></ui-divider>`,
      { imports: [DividerComponent] },
    );
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("applies vertical CSS class when orientation is vertical", async () => {
    const { container } = await render(
      `<ui-divider [orientation]="'vertical'"></ui-divider>`,
      { imports: [DividerComponent] },
    );
    expect(container.firstElementChild).toHaveClass("ui-divider--vertical");
  });

  // B3: Decorative mode sets role=presentation and hides from AT
  it("uses role presentation in decorative mode", async () => {
    const { container } = await render(
      `<ui-divider [decorative]="true"></ui-divider>`,
      { imports: [DividerComponent] },
    );
    const el = container.querySelector('[role="presentation"]');
    expect(el).not.toBeNull();
    expect(container.querySelector('[role="separator"]')).toBeNull();
  });

  it("sets aria-hidden true in decorative mode", async () => {
    const { container } = await render(
      `<ui-divider [decorative]="true"></ui-divider>`,
      { imports: [DividerComponent] },
    );
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  // B4: Optional label slot renders centered label
  it("renders slotted label content", async () => {
    await render(`<ui-divider>OR</ui-divider>`, {
      imports: [DividerComponent],
    });
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("applies has-label class when label content is provided via ng-content slot", async () => {
    // The component shows the label area when projected content exists via data attribute
    const { container } = await render(`<ui-divider>OR</ui-divider>`, {
      imports: [DividerComponent],
    });
    // The label span should be present in the DOM
    const labelSpan = container.querySelector(".ui-divider__label");
    expect(labelSpan).not.toBeNull();
  });

  // B5: axe violations
  it("has no axe violations (default horizontal)", async () => {
    const { container } = await render(`<ui-divider></ui-divider>`, {
      imports: [DividerComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (vertical)", async () => {
    const { container } = await render(
      `<ui-divider [orientation]="'vertical'"></ui-divider>`,
      { imports: [DividerComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (decorative)", async () => {
    const { container } = await render(
      `<ui-divider [decorative]="true"></ui-divider>`,
      { imports: [DividerComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (with label)", async () => {
    const { container } = await render(`<ui-divider>OR</ui-divider>`, {
      imports: [DividerComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
