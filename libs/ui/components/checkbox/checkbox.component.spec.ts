import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CheckboxComponent } from "./checkbox.component";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("CheckboxComponent", () => {
  it("exposes a checkbox with an accessible name from the label", async () => {
    await render(`<ui-checkbox label="Accept terms" />`, {
      imports: [CheckboxComponent],
    });
    expect(
      screen.getByRole("checkbox", { name: /accept terms/i }),
    ).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", async () => {
    await render(`<ui-checkbox ariaLabel="Select row" />`, {
      imports: [CheckboxComponent],
    });
    expect(
      screen.getByRole("checkbox", { name: /select row/i }),
    ).toBeInTheDocument();
  });

  it("emits checkedChange when toggled by pointer", async () => {
    const user = userEvent.setup();
    const checkedChange = jest.fn();
    await render(
      `<ui-checkbox label="A" (checkedChange)="checkedChange($event)" />`,
      { imports: [CheckboxComponent], componentProperties: { checkedChange } },
    );
    await user.click(screen.getByRole("checkbox"));
    expect(checkedChange).toHaveBeenCalledTimes(1);
    expect(checkedChange).toHaveBeenLastCalledWith(true);
  });

  it("is toggleable by keyboard (Space)", async () => {
    const user = userEvent.setup();
    const checkedChange = jest.fn();
    await render(
      `<ui-checkbox label="A" (checkedChange)="checkedChange($event)" />`,
      { imports: [CheckboxComponent], componentProperties: { checkedChange } },
    );
    await user.tab();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    await user.keyboard(" ");
    expect(checkedChange).toHaveBeenLastCalledWith(true);
  });

  it("does NOT emit when disabled", async () => {
    const user = userEvent.setup();
    const checkedChange = jest.fn();
    await render(
      `<ui-checkbox label="A" [disabled]="true" (checkedChange)="checkedChange($event)" />`,
      { imports: [CheckboxComponent], componentProperties: { checkedChange } },
    );
    const box = screen.getByRole("checkbox");
    expect(box).toBeDisabled();
    await user.click(box);
    expect(checkedChange).not.toHaveBeenCalled();
  });

  it("reflects the indeterminate state on the native control", async () => {
    await render(`<ui-checkbox label="A" [indeterminate]="true" />`, {
      imports: [CheckboxComponent],
    });
    const box = screen.getByRole<HTMLInputElement>("checkbox");
    expect(box.indeterminate).toBe(true);
  });

  it("reflects invalid via aria-invalid", async () => {
    await render(`<ui-checkbox label="A" [invalid]="true" />`, {
      imports: [CheckboxComponent],
    });
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  describe("ControlValueAccessor (ngModel)", () => {
    @Component({
      standalone: true,
      imports: [CheckboxComponent, FormsModule],
      template: `<ui-checkbox
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
      await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
    });

    it("updates the model when toggled", async () => {
      const user = userEvent.setup();
      const { fixture } = await render(HostComponent);
      await user.click(screen.getByRole("checkbox"));
      expect(fixture.componentInstance.model()).toBe(false);
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = await render(`<ui-checkbox label="A" />`, {
      imports: [CheckboxComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = await render(
      `<ui-checkbox label="A" [disabled]="true" />`,
      { imports: [CheckboxComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (indeterminate)", async () => {
    const { container } = await render(
      `<ui-checkbox label="A" [indeterminate]="true" />`,
      { imports: [CheckboxComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
