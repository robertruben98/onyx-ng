import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { AccordionComponent } from "./accordion.component";
import { AccordionItemComponent } from "./accordion-item.component";

const basicCode = `<ui-accordion>
  <ui-accordion-item heading="Shipping">Free over $50, 2–4 business days.</ui-accordion-item>
  <ui-accordion-item heading="Returns">30-day window, original packaging.</ui-accordion-item>
  <ui-accordion-item heading="Warranty">Two years against defects.</ui-accordion-item>
</ui-accordion>`;
@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  template: basicCode,
})
class AccordionBasicDemoComponent {}

const multiCode = `<ui-accordion [multi]="true">
  <ui-accordion-item heading="Section A">Open several at once.</ui-accordion-item>
  <ui-accordion-item heading="Section B">Multi mode is enabled.</ui-accordion-item>
</ui-accordion>`;
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
