import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export type CheckboxSize = "sm" | "md" | "lg";

let nextId = 0;

@Component({
  selector: "onyx-checkbox",
  standalone: true,
  templateUrl: "./checkbox.component.html",
  styleUrl: "./checkbox.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnyxCheckboxComponent),
      multi: true,
    },
  ],
  host: {
    "[class.ui-checkbox]": "true",
    "[class.ui-checkbox--sm]": "size() === 'sm'",
    "[class.ui-checkbox--lg]": "size() === 'lg'",
    "[class.ui-checkbox--invalid]": "invalid()",
    "[class.ui-checkbox--disabled]": "disabledState()",
  },
})
export class OnyxCheckboxComponent implements ControlValueAccessor {
  /** Control size. */
  readonly size = input<CheckboxSize>("md");
  /** Visible label — when set, wraps the control in a <label>. */
  readonly label = input("");
  /** Accessible name when no visible label is provided. */
  readonly ariaLabel = input("");
  /** Indeterminate (tri-state) — visual dash, not a checked value. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Invalid state — reflected via aria-invalid and styling. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Disabled via template binding (forms also drive it via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Tab order of the native control (set to -1 inside roving-tabindex grids). */
  readonly tabindex = input(0);

  /** Emitted on every change (in addition to the CVA contract). */
  readonly checkedChange = output<boolean>();

  private readonly box = viewChild<ElementRef<HTMLInputElement>>("box");

  protected readonly inputId = `ui-checkbox-${nextId++}`;
  protected readonly checked = signal(false);
  private readonly formDisabled = signal(false);
  protected readonly disabledState = computed(
    () => this.disabled() || this.formDisabled(),
  );

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // `indeterminate` is a DOM property, not an attribute — sync it imperatively.
    effect(() => {
      const el = this.box()?.nativeElement;
      if (el) {
        el.indeterminate = this.indeterminate();
      }
    });
  }

  protected handleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
    this.checkedChange.emit(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  // --- ControlValueAccessor -------------------------------------------------
  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
