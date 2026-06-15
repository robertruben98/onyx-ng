import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AlertComponent } from "./alert.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("AlertComponent", () => {
  it("projects content and renders the title", async () => {
    await render(`<ui-alert title="Heads up">Something happened</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("uses role=status for non-danger variants", async () => {
    await render(`<ui-alert variant="info">Info</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for the danger variant", async () => {
    await render(`<ui-alert variant="danger">Error</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has no dismiss button unless dismissible", async () => {
    await render(`<ui-alert variant="info">Info</ui-alert>`, {
      imports: [AlertComponent],
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("emits dismissed and hides the host when dismissed", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    const { container } = await render(
      `<ui-alert variant="info" [dismissible]="true" dismissLabel="Cerrar" (dismissed)="dismissed()">Info</ui-alert>`,
      { imports: [AlertComponent], componentProperties: { dismissed } },
    );
    await user.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(container.querySelector("ui-alert")).toHaveAttribute("hidden");
  });

  it("dismiss button is keyboard operable", async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    await render(
      `<ui-alert variant="info" [dismissible]="true" (dismissed)="dismissed()">Info</ui-alert>`,
      { imports: [AlertComponent], componentProperties: { dismissed } },
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
        `<ui-alert [variant]="variant" title="Title" [dismissible]="true">Body</ui-alert>`,
        { imports: [AlertComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
