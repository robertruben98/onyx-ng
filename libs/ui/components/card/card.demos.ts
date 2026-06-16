import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { CardComponent } from "./card.component";

const basicCode = `<ui-card>
  <strong uiCardHeader>Project Atlas</strong>
  <p>A concise summary of the card body content goes here.</p>
  <span uiCardFooter>Updated 2 hours ago</span>
</ui-card>`;
@Component({
  standalone: true,
  imports: [CardComponent],
  template: basicCode,
})
class CardBasicDemoComponent {}

const variantsCode = `<ui-card variant="elevated">Elevated surface</ui-card>
<ui-card variant="outlined">Outlined surface</ui-card>`;
@Component({
  standalone: true,
  imports: [CardComponent],
  template: variantsCode,
})
class CardVariantsDemoComponent {}

export const cardDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: CardBasicDemoComponent },
  {
    title: "Variants",
    code: variantsCode,
    component: CardVariantsDemoComponent,
  },
];
