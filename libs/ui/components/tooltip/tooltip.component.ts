import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

/**
 * Floating tooltip surface attached to an overlay by `TooltipDirective`.
 * Exposes `role=tooltip` and the id the trigger references via
 * `aria-describedby`.
 */
@Component({
  selector: "onyx-tooltip",
  standalone: true,
  template: `{{ text() }}`,
  styleUrl: "./tooltip.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "tooltip",
    "[id]": "id()",
    "[class.ui-tooltip]": "true",
  },
})
export class TooltipComponent {
  /** Tooltip text. */
  readonly text = signal("");
  /** Element id referenced by the trigger's aria-describedby. */
  readonly id = signal("");
}
