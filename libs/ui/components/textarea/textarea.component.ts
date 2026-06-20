import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

let nextId = 0;

@Component({
  selector: "onyx-textarea",
  standalone: true,
  templateUrl: "./textarea.component.html",
  styleUrl: "./textarea.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  host: {
    "[class.ui-textarea]": "true",
    "[class.ui-textarea--invalid]": "invalid()",
    "[class.ui-textarea--disabled]": "disabledState()",
  },
})
export class TextareaComponent implements ControlValueAccessor {
  /** Number of visible text rows. */
  readonly rows = input(3, { transform: numberAttribute });
  /** Placeholder text. */
  readonly placeholder = input("");
  /** Visible label — when set, renders a <label> linked to the control. */
  readonly label = input("");
  /** Accessible name when no visible label is provided. */
  readonly ariaLabel = input("");
  /** Invalid state — reflected via aria-invalid and styling. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Disabled via template binding (forms also drive it via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on every value change (in addition to the CVA contract). */
  readonly valueChange = output<string>();

  protected readonly inputId = `ui-textarea-${nextId++}`;
  protected readonly value = signal("");
  private readonly formDisabled = signal(false);
  protected readonly disabledState = computed(
    () => this.disabled() || this.formDisabled(),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
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
