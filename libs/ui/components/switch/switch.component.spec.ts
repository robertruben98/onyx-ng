import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SwitchComponent } from "./switch.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("SwitchComponent", () => {
  it("exposes a switch with an accessible name from the label", async () => {
    await render(`<onyx-switch label="Notifications" />`, {
      imports: [SwitchComponent],
    });
    expect(
      screen.getByRole("switch", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", async () => {
    await render(`<onyx-switch ariaLabel="Dark mode" />`, {
      imports: [SwitchComponent],
    });
    expect(
      screen.getByRole("switch", { name: /dark mode/i }),
    ).toBeInTheDocument();
  });

  it("emits checkedChange when toggled by pointer", async () => {
    const user = userEvent.setup();
    const checkedChange = jest.fn();
    await render(
      `<onyx-switch label="A" (checkedChange)="checkedChange($event)" />`,
      { imports: [SwitchComponent], componentProperties: { checkedChange } },
    );
    await user.click(screen.getByRole("switch"));
    expect(checkedChange).toHaveBeenLastCalledWith(true);
  });

  it("is toggleable by keyboard (Space)", async () => {
    const user = userEvent.setup();
    const checkedChange = jest.fn();
    await render(
      `<onyx-switch label="A" (checkedChange)="checkedChange($event)" />`,
      { imports: [SwitchComponent], componentProperties: { checkedChange } },
    );
    await user.tab();
    expect(screen.getByRole("switch")).toHaveFocus();
    await user.keyboard(" ");
    expect(checkedChange).toHaveBeenLastCalledWith(true);
  });

  it("does NOT emit when disabled", async () => {
    const user = userEvent.setup();
    const checkedChange = jest.fn();
    await render(
      `<onyx-switch label="A" [disabled]="true" (checkedChange)="checkedChange($event)" />`,
      { imports: [SwitchComponent], componentProperties: { checkedChange } },
    );
    const sw = screen.getByRole("switch");
    expect(sw).toBeDisabled();
    await user.click(sw);
    expect(checkedChange).not.toHaveBeenCalled();
  });

  describe("ControlValueAccessor (ngModel)", () => {
    @Component({
      standalone: true,
      imports: [SwitchComponent, FormsModule],
      template: `<onyx-switch
        label="A"
        [ngModel]="model()"
        (ngModelChange)="model.set($event)"
      />`,
    })
    class HostComponent {
      readonly model = signal(true);
    }

    it("writes the model value into the control", async () => {
      await render(HostComponent);
      await waitFor(() => expect(screen.getByRole("switch")).toBeChecked());
    });

    it("updates the model when toggled", async () => {
      const user = userEvent.setup();
      const { fixture } = await render(HostComponent);
      await user.click(screen.getByRole("switch"));
      expect(fixture.componentInstance.model()).toBe(false);
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = await render(`<onyx-switch label="A" />`, {
      imports: [SwitchComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = await render(
      `<onyx-switch label="A" [disabled]="true" />`,
      { imports: [SwitchComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
