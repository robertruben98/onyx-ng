import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RadioGroupComponent, RadioOption } from "./radio-group.component";

const axeOptions = { rules: { region: { enabled: false } } };
const OPTIONS: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

describe("RadioGroupComponent", () => {
  it("renders a named radiogroup with one radio per option", async () => {
    await render(`<onyx-radio-group label="Size" [options]="options" />`, {
      imports: [RadioGroupComponent],
      componentProperties: { options: OPTIONS },
    });
    expect(
      screen.getByRole("radiogroup", { name: /size/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("emits valueChange with the selected value on click", async () => {
    const user = userEvent.setup();
    const valueChange = jest.fn();
    await render(
      `<onyx-radio-group label="Size" [options]="options" (valueChange)="valueChange($event)" />`,
      {
        imports: [RadioGroupComponent],
        componentProperties: { options: OPTIONS, valueChange },
      },
    );
    await user.click(screen.getByRole("radio", { name: /medium/i }));
    expect(valueChange).toHaveBeenLastCalledWith("md");
  });

  it("is selectable by keyboard (focus + Space)", async () => {
    const user = userEvent.setup();
    const valueChange = jest.fn();
    await render(
      `<onyx-radio-group label="Size" [options]="options" (valueChange)="valueChange($event)" />`,
      {
        imports: [RadioGroupComponent],
        componentProperties: { options: OPTIONS, valueChange },
      },
    );
    await user.tab();
    const first = screen.getByRole("radio", { name: /small/i });
    expect(first).toHaveFocus();
    await user.keyboard(" ");
    expect(valueChange).toHaveBeenLastCalledWith("sm");
  });

  it("disables an individual option", async () => {
    await render(`<onyx-radio-group label="Size" [options]="options" />`, {
      imports: [RadioGroupComponent],
      componentProperties: {
        options: [
          ...OPTIONS,
          { label: "X-Large", value: "xl", disabled: true },
        ],
      },
    });
    expect(screen.getByRole("radio", { name: /x-large/i })).toBeDisabled();
  });

  it("disables the whole group", async () => {
    await render(
      `<onyx-radio-group label="Size" [options]="options" [disabled]="true" />`,
      {
        imports: [RadioGroupComponent],
        componentProperties: { options: OPTIONS },
      },
    );
    screen.getAllByRole("radio").forEach((r) => expect(r).toBeDisabled());
  });

  describe("ControlValueAccessor (ngModel)", () => {
    @Component({
      standalone: true,
      imports: [RadioGroupComponent, FormsModule],
      template: `<onyx-radio-group
        label="Size"
        [options]="options"
        [ngModel]="model()"
        (ngModelChange)="model.set($event)"
      />`,
    })
    class HostComponent {
      readonly options = OPTIONS;
      readonly model = signal("lg");
    }

    it("writes the model value into the group", async () => {
      await render(HostComponent);
      await waitFor(() =>
        expect(screen.getByRole("radio", { name: /large/i })).toBeChecked(),
      );
    });

    it("updates the model on selection", async () => {
      const user = userEvent.setup();
      const { fixture } = await render(HostComponent);
      await user.click(screen.getByRole("radio", { name: /small/i }));
      expect(fixture.componentInstance.model()).toBe("sm");
    });
  });

  it("has no axe violations", async () => {
    const { container } = await render(
      `<onyx-radio-group label="Size" [options]="options" />`,
      {
        imports: [RadioGroupComponent],
        componentProperties: { options: OPTIONS },
      },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
