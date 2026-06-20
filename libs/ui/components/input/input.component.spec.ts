import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InputComponent } from "./input.component";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("InputComponent", () => {
  it("associates a visible label with the input", async () => {
    await render(`<onyx-input label="Email" />`, { imports: [InputComponent] });
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", async () => {
    await render(`<onyx-input ariaLabel="Search" />`, {
      imports: [InputComponent],
    });
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("emits valueChange as the user types", async () => {
    const user = userEvent.setup();
    const valueChange = jest.fn();
    await render(
      `<onyx-input label="Name" (valueChange)="valueChange($event)" />`,
      {
        imports: [InputComponent],
        componentProperties: { valueChange },
      },
    );
    await user.type(screen.getByLabelText("Name"), "abc");
    expect(valueChange).toHaveBeenCalledTimes(3);
    expect(valueChange).toHaveBeenLastCalledWith("abc");
  });

  it("is reachable by keyboard", async () => {
    const user = userEvent.setup();
    await render(`<onyx-input label="Name" />`, { imports: [InputComponent] });
    await user.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("reflects invalid state via aria-invalid", async () => {
    await render(`<onyx-input label="Name" [invalid]="true" />`, {
      imports: [InputComponent],
    });
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does NOT accept input when disabled", async () => {
    const user = userEvent.setup();
    const valueChange = jest.fn();
    await render(
      `<onyx-input label="Name" [disabled]="true" (valueChange)="valueChange($event)" />`,
      { imports: [InputComponent], componentProperties: { valueChange } },
    );
    const el = screen.getByLabelText("Name");
    expect(el).toBeDisabled();
    await user.type(el, "abc");
    expect(valueChange).not.toHaveBeenCalled();
  });

  describe("ControlValueAccessor (ngModel)", () => {
    @Component({
      standalone: true,
      imports: [InputComponent, FormsModule],
      template: `<onyx-input
        label="Name"
        [ngModel]="model()"
        (ngModelChange)="model.set($event)"
      />`,
    })
    class HostComponent {
      readonly model = signal("initial");
    }

    it("writes the model value into the input", async () => {
      await render(HostComponent);
      await waitFor(() =>
        expect(screen.getByLabelText("Name")).toHaveValue("initial"),
      );
    });

    it("updates the model when the user types", async () => {
      const user = userEvent.setup();
      const { fixture } = await render(HostComponent);
      const el = screen.getByLabelText("Name");
      await user.clear(el);
      await user.type(el, "hello");
      expect(fixture.componentInstance.model()).toBe("hello");
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = await render(`<onyx-input label="Email" />`, {
      imports: [InputComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = await render(
      `<onyx-input label="Email" [invalid]="true" />`,
      { imports: [InputComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = await render(
      `<onyx-input label="Email" [disabled]="true" />`,
      { imports: [InputComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
