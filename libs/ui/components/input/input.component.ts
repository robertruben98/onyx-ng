import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
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

/**
 * Token-themed text input implementing ControlValueAccessor. Supports optional
 * `[slot=prefix]` / `[slot=suffix]` content and a hint/error message region
 * linked to the control via `aria-describedby`. A non-empty `error` also puts
 * the field in the invalid state.
 */
@Component({
  selector: "onyx-input",
  standalone: true,
  templateUrl: "./input.component.html",
  styleUrl: "./input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnyxInputComponent),
      multi: true,
    },
  ],
  host: {
    "[class.ui-input]": "true",
    "[class.ui-input--sm]": "size() === 'sm'",
    "[class.ui-input--lg]": "size() === 'lg'",
    "[class.ui-input--invalid]": "isInvalid()",
    "[class.ui-input--disabled]": "disabledState()",
  },
})
export class OnyxInputComponent implements ControlValueAccessor {
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
  /** Hint text shown below the field (superseded by `error`). */
  readonly hint = input("");
  /** Error text shown below the field; also forces the invalid state. */
  readonly error = input("");
  /** Invalid state — reflected via aria-invalid and styling. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Disabled via template binding (forms also drive it via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on every value change (in addition to the CVA contract). */
  readonly valueChange = output<string>();

  private readonly uid = nextId++;
  protected readonly inputId = `ui-input-${this.uid}`;
  protected readonly messageId = `ui-input-message-${this.uid}`;

  protected readonly value = signal("");
  /** Disabled coming from the forms API (setDisabledState). */
  private readonly formDisabled = signal(false);
  protected readonly disabledState = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /** Invalid when explicitly flagged or whenever an error message is present. */
  protected readonly isInvalid = computed(
    () => this.invalid() || this.error() !== "",
  );
  /** Message shown below the field — error takes precedence over hint. */
  protected readonly message = computed(() => this.error() || this.hint());
  /** Links the input to its message region only when a message is shown. */
  protected readonly describedBy = computed(() =>
    this.message() ? this.messageId : null,
  );

  private readonly prefixAffix =
    viewChild.required<ElementRef<HTMLElement>>("prefixAffix");
  private readonly suffixAffix =
    viewChild.required<ElementRef<HTMLElement>>("suffixAffix");
  /** Whether slot content was projected — empty affixes stay out of layout. */
  protected readonly hasPrefix = signal(false);
  protected readonly hasSuffix = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    afterNextRender(() => {
      this.hasPrefix.set(
        this.prefixAffix().nativeElement.childElementCount > 0,
      );
      this.hasSuffix.set(
        this.suffixAffix().nativeElement.childElementCount > 0,
      );
    });
  }

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
