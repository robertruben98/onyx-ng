import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";

export type AlertVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

@Component({
  selector: "onyx-alert",
  standalone: true,
  templateUrl: "./alert.component.html",
  styleUrl: "./alert.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-alert]": "true",
    "[class.ui-alert--neutral]": "variant() === 'neutral'",
    "[class.ui-alert--info]": "variant() === 'info'",
    "[class.ui-alert--success]": "variant() === 'success'",
    "[class.ui-alert--warning]": "variant() === 'warning'",
    "[class.ui-alert--danger]": "variant() === 'danger'",
    "[hidden]": "hidden()",
    "[attr.role]": "role()",
  },
})
export class OnyxAlertComponent {
  /** Visual variant (semantic role). */
  readonly variant = input<AlertVariant>("info");
  /** Optional bold title rendered above the content. */
  readonly title = input("");
  /** Whether a dismiss (close) button is shown. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Accessible name for the dismiss button. */
  readonly dismissLabel = input("Dismiss");

  /** Emitted when the alert is dismissed. */
  readonly dismissed = output<void>();

  /** danger -> assertive (alert); others -> polite (status). */
  protected readonly role = computed(() =>
    this.variant() === "danger" ? "alert" : "status",
  );

  /** Whether the alert has been dismissed (drives [hidden]). */
  protected readonly hidden = signal(false);

  protected dismiss(): void {
    this.hidden.set(true);
    this.dismissed.emit();
  }
}
