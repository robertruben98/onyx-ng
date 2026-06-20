import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { AccordionComponent } from "./accordion.component";
import { AccordionItemComponent } from "./accordion-item.component";

const basicCode = `<onyx-accordion>
  <onyx-accordion-item heading="Shipping">Free over $50, 2–4 business days.</onyx-accordion-item>
  <onyx-accordion-item heading="Returns">30-day window, original packaging.</onyx-accordion-item>
  <onyx-accordion-item heading="Warranty">Two years against defects.</onyx-accordion-item>
</onyx-accordion>`;
@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  template: basicCode,
})
class AccordionBasicDemoComponent {}

const multiCode = `<onyx-accordion [multi]="true">
  <onyx-accordion-item heading="Section A">Open several at once.</onyx-accordion-item>
  <onyx-accordion-item heading="Section B">Multi mode is enabled.</onyx-accordion-item>
</onyx-accordion>`;
@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  template: multiCode,
})
class AccordionMultiDemoComponent {}

export const accordionDemos: Demo[] = [
  {
    title: "Single",
    code: basicCode,
    component: AccordionBasicDemoComponent,
  },
  {
    title: "Multiple",
    code: multiCode,
    component: AccordionMultiDemoComponent,
  },
];
