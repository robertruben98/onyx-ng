import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { ButtonComponent } from "./button.component";

const variantsCode = `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="text">Text</ui-button>`;
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: variantsCode,
})
class ButtonVariantsDemoComponent {}

const statesCode = `<ui-button [disabled]="true">Disabled</ui-button>
<ui-button [loading]="true">Loading</ui-button>`;
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: statesCode,
})
class ButtonStatesDemoComponent {}

export const buttonDemos: Demo[] = [
  {
    title: "Variants",
    code: variantsCode,
    component: ButtonVariantsDemoComponent,
  },
  { title: "States", code: statesCode, component: ButtonStatesDemoComponent },
];
