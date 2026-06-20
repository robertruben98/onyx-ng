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

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let nextId = 0;

@Component({
  selector: "onyx-radio-group",
  standalone: true,
  templateUrl: "./radio-group.component.html",
  styleUrl: "./radio-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnyxRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    "[class.ui-radio-group]": "true",
    "[class.ui-radio-group--invalid]": "invalid()",
    "[class.ui-radio-group--disabled]": "disabledState()",
  },
})
export class OnyxRadioGroupComponent implements ControlValueAccessor {
  /** Options to render. */
  readonly options = input.required<RadioOption[]>();
  /** Visible group label — rendered as a <legend>. */
  readonly label = input("");
  /** Accessible name when no visible label is provided. */
  readonly ariaLabel = input("");
  /** Invalid state — reflected via aria-invalid and styling. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Disabled via template binding (forms also drive it via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on every selection change (in addition to the CVA contract). */
  readonly valueChange = output<string>();

  protected readonly name = `ui-radio-${nextId++}`;
  protected readonly value = signal("");
  private readonly formDisabled = signal(false);
  protected readonly disabledState = computed(
    () => this.disabled() || this.formDisabled(),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected select(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
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
