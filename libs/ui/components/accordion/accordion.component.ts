import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  contentChildren,
  input,
} from "@angular/core";
import { ACCORDION_HOST, AccordionHost } from "./accordion-host";
import { OnyxAccordionItemComponent } from "./accordion-item.component";

/**
 * Vertical stack of collapsible sections. Single-open by default; set `multi`
 * to allow several open at once. Projects `ui-accordion-item` children.
 */
@Component({
  selector: "onyx-accordion",
  standalone: true,
  template: `<ng-content />`,
  styleUrl: "./accordion.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-accordion]": "true",
    "(keydown)": "onKeydown($event)",
  },
  providers: [{ provide: ACCORDION_HOST, useExisting: OnyxAccordionComponent }],
})
export class OnyxAccordionComponent implements AccordionHost {
  /** Allow multiple items to be expanded simultaneously. */
  readonly multi = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(OnyxAccordionItemComponent);

  toggleItem(item: OnyxAccordionItemComponent): void {
    const willExpand = !item.isExpanded();
    if (!this.multi() && willExpand) {
      this.items().forEach((i) => {
        if (i !== item) i.setExpanded(false);
      });
    }
    item.setExpanded(willExpand);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    if (!items.length) return;

    // Determine which item's trigger currently has focus
    const focused = items.findIndex(
      (item) => item.triggerEl().nativeElement === document.activeElement,
    );
    if (focused === -1) return;

    const last = items.length - 1;
    let target: number | null = null;

    switch (event.key) {
      case "ArrowDown":
        target = this.nextEnabled(focused, 1);
        break;
      case "ArrowUp":
        target = this.nextEnabled(focused, -1);
        break;
      case "Home":
        target = this.nextEnabled(-1, 1);
        break;
      case "End":
        target = this.nextEnabled(last + 1, -1);
        break;
      default:
        return;
    }

    if (target === null) return;
    event.preventDefault();
    items[target].triggerEl().nativeElement.focus();
  }

  /** First enabled index walking `step` from `from` (exclusive), wrapping. */
  private nextEnabled(from: number, step: number): number | null {
    const items = this.items();
    const n = items.length;
    if (!n) return null;
    for (let k = 1; k <= n; k++) {
      const i = (((from + step * k) % n) + n) % n;
      if (!items[i].disabled()) return i;
    }
    return null;
  }
}
