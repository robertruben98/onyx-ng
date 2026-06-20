import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { BadgeComponent } from "./badge.component";

const variantsCode = `<onyx-badge variant="neutral">Neutral</onyx-badge>
<onyx-badge variant="info">Info</onyx-badge>
<onyx-badge variant="success">Success</onyx-badge>
<onyx-badge variant="warning">Warning</onyx-badge>
<onyx-badge variant="danger">Danger</onyx-badge>`;
@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: variantsCode,
})
class BadgeVariantsDemoComponent {}

export const badgeDemos: Demo[] = [
  {
    title: "Variants",
    code: variantsCode,
    component: BadgeVariantsDemoComponent,
  },
];
