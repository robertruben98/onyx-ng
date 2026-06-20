import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxAlertComponent } from "./alert.component";

const variantsCode = `<onyx-alert variant="info" title="Info">An informational message.</onyx-alert>
<onyx-alert variant="success" title="Success">It worked.</onyx-alert>
<onyx-alert variant="warning" title="Warning">Careful now.</onyx-alert>
<onyx-alert variant="danger" title="Error">Something broke.</onyx-alert>`;
@Component({
  standalone: true,
  imports: [OnyxAlertComponent],
  template: variantsCode,
})
class AlertVariantsDemoComponent {}

const dismissCode = `<onyx-alert variant="info" [dismissible]="true">Dismiss me.</onyx-alert>`;
@Component({
  standalone: true,
  imports: [OnyxAlertComponent],
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
