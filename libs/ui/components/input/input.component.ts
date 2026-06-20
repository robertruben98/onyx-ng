import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";
export type InputSize = "sm" | "md" | "lg";

let nextId = 0;

@Component({
  selector: "onyx-input",
  standalone: true,
  templateUrl: "./input.component.html",
  styleUrl: "./input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    "[class.ui-input]": "true",
    "[class.ui-input--sm]": "size() === 'sm'",
    "[class.ui-input--lg]": "size() === 'lg'",
    "[class.ui-input--invalid]": "invalid()",
    "[class.ui-input--disabled]": "disabledState()",
  },
})
export class InputComponent implements ControlValueAccessor {
  /** Native input type. */
  readonly type = input<InputType>("text");
  /** Control size. */
  readonly size = input<InputSize>("md");
  /** Placeholder text. */
  readonly placeholder = input("");
  /** Visible label — when set, renders a <label> linked to the input. */
  readonly label = input("");
  /** Accessible name when no visible label is provided. */
  readonly ariaLabel = input("");
  /** Invalid state — reflected via aria-invalid and styling. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Disabled via template binding (forms also drive it via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on every value change (in addition to the CVA contract). */
  readonly valueChange = output<string>();

  protected readonly inputId = `ui-input-${nextId++}`;
  protected readonly value = signal("");
  /** Disabled coming from the forms API (setDisabledState). */
  private readonly formDisabled = signal(false);
  protected readonly disabledState = computed(
    () => this.disabled() || this.formDisabled(),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  // --- ControlValueAccessor -------------------------------------------------
  writeValue(value: string | null): void {
    this.value.set(value ?? "");
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
