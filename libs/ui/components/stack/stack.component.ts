import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from "@angular/core";

export type StackDirection =
  | "row"
  | "column"
  | "row-reverse"
  | "column-reverse";
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

@Component({
  selector: "onyx-stack",
  standalone: true,
  templateUrl: "./stack.component.html",
  styleUrl: "./stack.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-stack]": "true",
    "[attr.data-direction]": "direction()",
    "[attr.data-gap]": "gap()",
    "[attr.data-align]": "align()",
    "[attr.data-justify]": "justify()",
    "[attr.data-wrap]": 'wrap() ? "true" : null',
  },
})
export class OnyxStackComponent {
  /** Main-axis direction. Reverse values change visual order, not DOM order. */
  readonly direction = input<StackDirection>("column");

  /** Token-backed distance between children. */
  readonly gap = input<StackGap>("md");

  /** Cross-axis alignment. */
  readonly align = input<StackAlign>("stretch");

  /** Main-axis distribution. */
  readonly justify = input<StackJustify>("start");

  /** Allows children to flow onto additional lines. */
  readonly wrap = input(false, { transform: booleanAttribute });
}
