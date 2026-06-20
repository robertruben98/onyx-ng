import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { fireEvent, render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxTextareaComponent } from "./textarea.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxTextareaComponent", () => {
  it("associates a visible label with the control", async () => {
    await render(`<onyx-textarea label="Bio" />`, {
      imports: [OnyxTextareaComponent],
    });
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", async () => {
    await render(`<onyx-textarea ariaLabel="Notes" />`, {
      imports: [OnyxTextareaComponent],
    });
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("emits valueChange as the user types", async () => {
    const user = userEvent.setup();
    const valueChange = jest.fn();
    await render(
      `<onyx-textarea label="Bio" (valueChange)="valueChange($event)" />`,
      {
        imports: [OnyxTextareaComponent],
        componentProperties: { valueChange },
      },
    );
    await user.type(screen.getByLabelText("Bio"), "hi");
    expect(valueChange).toHaveBeenLastCalledWith("hi");
  });

  it("is reachable by keyboard", async () => {
    const user = userEvent.setup();
    await render(`<onyx-textarea label="Bio" />`, {
      imports: [OnyxTextareaComponent],
    });
    await user.tab();
    expect(screen.getByLabelText("Bio")).toHaveFocus();
  });

  it("accepts blur before a forms touched callback is registered", async () => {
    await render(`<onyx-textarea label="Bio" />`, {
      imports: [OnyxTextareaComponent],
    });
    expect(fireEvent.blur(screen.getByLabelText("Bio"))).toBe(true);
  });

  it("reflects invalid via aria-invalid", async () => {
    await render(`<onyx-textarea label="Bio" [invalid]="true" />`, {
      imports: [OnyxTextareaComponent],
    });
    expect(screen.getByLabelText("Bio")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does NOT accept input when disabled", async () => {
    const user = userEvent.setup();
    const valueChange = jest.fn();
    await render(
      `<onyx-textarea label="Bio" [disabled]="true" (valueChange)="valueChange($event)" />`,
      { imports: [OnyxTextareaComponent], componentProperties: { valueChange } },
    );
    const el = screen.getByLabelText("Bio");
    expect(el).toBeDisabled();
    await user.type(el, "x");
    expect(valueChange).not.toHaveBeenCalled();
  });

  describe("ControlValueAccessor (ngModel)", () => {
    @Component({
      standalone: true,
      imports: [OnyxTextareaComponent, FormsModule],
      template: `<onyx-textarea
        label="Bio"
        [ngModel]="model()"
        (ngModelChange)="model.set($event)"
      />`,
    })
    class HostComponent {
      readonly model = signal("hello");
    }

    it("writes the model value into the control", async () => {
      await render(HostComponent);
      await waitFor(() =>
        expect(screen.getByLabelText("Bio")).toHaveValue("hello"),
      );
    });

    it("updates the model when the user types", async () => {
      const user = userEvent.setup();
      const { fixture } = await render(HostComponent);
      const el = screen.getByLabelText("Bio");
      await user.clear(el);
      await user.type(el, "world");
      expect(fixture.componentInstance.model()).toBe("world");
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = await render(`<onyx-textarea label="Bio" />`, {
      imports: [OnyxTextareaComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = await render(
      `<onyx-textarea label="Bio" [invalid]="true" />`,
      { imports: [OnyxTextareaComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
