import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type DividerOrientation = "horizontal" | "vertical";

/**
 * Visual separator. Renders a plain rule, or a labelled rule when `label` is
 * set. Exposes `role=separator` with the matching `aria-orientation`.
 */
@Component({
  selector: "onyx-divider",
  standalone: true,
  templateUrl: "./divider.component.html",
  styleUrl: "./divider.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "separator",
    "[attr.aria-orientation]": "orientation()",
    "[class.ui-divider]": "true",
    "[class.ui-divider--horizontal]": "orientation() === 'horizontal'",
    "[class.ui-divider--vertical]": "orientation() === 'vertical'",
    "[class.ui-divider--labelled]": "!!label()",
  },
})
export class OnyxDividerComponent {
  /** Layout orientation. */
  readonly orientation = input<DividerOrientation>("horizontal");
  /** Optional centered label (horizontal only). */
  readonly label = input("");
}
