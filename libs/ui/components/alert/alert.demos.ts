import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { AlertComponent } from "./alert.component";

const variantsCode = `<ui-alert variant="info" title="Info">An informational message.</ui-alert>
<ui-alert variant="success" title="Success">It worked.</ui-alert>
<ui-alert variant="warning" title="Warning">Careful now.</ui-alert>
<ui-alert variant="danger" title="Error">Something broke.</ui-alert>`;
@Component({
  standalone: true,
  imports: [AlertComponent],
  template: variantsCode,
})
class AlertVariantsDemoComponent {}

const dismissCode = `<ui-alert variant="info" [dismissible]="true">Dismiss me.</ui-alert>`;
@Component({
  standalone: true,
  imports: [AlertComponent],
  template: dismissCode,
})
class AlertDismissDemoComponent {}

export const alertDemos: Demo[] = [
  {
    title: "Variants",
    code: variantsCode,
    component: AlertVariantsDemoComponent,
  },
  {
    title: "Dismissible",
    code: dismissCode,
    component: AlertDismissDemoComponent,
  },
];
