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
  selector: "onyx-slider",
  standalone: true,
  templateUrl: "./slider.component.html",
  styleUrl: "./slider.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnyxSliderComponent),
      multi: true,
    },
  ],
  host: {
    "[class.ui-slider]": "true",
    "[class.ui-slider--disabled]": "disabledState()",
    "[style.--ui-slider-fill]": "fillPercent() + '%'",
    "[style.--ui-slider-track-background]": "trackBackground()",
  },
})
export class OnyxSliderComponent implements ControlValueAccessor {
  /** Lower bound of the range. */
  readonly min = input(0, { transform: numberAttribute });
  /** Upper bound of the range. */
  readonly max = input(100, { transform: numberAttribute });
  /** Step size used by both pointer and keyboard interactions. */
  readonly step = input(1, { transform: numberAttribute });
  /** Visible label — when set, renders a <label> linked to the slider. */
  readonly label = input("");
  /** Accessible name when no visible label is provided. */
  readonly ariaLabel = input("");
  /** Disabled via template binding (forms also drive it via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on every value change (in addition to the CVA contract). */
  readonly valueChange = output<number>();

  protected readonly inputId = `ui-slider-${nextId++}`;
  protected readonly value = signal(0);
  private readonly formDisabled = signal(false);
  protected readonly disabledState = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly lowerBound = computed(() =>
    Math.min(this.min(), this.max()),
  );
  protected readonly upperBound = computed(() =>
    Math.max(this.min(), this.max()),
  );
  protected readonly normalizedStep = computed(() => {
    const step = this.step();
    return Number.isFinite(step) && step > 0 ? step : 1;
  });
  protected readonly fillPercent = computed(() => {
    const range = this.upperBound() - this.lowerBound();
    if (range <= 0) return 0;
    return ((this.value() - this.lowerBound()) / range) * 100;
  });
  protected readonly trackBackground = computed(() => {
    const fill = `${this.fillPercent()}%`;
    return `linear-gradient(to right, var(--ui-progress-fill-bg) 0 ${fill}, var(--ui-progress-track-bg) ${fill} 100%)`;
  });

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  protected handleInput(event: Event): void {
    if (this.disabledState()) return;
    this.setValue((event.target as HTMLInputElement).valueAsNumber);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabledState()) return;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        this.setValue(this.value() - this.normalizedStep());
        break;
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        this.setValue(this.value() + this.normalizedStep());
        break;
      case "PageDown":
        event.preventDefault();
        this.setValue(this.value() - this.normalizedStep() * 10);
        break;
      case "PageUp":
        event.preventDefault();
        this.setValue(this.value() + this.normalizedStep() * 10);
        break;
      case "Home":
        event.preventDefault();
        this.setValue(this.lowerBound());
        break;
      case "End":
        event.preventDefault();
        this.setValue(this.upperBound());
        break;
    }
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  private setValue(raw: number, emit = true): void {
    const value = this.normalize(raw);
    if (value === this.value()) return;
    this.value.set(value);
    if (emit) {
      this.onChange(value);
      this.valueChange.emit(value);
    }
  }

  private normalize(raw: number): number {
    const min = this.lowerBound();
    const max = this.upperBound();
    const step = this.normalizedStep();
    const base = Number.isFinite(raw) ? raw : min;
    const clamped = Math.min(max, Math.max(min, base));
    const snapped = min + Math.round((clamped - min) / step) * step;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
  }

  // --- ControlValueAccessor -------------------------------------------------
  writeValue(value: number | null): void {
    this.setValue(value ?? this.lowerBound(), false);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
