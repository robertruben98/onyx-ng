import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TagComponent } from "./tag.component";

const variantsCode = `<ui-tag variant="neutral">Neutral</ui-tag>
<ui-tag variant="info">Info</ui-tag>
<ui-tag variant="success">Success</ui-tag>
<ui-tag variant="warning">Warning</ui-tag>
<ui-tag variant="danger">Danger</ui-tag>`;
@Component({
  standalone: true,
  imports: [TagComponent],
  template: variantsCode,
})
class TagVariantsDemoComponent {}

const removableCode = `<ui-tag variant="info" [removable]="true">Angular</ui-tag>
<ui-tag variant="success" [removable]="true">Signals</ui-tag>`;
@Component({
  standalone: true,
  imports: [TagComponent],
  template: removableCode,
})
class TagRemovableDemoComponent {}

export const tagDemos: Demo[] = [
  {
    title: "Variants",
    code: variantsCode,
    component: TagVariantsDemoComponent,
  },
  {
    title: "Removable",
    code: removableCode,
    component: TagRemovableDemoComponent,
  },
];
