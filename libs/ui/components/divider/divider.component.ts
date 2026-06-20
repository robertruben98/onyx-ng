import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

export type DividerOrientation = "horizontal" | "vertical";

@Component({
  selector: "onyx-divider",
  standalone: true,
  templateUrl: "./divider.component.html",
  styleUrl: "./divider.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-divider]": "true",
    "[class.ui-divider--vertical]": "orientation() === 'vertical'",
    "[class.ui-divider--decorative]": "decorative()",
    "[attr.role]": "hostRole()",
    "[attr.aria-orientation]": "hostAriaOrientation()",
    "[attr.aria-hidden]": 'decorative() ? "true" : null',
  },
})
export class OnyxDividerComponent {
  /** Visual and semantic orientation. */
  readonly orientation = input<DividerOrientation>("horizontal");

  /**
   * Decorative mode: the divider is purely visual. Sets `role="presentation"`
   * and `aria-hidden="true"` so assistive technologies skip it.
   */
  readonly decorative = input(false, { transform: booleanAttribute });

  /** Resolved ARIA role: presentation for decorative, separator otherwise. */
  protected readonly hostRole = computed(() =>
    this.decorative() ? "presentation" : "separator",
  );

  /** Expose aria-orientation only for meaningful (non-decorative) separators. */
  protected readonly hostAriaOrientation = computed(() =>
    this.decorative() ? null : this.orientation(),
  );
}
