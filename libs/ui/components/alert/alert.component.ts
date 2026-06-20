import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from "@angular/core";

export type AlertVariant = "info" | "success" | "warning" | "danger";

/** Assertive variants announce immediately via role=alert; polite ones use role=status. */
const ASSERTIVE_VARIANTS: ReadonlySet<AlertVariant> = new Set([
  "danger",
  "warning",
]);

@Component({
  selector: "ui-alert",
  standalone: true,
  templateUrl: "./alert.component.html",
  styleUrl: "./alert.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-alert]": "true",
    "[class.ui-alert--info]": "variant() === 'info'",
    "[class.ui-alert--success]": "variant() === 'success'",
    "[class.ui-alert--warning]": "variant() === 'warning'",
    "[class.ui-alert--danger]": "variant() === 'danger'",
  },
})
export class AlertComponent {
  /** Visual and semantic variant — drives colors and ARIA live region role. */
  readonly variant = input<AlertVariant>("info");

  /** When true, a dismiss button is rendered that emits `dismissed` on activation. */
  readonly dismissible = input(false, { transform: booleanAttribute });

  /** Emitted when the user activates the dismiss button. */
  readonly dismissed = output<void>();

  /** `role=alert` for assertive variants (danger, warning); `role=status` for polite ones. */
  protected readonly ariaRole = computed(() =>
    ASSERTIVE_VARIANTS.has(this.variant()) ? "alert" : "status",
  );

  protected handleDismiss(): void {
    this.dismissed.emit();
  }
}
