import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SelectComponent, SelectOption } from "./select.component";

const axeOptions = { rules: { region: { enabled: false } } };

const OPTIONS: SelectOption[] = [
  { value: "ng", label: "Angular" },
  { value: "rx", label: "RxJS" },
  { value: "sd", label: "Style Dictionary", disabled: true },
];

@Component({
  standalone: true,
  imports: [SelectComponent, ReactiveFormsModule],
  template: `<onyx-select [formControl]="ctrl" [options]="options" />`,
})
class HostComponent {
  readonly ctrl = new FormControl<string | null>(null);
  readonly options = OPTIONS;
}

function renderSelect() {
  return render(HostComponent);
}

describe("SelectComponent", () => {
  it("shows the placeholder and a collapsed combobox", async () => {
    await renderSelect();
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Select…");
  });

  it("opens a listbox of options on click", async () => {
    const user = userEvent.setup();
    await renderSelect();
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option, updates the form and closes", async () => {
    const user = userEvent.setup();
    const { fixture } = await renderSelect();
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "RxJS" }));

    expect(fixture.componentInstance.ctrl.value).toBe("rx");
    expect(screen.getByRole("combobox")).toHaveTextContent("RxJS");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("selects with keyboard (arrow + enter)", async () => {
    const user = userEvent.setup();
    const { fixture } = await renderSelect();
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Enter}");
    // active started at first enabled (Angular); ArrowDown -> RxJS; Enter selects.
    expect(fixture.componentInstance.ctrl.value).toBe("rx");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    await renderSelect();
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("does not open when disabled via the form control", async () => {
    const user = userEvent.setup();
    const { fixture } = await renderSelect();
    fixture.componentInstance.ctrl.disable();
    fixture.detectChanges();
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has no axe violations (closed and open)", async () => {
    const user = userEvent.setup();
    const { container } = await renderSelect();
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
