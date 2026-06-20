import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxCardComponent } from "./card.component";

const basicCode = `<onyx-card>
  <strong uiCardHeader>Project Atlas</strong>
  <p>A concise summary of the card body content goes here.</p>
  <span uiCardFooter>Updated 2 hours ago</span>
</onyx-card>`;
@Component({
  standalone: true,
  imports: [OnyxCardComponent],
  template: basicCode,
})
class CardBasicDemoComponent {}

const variantsCode = `<onyx-card variant="elevated">Elevated surface</onyx-card>
<onyx-card variant="outlined">Outlined surface</onyx-card>`;
@Component({
  standalone: true,
  imports: [OnyxCardComponent],
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
