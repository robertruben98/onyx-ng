import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type CardVariant = "elevated" | "outlined";

/**
 * Surface container with optional header/footer slots. Pure presentation —
 * project content via `[uiCardHeader]`, default slot, and `[uiCardFooter]`.
 */
@Component({
  selector: "ui-card",
  standalone: true,
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-card]": "true",
    "[class.ui-card--elevated]": "variant() === 'elevated'",
    "[class.ui-card--outlined]": "variant() === 'outlined'",
  },
})
export class CardComponent {
  /** Visual variant. */
  readonly variant = input<CardVariant>("elevated");
}
