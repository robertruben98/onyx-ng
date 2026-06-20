import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxButtonComponent } from "./button.component";

const variantsCode = `<onyx-button variant="primary">Primary</onyx-button>
<onyx-button variant="secondary">Secondary</onyx-button>
<onyx-button variant="text">Text</onyx-button>`;
@Component({
  standalone: true,
  imports: [OnyxButtonComponent],
  template: variantsCode,
})
class ButtonVariantsDemoComponent {}

const sizesCode = `<onyx-button size="sm">Small</onyx-button>
<onyx-button size="md">Medium</onyx-button>
<onyx-button size="lg">Large</onyx-button>`;
@Component({
  standalone: true,
  imports: [OnyxButtonComponent],
  template: sizesCode,
})
class ButtonSizesDemoComponent {}

const statesCode = `<onyx-button [disabled]="true">Disabled</onyx-button>
<onyx-button [loading]="true">Loading</onyx-button>
<onyx-button variant="secondary" [disabled]="true">Disabled</onyx-button>
<onyx-button variant="secondary" [loading]="true">Loading</onyx-button>`;
@Component({
  standalone: true,
  imports: [OnyxButtonComponent],
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
