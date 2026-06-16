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

const sizesCode = `<ui-button size="sm">Small</ui-button>
<ui-button size="md">Medium</ui-button>
<ui-button size="lg">Large</ui-button>`;
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: sizesCode,
})
class ButtonSizesDemoComponent {}

const statesCode = `<ui-button [disabled]="true">Disabled</ui-button>
<ui-button [loading]="true">Loading</ui-button>
<ui-button variant="secondary" [disabled]="true">Disabled</ui-button>
<ui-button variant="secondary" [loading]="true">Loading</ui-button>`;
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: statesCode,
})
class ButtonStatesDemoComponent {}

export const buttonDemos: Demo[] = [
  {
    title: "Variants",
    description: "Primary, secondary and text styles.",
    code: variantsCode,
    component: ButtonVariantsDemoComponent,
  },
  {
    title: "Sizes",
    description: "Small, medium (default) and large.",
    code: sizesCode,
    component: ButtonSizesDemoComponent,
  },
  {
    title: "States",
    description: "Disabled and loading do not emit clicks.",
    code: statesCode,
    component: ButtonStatesDemoComponent,
  },
];
