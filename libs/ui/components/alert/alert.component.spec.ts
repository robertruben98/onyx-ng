import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxAlertComponent } from "./alert.component";

// Isolated component test — disable region rule (no landmark needed here).
const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxAlertComponent", () => {
  // B1: correct ARIA role based on severity
  it("uses role=alert for danger variant (assertive)", async () => {
    await render(
      `<onyx-alert variant="danger">Something went wrong.</onyx-alert>`,
      {
        imports: [OnyxAlertComponent],
      },
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=alert for warning variant (assertive)", async () => {
    await render(`<onyx-alert variant="warning">Check your input.</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=status for info variant (polite)", async () => {
    await render(`<onyx-alert variant="info">Information here.</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=status for success variant (polite)", async () => {
    await render(`<onyx-alert variant="success">Operation done.</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // B2: variant CSS classes applied
  it.each(["info", "success", "warning", "danger"] as const)(
    "applies variant class ui-alert--%s",
    async (variant) => {
      const { container } = await render(
        `<onyx-alert [variant]="variant">Message</onyx-alert>`,
        { imports: [OnyxAlertComponent], componentProperties: { variant } },
      );
      expect(container.querySelector("onyx-alert")).toHaveClass(
        `ui-alert--${variant}`,
      );
    },
  );

  // B3: dismiss button shown only when dismissible input is true
  it("does NOT render a dismiss button by default", async () => {
    await render(`<onyx-alert>Default message.</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(
      screen.queryByRole("button", { name: /dismiss/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a dismiss button when dismissible is true", async () => {
    await render(`<onyx-alert [dismissible]="true">Dismiss me.</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(
      screen.getByRole("button", { name: /dismiss/i }),
    ).toBeInTheDocument();
  });

  it("emits dismissed when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<onyx-alert [dismissible]="true" (dismissed)="dismissed()">Dismiss me.</onyx-alert>`,
      { imports: [OnyxAlertComponent], componentProperties: { dismissed } },
    );
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  // B4: icon slot content projection
  it("projects icon slot content", async () => {
    await render(
      `<onyx-alert><span slot="icon" data-testid="icon">!</span>Message</onyx-alert>`,
      { imports: [OnyxAlertComponent] },
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  // B5: keyboard support on dismiss button
  it("dismiss button is operable by keyboard (Enter)", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<onyx-alert [dismissible]="true" (dismissed)="dismissed()">Dismiss me.</onyx-alert>`,
      { imports: [OnyxAlertComponent], componentProperties: { dismissed } },
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
      `<onyx-alert [dismissible]="true" (dismissed)="dismissed()">Dismiss me.</onyx-alert>`,
      { imports: [OnyxAlertComponent], componentProperties: { dismissed } },
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
        `<onyx-alert [variant]="variant">Alert message for ${variant}.</onyx-alert>`,
        { imports: [OnyxAlertComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  it("has no axe violations when dismissible", async () => {
    const { container } = await render(
      `<onyx-alert [dismissible]="true">You can dismiss this.</onyx-alert>`,
      { imports: [OnyxAlertComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  // Default variant is info
  it("defaults to info variant", async () => {
    const { container } = await render(`<onyx-alert>Default.</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(container.querySelector("onyx-alert")).toHaveClass("ui-alert--info");
  });
});
