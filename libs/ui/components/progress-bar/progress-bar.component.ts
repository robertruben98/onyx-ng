import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from "@angular/core";

/**
 * Progress indicator. Determinate by default (driven by `value`/`max`) or
 * `indeterminate`. Exposes `role=progressbar` with the matching ARIA values.
 */
@Component({
  selector: "onyx-progress-bar",
  standalone: true,
  templateUrl: "./progress-bar.component.html",
  styleUrl: "./progress-bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "progressbar",
    "[attr.aria-valuemin]": "0",
    "[attr.aria-valuemax]": "max()",
    "[attr.aria-valuenow]": "indeterminate() ? null : value()",
    "[attr.aria-label]": "label() || null",
    "[class.ui-progress]": "true",
    "[class.ui-progress--indeterminate]": "indeterminate()",
  },
})
export class OnyxProgressBarComponent {
  /** Current value. */
  readonly value = input(0, { transform: numberAttribute });
  /** Maximum value. */
  readonly max = input(100, { transform: numberAttribute });
  /** Indeterminate (unknown progress) mode. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Accessible label. */
  readonly label = input("");

  /** Clamped fill percentage (0–100). */
  protected readonly percent = computed(() => {
    const max = this.max() || 100;
    const ratio = (this.value() / max) * 100;
    return Math.max(0, Math.min(100, ratio));
  });
}
