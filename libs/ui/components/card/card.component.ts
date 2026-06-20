import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from "@angular/core";

@Component({
  selector: "onyx-card",
  standalone: true,
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "article",
    "[class.ui-card]": "true",
    "[class.ui-card--interactive]": "interactive()",
    "[class.ui-card--disabled]": "disabled()",
    // Only focusable when interactive and not disabled.
    "[attr.tabindex]": "isInteractive() ? 0 : null",
    "[attr.aria-disabled]": 'interactive() && disabled() ? "true" : null',
    "(click)": "handleClick($event)",
    "(keydown.enter)": "handleKeyActivation($event)",
    "(keydown.space)": "handleKeyActivation($event)",
  },
})
export class OnyxCardComponent {
  /** When true the card is clickable and receives focus. */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Suppresses interaction when combined with `interactive`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on pointer-click or keyboard activation when interactive. */
  readonly clicked = output<MouseEvent | KeyboardEvent>();

  /** True only when interactive and not disabled. */
  protected readonly isInteractive = computed(
    () => this.interactive() && !this.disabled(),
  );

  protected handleClick(event: MouseEvent): void {
    if (!this.isInteractive()) return;
    this.clicked.emit(event);
  }

  protected handleKeyActivation(event: KeyboardEvent): void {
    if (!this.isInteractive()) return;
    event.preventDefault();
    this.clicked.emit(event);
  }
}
