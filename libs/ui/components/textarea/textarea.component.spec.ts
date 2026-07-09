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

  describe("character counter", () => {
    it("is hidden when no maxLength is set", async () => {
      const { container } = await render(`<onyx-textarea label="Bio" />`, {
        imports: [OnyxTextareaComponent],
      });
      expect(container.querySelector(".ui-textarea__counter")).toBeNull();
      expect(screen.getByLabelText("Bio")).not.toHaveAttribute(
        "aria-describedby",
      );
    });

    it("renders a live counter and links it via aria-describedby", async () => {
      const { container } = await render(
        `<onyx-textarea label="Bio" [maxLength]="120" />`,
        { imports: [OnyxTextareaComponent] },
      );
      const counter = container.querySelector(".ui-textarea__counter")!;
      expect(counter).toHaveTextContent("0 / 120");
      expect(screen.getByLabelText("Bio")).toHaveAttribute(
        "aria-describedby",
        counter.id,
      );
    });

    it("updates the count as the user types", async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<onyx-textarea label="Bio" [maxLength]="120" />`,
        { imports: [OnyxTextareaComponent] },
      );
      await user.type(screen.getByLabelText("Bio"), "hello");
      expect(container.querySelector(".ui-textarea__counter")).toHaveTextContent(
        "5 / 120",
      );
    });

    it("caps input at maxLength and flags the limit", async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<onyx-textarea label="Bio" [maxLength]="3" />`,
        { imports: [OnyxTextareaComponent] },
      );
      const el = screen.getByLabelText("Bio");
      expect(el).toHaveAttribute("maxlength", "3");
      await user.type(el, "abcdef");
      expect(el).toHaveValue("abc");
      const counter = container.querySelector(".ui-textarea__counter")!;
      expect(counter).toHaveTextContent("3 / 3");
      expect(counter).toHaveClass("ui-textarea__counter--limit");
    });
  });

  describe("auto-grow", () => {
    it("sets an explicit height to fit its content by default", async () => {
      await render(`<onyx-textarea label="Bio" />`, {
        imports: [OnyxTextareaComponent],
      });
      expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).style.height)
        .not.toBe("");
    });

    it("leaves the height untouched when autoGrow is disabled", async () => {
      const user = userEvent.setup();
      await render(`<onyx-textarea label="Bio" [autoGrow]="false" />`, {
        imports: [OnyxTextareaComponent],
      });
      const el = screen.getByLabelText("Bio") as HTMLTextAreaElement;
      await user.type(el, "line one\nline two");
      expect(el.style.height).toBe("");
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

  it("has no axe violations (with counter)", async () => {
    const { container } = await render(
      `<onyx-textarea label="Bio" [maxLength]="120" />`,
      { imports: [OnyxTextareaComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
