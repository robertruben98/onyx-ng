import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { BadgeComponent } from "./badge.component";

const variantsCode = `<ui-badge variant="neutral">Neutral</ui-badge>
<ui-badge variant="info">Info</ui-badge>
<ui-badge variant="success">Success</ui-badge>
<ui-badge variant="warning">Warning</ui-badge>
<ui-badge variant="danger">Danger</ui-badge>`;
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
