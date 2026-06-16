import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { SpinnerComponent } from "./spinner.component";

const sizesCode = `<ui-spinner size="sm" />
<ui-spinner size="md" />
<ui-spinner size="lg" />`;
@Component({
  standalone: true,
  imports: [SpinnerComponent],
  template: sizesCode,
})
class SpinnerSizesDemoComponent {}

export const spinnerDemos: Demo[] = [
  { title: "Sizes", code: sizesCode, component: SpinnerSizesDemoComponent },
];
