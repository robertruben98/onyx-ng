import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

@Component({
  selector: "ui-badge",
  standalone: true,
  templateUrl: "./badge.component.html",
  styleUrl: "./badge.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-badge]": "true",
    "[class.ui-badge--neutral]": "variant() === 'neutral'",
    "[class.ui-badge--info]": "variant() === 'info'",
    "[class.ui-badge--success]": "variant() === 'success'",
    "[class.ui-badge--warning]": "variant() === 'warning'",
    "[class.ui-badge--danger]": "variant() === 'danger'",
  },
})
export class BadgeComponent {
  /** Visual variant (semantic role). */
  readonly variant = input<BadgeVariant>("neutral");
}
