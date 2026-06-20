import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type SpinnerSize = "sm" | "md" | "lg";

/**
 * Indeterminate loading indicator. Exposes `role=status` with an accessible
 * `label`; the spinning ring itself is decorative (`aria-hidden`).
 */
@Component({
  selector: "onyx-spinner",
  standalone: true,
  templateUrl: "./spinner.component.html",
  styleUrl: "./spinner.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "status",
    "[attr.aria-label]": "label()",
    "[class.ui-spinner]": "true",
    "[class.ui-spinner--sm]": "size() === 'sm'",
    "[class.ui-spinner--lg]": "size() === 'lg'",
  },
})
export class SpinnerComponent {
  /** Spinner size. */
  readonly size = input<SpinnerSize>("md");
  /** Accessible label announced by assistive tech. */
  readonly label = input("Loading");
}
