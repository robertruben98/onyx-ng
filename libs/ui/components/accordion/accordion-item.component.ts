import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { ACCORDION_HOST } from "./accordion-host";

let nextItemId = 0;

/**
 * A single collapsible section. Renders a header button (`aria-expanded` +
 * `aria-controls`) and a `role=region` panel. Coordinated by `ui-accordion`.
 */
@Component({
  selector: "onyx-accordion-item",
  standalone: true,
  templateUrl: "./accordion-item.component.html",
  styleUrl: "./accordion-item.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-accordion-item]": "true",
    "[class.ui-accordion-item--expanded]": "expanded()",
  },
})
export class OnyxAccordionItemComponent {
  private readonly host = inject(ACCORDION_HOST, { optional: true });

  /** Header text. */
  readonly heading = input.required<string>();
  /** Whether the item is disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Expanded state (managed by the parent accordion). */
  protected readonly expanded = signal(false);

  private readonly uid = nextItemId++;
  readonly headerId = `ui-accordion-header-${this.uid}`;
  readonly panelId = `ui-accordion-panel-${this.uid}`;

  /** Exposes the trigger button element for keyboard focus management. */
  readonly triggerEl =
    viewChild.required<ElementRef<HTMLButtonElement>>("trigger");

  /** Called by the parent accordion to set expanded state. */
  setExpanded(v: boolean): void {
    this.expanded.set(v);
  }

  /** Returns the current expanded state (read-only for the parent). */
  isExpanded(): boolean {
    return this.expanded();
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.host?.toggleItem(this);
  }
}
