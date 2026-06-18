import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { NgClass } from "@angular/common";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";
export type BadgeSize = "sm" | "md";

@Component({
  selector: "ui-badge",
  standalone: true,
  imports: [NgClass],
  templateUrl: "./badge.component.html",
  styleUrl: "./badge.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  /** Visual variant — maps to a color scheme. */
  readonly variant = input<BadgeVariant>("neutral");
  /** Control size. */
  readonly size = input<BadgeSize>("md");
  /** Dot mode — shows only a colored indicator, hides label text visually. */
  readonly dot = input(false, { transform: booleanAttribute });

  /** CSS class map computed from current inputs. */
  protected readonly classes = computed(() => ({
    "ui-badge": true,
    [`ui-badge--${this.variant()}`]: true,
    [`ui-badge--${this.size()}`]: true,
    "ui-badge--dot": this.dot(),
  }));
}
