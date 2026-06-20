import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TagComponent } from "./tag.component";

const variantsCode = `<onyx-tag variant="neutral">Neutral</onyx-tag>
<onyx-tag variant="info">Info</onyx-tag>
<onyx-tag variant="success">Success</onyx-tag>
<onyx-tag variant="warning">Warning</onyx-tag>
<onyx-tag variant="danger">Danger</onyx-tag>`;
@Component({
  standalone: true,
  imports: [TagComponent],
  template: variantsCode,
})
class TagVariantsDemoComponent {}

const removableCode = `<onyx-tag variant="info" [removable]="true">Angular</onyx-tag>
<onyx-tag variant="success" [removable]="true">Signals</onyx-tag>`;
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
