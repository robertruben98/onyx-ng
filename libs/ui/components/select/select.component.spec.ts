import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxSelectComponent, SelectOption } from "./select.component";

const axeOptions = { rules: { region: { enabled: false } } };

const OPTIONS: SelectOption[] = [
  { value: "ng", label: "Angular" },
  { value: "rx", label: "RxJS" },
  { value: "sd", label: "Style Dictionary", disabled: true },
];

interface SelectInternals {
  open(): boolean;
  activeIndex(): number;
  toggle(): void;
  onTriggerKeydown(event: KeyboardEvent): void;
  onListboxKeydown(event: KeyboardEvent): void;
  selectOption(index: number): void;
  close(): void;
  nextEnabled(from: number, step: number): number;
}

@Component({
  standalone: true,
  imports: [OnyxSelectComponent, ReactiveFormsModule],
  template: `<onyx-select [formControl]="ctrl" [options]="options" />`,
})
class HostComponent {
  readonly ctrl = new FormControl<string | null>(null);
  readonly options = OPTIONS;
}

function renderSelect() {
  return render(HostComponent);
}

describe("OnyxSelectComponent", () => {
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

  it("supports trigger and full listbox keyboard navigation", async () => {
    const user = userEvent.setup();
    const { fixture } = await renderSelect();
    const trigger = screen.getByRole("combobox");

    trigger.focus();
    await user.keyboard("{ArrowUp}");
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveFocus();
    expect(listbox).toHaveAttribute(
      "aria-activedescendant",
      expect.stringMatching(/-0$/),
    );

    await user.keyboard("{End}");
    expect(listbox).toHaveAttribute(
      "aria-activedescendant",
      expect.stringMatching(/-1$/),
    );
    await user.keyboard("{Home}");
    expect(listbox).toHaveAttribute(
      "aria-activedescendant",
      expect.stringMatching(/-0$/),
    );
    await user.keyboard("{ArrowUp}");
    expect(listbox).toHaveAttribute(
      "aria-activedescendant",
      expect.stringMatching(/-1$/),
    );
    await user.keyboard(" ");
    expect(fixture.componentInstance.ctrl.value).toBe("rx");
  });

  it("closes with Tab and by toggling the trigger", async () => {
    const user = userEvent.setup();
    await renderSelect();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await screen.findByRole("listbox");
    await user.keyboard("{Tab}");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );

    await user.click(trigger);
    await screen.findByRole("listbox");
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("keeps an open listbox open for supported trigger keys", async () => {
    const user = userEvent.setup();
    await renderSelect();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await screen.findByRole("listbox");

    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes on backdrop click and marks the control touched", async () => {
    const user = userEvent.setup();
    const { fixture } = await renderSelect();
    const touched = jest.spyOn(fixture.componentInstance.ctrl, "markAsTouched");
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    await user.click(
      document.querySelector(".cdk-overlay-backdrop") as HTMLElement,
    );

    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    expect(touched).toHaveBeenCalled();
  });

  it("starts on a preselected option", async () => {
    const user = userEvent.setup();
    const { fixture } = await renderSelect();
    fixture.componentInstance.ctrl.setValue("rx");
    fixture.detectChanges();

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      expect.stringMatching(/-1$/),
    );
  });

  it("ignores unsupported and disabled trigger keyboard input", async () => {
    const { fixture } = await renderSelect();
    const select = fixture.debugElement.query(By.directive(OnyxSelectComponent))
      .componentInstance as unknown as SelectInternals;
    const unsupported = new KeyboardEvent("keydown", { key: "x" });

    select.onTriggerKeydown(unsupported);
    fixture.componentInstance.ctrl.disable();
    fixture.detectChanges();
    select.onTriggerKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
    select.toggle();

    expect(select.open()).toBe(false);
  });

  it("guards missing and disabled options and handles an all-disabled set", async () => {
    const { fixture } = await render(
      `<onyx-select [options]="options" ariaLabel="Empty" />`,
      {
        imports: [OnyxSelectComponent],
        componentProperties: {
          options: [
            { value: "a", label: "A", disabled: true },
            { value: "b", label: "B", disabled: true },
          ],
        },
      },
    );
    const select = fixture.debugElement.query(By.directive(OnyxSelectComponent))
      .componentInstance as unknown as SelectInternals;

    select.selectOption(-1);
    select.selectOption(0);
    expect(select.nextEnabled(0, 1)).toBe(0);

    select.onListboxKeydown(new KeyboardEvent("keydown", { key: "x" }));
    select.close();
  });

  it("returns no enabled option for an empty set", async () => {
    const { fixture } = await render(
      `<onyx-select [options]="[]" ariaLabel="Empty" />`,
      { imports: [OnyxSelectComponent] },
    );
    const select = fixture.debugElement.query(
      By.directive(OnyxSelectComponent),
    ).componentInstance as unknown as SelectInternals;

    expect(select.nextEnabled(-1, 1)).toBe(-1);
  });

  it("selects without a forms directive registered", async () => {
    const user = userEvent.setup();
    await render(
      `<onyx-select [options]="options" ariaLabel="Framework" />`,
      {
        imports: [OnyxSelectComponent],
        componentProperties: { options: OPTIONS },
      },
    );

    await user.click(screen.getByRole("combobox", { name: "Framework" }));
    await user.click(await screen.findByRole("option", { name: "Angular" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Angular");
  });

  it("does not open when a required view child is unavailable", () => {
    TestBed.configureTestingModule({ imports: [OnyxSelectComponent] });
    const fixture = TestBed.createComponent(OnyxSelectComponent);
    const select = fixture.componentInstance as unknown as SelectInternals;
    Object.defineProperty(select, "panelTpl", { value: () => undefined });

    select.toggle();

    expect(select.open()).toBe(false);
  });

  it("has no axe violations (closed and open)", async () => {
    const user = userEvent.setup();
    const { container } = await renderSelect();
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });

  it("reflects invalid via aria-invalid on the trigger", async () => {
    await render(`<onyx-select [invalid]="true" [options]="[]" />`, {
      imports: [OnyxSelectComponent],
    });
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("renders a visible label linked to the trigger", async () => {
    await render(`<onyx-select label="Country" [options]="[]" />`, {
      imports: [OnyxSelectComponent],
    });
    const label = screen.getByText("Country");
    const trigger = screen.getByRole("combobox");
    expect(label.tagName).toBe("LABEL");
    expect((label as HTMLLabelElement).htmlFor).toBe(trigger.id);
  });

  it("applies the size host class", async () => {
    const { fixture } = await render(
      `<onyx-select size="sm" [options]="[]" />`,
      { imports: [OnyxSelectComponent] },
    );
    expect(fixture.nativeElement.firstElementChild).toHaveClass(
      "ui-select--sm",
    );
  });
});
