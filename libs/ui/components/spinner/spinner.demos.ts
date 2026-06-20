import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxSpinnerComponent } from "./spinner.component";

const sizesCode = `<onyx-spinner size="sm" />
<onyx-spinner size="md" />
<onyx-spinner size="lg" />`;
@Component({
  standalone: true,
  imports: [OnyxSpinnerComponent],
  template: sizesCode,
})
class SpinnerSizesDemoComponent {}

export const spinnerDemos: Demo[] = [
  { title: "Sizes", code: sizesCode, component: SpinnerSizesDemoComponent },
];
