import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AlertComponent } from "./alert.component";

// Isolated component test — disable region rule (no landmark needed here).
const axeOptions = { rules: { region: { enabled: false } } };

describe("AlertComponent", () => {
  // B1: correct ARIA role based on severity
  it("uses role=alert for danger variant (assertive)", async () => {
    await render(
      `<ui-alert variant="danger">Something went wrong.</ui-alert>`,
      {
        imports: [AlertComponent],
      },
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=alert for warning variant (assertive)", async () => {
    await render(`<ui-alert variant="warning">Check your input.</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=status for info variant (polite)", async () => {
    await render(`<ui-alert variant="info">Information here.</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=status for success variant (polite)", async () => {
    await render(`<ui-alert variant="success">Operation done.</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // B2: variant CSS classes applied
  it.each(["info", "success", "warning", "danger"] as const)(
    "applies variant class ui-alert--%s",
    async (variant) => {
      const { container } = await render(
        `<ui-alert [variant]="variant">Message</ui-alert>`,
        { imports: [AlertComponent], componentProperties: { variant } },
      );
      expect(container.querySelector("ui-alert")).toHaveClass(
        `ui-alert--${variant}`,
      );
    },
  );

  // B3: dismiss button shown only when dismissible input is true
  it("does NOT render a dismiss button by default", async () => {
    await render(`<ui-alert>Default message.</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(
      screen.queryByRole("button", { name: /dismiss/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a dismiss button when dismissible is true", async () => {
    await render(`<ui-alert [dismissible]="true">Dismiss me.</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(
      screen.getByRole("button", { name: /dismiss/i }),
    ).toBeInTheDocument();
  });

  it("emits dismissed when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<ui-alert [dismissible]="true" (dismissed)="dismissed()">Dismiss me.</ui-alert>`,
      { imports: [AlertComponent], componentProperties: { dismissed } },
    );
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  // B4: icon slot content projection
  it("projects icon slot content", async () => {
    await render(
      `<ui-alert><span slot="icon" data-testid="icon">!</span>Message</ui-alert>`,
      { imports: [AlertComponent] },
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  // B5: keyboard support on dismiss button
  it("dismiss button is operable by keyboard (Enter)", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<ui-alert [dismissible]="true" (dismissed)="dismissed()">Dismiss me.</ui-alert>`,
      { imports: [AlertComponent], componentProperties: { dismissed } },
    );
    await user.tab();
    const btn = screen.getByRole("button", { name: /dismiss/i });
    expect(btn).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it("dismiss button is operable by keyboard (Space)", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<ui-alert [dismissible]="true" (dismissed)="dismissed()">Dismiss me.</ui-alert>`,
      { imports: [AlertComponent], componentProperties: { dismissed } },
    );
    await user.tab();
    await user.keyboard(" ");
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  // B6: axe passes for all variants
  it.each(["info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s variant)",
    async (variant) => {
      const { container } = await render(
        `<ui-alert [variant]="variant">Alert message for ${variant}.</ui-alert>`,
        { imports: [AlertComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  it("has no axe violations when dismissible", async () => {
    const { container } = await render(
      `<ui-alert [dismissible]="true">You can dismiss this.</ui-alert>`,
      { imports: [AlertComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  // Default variant is info
  it("defaults to info variant", async () => {
    const { container } = await render(`<ui-alert>Default.</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(container.querySelector("ui-alert")).toHaveClass("ui-alert--info");
  });
});
