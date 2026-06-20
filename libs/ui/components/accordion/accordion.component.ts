import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  contentChildren,
  input,
} from "@angular/core";
import { ACCORDION_HOST, AccordionHost } from "./accordion-host";
import { AccordionItemComponent } from "./accordion-item.component";

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
  host: { "[class.ui-accordion]": "true" },
  providers: [{ provide: ACCORDION_HOST, useExisting: AccordionComponent }],
})
export class AccordionComponent implements AccordionHost {
  /** Allow multiple items to be expanded simultaneously. */
  readonly multi = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(AccordionItemComponent);

  toggleItem(item: AccordionItemComponent): void {
    const willExpand = !item.expanded();
    if (!this.multi() && willExpand) {
      this.items().forEach((i) => {
        if (i !== item) i.expanded.set(false);
      });
    }
    item.expanded.set(willExpand);
  }
}
