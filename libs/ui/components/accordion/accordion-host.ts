import { InjectionToken } from "@angular/core";
import type { OnyxAccordionItemComponent } from "./accordion-item.component";

/** Contract a parent accordion exposes to its items (avoids a circular import). */
export interface AccordionHost {
  toggleItem(item: OnyxAccordionItemComponent): void;
}

export const ACCORDION_HOST = new InjectionToken<AccordionHost>(
  "ACCORDION_HOST",
);
