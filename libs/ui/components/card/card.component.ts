import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from "@angular/core";

/** Elements whose bubbling events must NOT activate the card (A-20). */
const NESTED_CONTROL_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="slider"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

@Component({
  selector: "onyx-card",
  standalone: true,
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // A-19: an operable card must be announced as a control, not as an article.
    "[attr.role]": 'interactive() ? "button" : "article"',
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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
    if (!this.isInteractive() || this.originatesFromNestedControl(event)) {
      return;
    }
    this.clicked.emit(event);
  }

  protected handleKeyActivation(event: KeyboardEvent): void {
    if (!this.isInteractive() || this.originatesFromNestedControl(event)) {
      return;
    }
    event.preventDefault();
    this.clicked.emit(event);
  }

  /**
   * A-20: click/keydown events bubbling from interactive descendants
   * (buttons, links, form fields, ...) must not re-activate the card, and
   * their default behaviour must not be prevented.
   */
  private originatesFromNestedControl(event: Event): boolean {
    const hostEl = this.host.nativeElement;
    let node = event.target instanceof Element ? event.target : null;
    while (node && node !== hostEl) {
      if (node.matches(NESTED_CONTROL_SELECTOR)) return true;
      node = node.parentElement;
    }
    return false;
  }
}
