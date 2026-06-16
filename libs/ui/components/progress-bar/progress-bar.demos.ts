import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { ProgressBarComponent } from "./progress-bar.component";

const determinateCode = `<ui-progress-bar [value]="25" label="Step 1 of 4" />
<ui-progress-bar [value]="70" label="Upload" />`;
@Component({
  standalone: true,
  imports: [ProgressBarComponent],
  template: determinateCode,
})
class ProgressDeterminateDemoComponent {}

const indeterminateCode = `<ui-progress-bar [indeterminate]="true" label="Loading" />`;
@Component({
  standalone: true,
  imports: [ProgressBarComponent],
  template: indeterminateCode,
})
class ProgressIndeterminateDemoComponent {}

export const progressBarDemos: Demo[] = [
  {
    title: "Determinate",
    code: determinateCode,
    component: ProgressDeterminateDemoComponent,
  },
  {
    title: "Indeterminate",
    code: indeterminateCode,
    component: ProgressIndeterminateDemoComponent,
  },
];
