import { Component, signal } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxSliderComponent } from "./slider.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxSliderComponent", () => {
  it("exposes a slider with an accessible name from the label", async () => {
    await render(`<onyx-slider label="Volume" />`, {
      imports: [OnyxSliderComponent],
    });
    expect(
      screen.getByRole("slider", { name: /volume/i }),
    ).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", async () => {
    await render(`<onyx-slider ariaLabel="Brightness" />`, {
      imports: [OnyxSliderComponent],
    });
    expect(
      screen.getByRole("slider", { name: /brightness/i }),
    ).toBeInTheDocument();
  });

  it("emits valueChange when the value changes by input", async () => {
    const valueChange = jest.fn();
    await render(
      `<onyx-slider label="Volume" (valueChange)="valueChange($event)" />`,
      { imports: [OnyxSliderComponent], componentProperties: { valueChange } },
    );
    const slider = screen.getByRole<HTMLInputElement>("slider");
    slider.value = "25";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenLastCalledWith(25);
  });

  it("supports Arrow, Page and Home/End keyboard interactions", async () => {
    const user = userEvent.setup();
    await render(
      `<onyx-slider label="Volume" [min]="0" [max]="100" [step]="5" />`,
      { imports: [OnyxSliderComponent] },
    );
    const slider = screen.getByRole<HTMLInputElement>("slider");
    await user.tab();
    expect(slider).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveValue("5");
    await user.keyboard("{PageUp}");
    expect(slider).toHaveValue("55");
    await user.keyboard("{Home}");
    expect(slider).toHaveValue("0");
    await user.keyboard("{End}");
    expect(slider).toHaveValue("100");
    await user.keyboard("{PageDown}");
    expect(slider).toHaveValue("50");
    await user.keyboard("{ArrowLeft}");
    expect(slider).toHaveValue("45");
  });

  it("clamps and snaps values to the configured range", async () => {
    await render(
      `<onyx-slider label="Volume" [min]="10" [max]="30" [step]="4" />`,
      { imports: [OnyxSliderComponent] },
    );
    const slider = screen.getByRole<HTMLInputElement>("slider");
    slider.value = "99";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(slider).toHaveValue("30");
  });

  it("falls back to step 1 and the lower bound when inputs are invalid", async () => {
    const { fixture } = await render(
      `<onyx-slider label="Volume" [min]="10" [max]="10" [step]="0" />`,
      { imports: [OnyxSliderComponent] },
    );
    const slider = screen.getByRole<HTMLInputElement>("slider");
    const component = fixture.debugElement.children[0]
      .componentInstance as OnyxSliderComponent;
    component.writeValue(Number.NaN);
    fixture.detectChanges();
    expect(slider).toHaveValue("10");
  });

  it("registers the CVA callbacks directly", async () => {
    const { fixture } = await render(`<onyx-slider label="Volume" />`, {
      imports: [OnyxSliderComponent],
    });
    const component = fixture.debugElement.children[0]
      .componentInstance as OnyxSliderComponent;
    const onChange = jest.fn();
    const onTouched = jest.fn();
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);
    component.writeValue(40);
    fixture.detectChanges();
    const slider = screen.getByRole<HTMLInputElement>("slider");
    expect(slider).toHaveValue("40");
    slider.value = "45";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(onChange).toHaveBeenLastCalledWith(45);
    expect(onTouched).toHaveBeenCalledTimes(1);
  });

  it("does NOT emit when disabled", async () => {
    const valueChange = jest.fn();
    await render(
      `<onyx-slider label="Volume" [disabled]="true" (valueChange)="valueChange($event)" />`,
      { imports: [OnyxSliderComponent], componentProperties: { valueChange } },
    );
    const slider = screen.getByRole<HTMLInputElement>("slider");
    expect(slider).toBeDisabled();
    slider.value = "10";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(valueChange).not.toHaveBeenCalled();
  });

  it("handles blur safely before a touched callback is registered", async () => {
    await render(`<onyx-slider label="Volume" />`, {
      imports: [OnyxSliderComponent],
    });
    const slider = screen.getByRole<HTMLInputElement>("slider");
    slider.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(slider).toBeInTheDocument();
  });

  describe("ControlValueAccessor (ngModel)", () => {
    @Component({
      standalone: true,
      imports: [OnyxSliderComponent, FormsModule],
      template: `<onyx-slider
        label="Volume"
        [min]="0"
        [max]="50"
        [step]="5"
        [ngModel]="model()"
        (ngModelChange)="model.set($event)"
      />`,
    })
    class HostComponent {
      readonly model = signal(15);
    }

    it("writes the model value into the slider", async () => {
      await render(HostComponent);
      await waitFor(() =>
        expect(screen.getByRole<HTMLInputElement>("slider")).toHaveValue("15"),
      );
    });

    it("updates the model when the user changes the value", async () => {
      const { fixture } = await render(HostComponent);
      const slider = screen.getByRole<HTMLInputElement>("slider");
      slider.value = "30";
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      expect(fixture.componentInstance.model()).toBe(30);
    });
  });

  describe("ControlValueAccessor (reactive forms)", () => {
    @Component({
      standalone: true,
      imports: [OnyxSliderComponent, ReactiveFormsModule],
      template: `<onyx-slider label="Volume" [formControl]="control" />`,
    })
    class ReactiveHostComponent {
      readonly control = new FormControl(15, { nonNullable: true });
    }

    it("marks the control as touched on blur", async () => {
      const user = userEvent.setup();
      const { fixture } = await render(ReactiveHostComponent);
      const slider = screen.getByRole<HTMLInputElement>("slider");
      await user.tab();
      expect(slider).toHaveFocus();
      await user.tab();
      expect(fixture.componentInstance.control.touched).toBe(true);
    });

    it("respects the disabled state from the form control", async () => {
      @Component({
        standalone: true,
        imports: [OnyxSliderComponent, ReactiveFormsModule],
        template: `<onyx-slider label="Volume" [formControl]="control" />`,
      })
      class DisabledReactiveHostComponent {
        readonly control = new FormControl(
          { value: 15, disabled: true },
          { nonNullable: true },
        );
      }

      await render(DisabledReactiveHostComponent);
      expect(screen.getByRole("slider")).toBeDisabled();
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = await render(`<onyx-slider label="Volume" />`, {
      imports: [OnyxSliderComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = await render(
      `<onyx-slider label="Volume" [disabled]="true" />`,
      { imports: [OnyxSliderComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
