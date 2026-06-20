import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from "@angular/core";

export type TagVariant = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * Compact label / chip. Optionally removable via a close button that emits
 * `removed`. Variants map to semantic feedback-role tokens.
 */
@Component({
  selector: "onyx-tag",
  standalone: true,
  templateUrl: "./tag.component.html",
  styleUrl: "./tag.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-tag]": "true",
    "[class.ui-tag--neutral]": "variant() === 'neutral'",
    "[class.ui-tag--info]": "variant() === 'info'",
    "[class.ui-tag--success]": "variant() === 'success'",
    "[class.ui-tag--warning]": "variant() === 'warning'",
    "[class.ui-tag--danger]": "variant() === 'danger'",
  },
})
export class OnyxTagComponent {
  /** Visual variant (semantic role). */
  readonly variant = input<TagVariant>("neutral");
  /** Whether a remove (close) button is shown. */
  readonly removable = input(false, { transform: booleanAttribute });
  /** Accessible name for the remove button. */
  readonly removeLabel = input("Remove");

  /** Emitted when the remove button is activated. */
  readonly removed = output<void>();

  protected remove(): void {
    this.removed.emit();
  }
}
