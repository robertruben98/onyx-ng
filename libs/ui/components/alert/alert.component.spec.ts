import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxAlertComponent } from "./alert.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxAlertComponent", () => {
  it("projects content and renders the title", async () => {
    await render(`<onyx-alert title="Heads up">Something happened</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("uses role=status for non-danger variants", async () => {
    await render(`<onyx-alert variant="info">Info</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for the danger variant", async () => {
    await render(`<onyx-alert variant="danger">Error</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has no dismiss button unless dismissible", async () => {
    await render(`<onyx-alert variant="info">Info</onyx-alert>`, {
      imports: [OnyxAlertComponent],
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("emits dismissed and hides the host when dismissed", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    const { container } = await render(
      `<onyx-alert variant="info" [dismissible]="true" dismissLabel="Cerrar" (dismissed)="dismissed()">Info</onyx-alert>`,
      { imports: [OnyxAlertComponent], componentProperties: { dismissed } },
    );
    await user.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(container.querySelector("onyx-alert")).toHaveAttribute("hidden");
  });

  it("dismiss button is keyboard operable", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<onyx-alert variant="info" [dismissible]="true" (dismissed)="dismissed()">Info</onyx-alert>`,
      { imports: [OnyxAlertComponent], componentProperties: { dismissed } },
    );
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s variant)",
    async (variant) => {
      const { container } = await render(
        `<onyx-alert [variant]="variant" title="Title" [dismissible]="true">Body</onyx-alert>`,
        { imports: [OnyxAlertComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
