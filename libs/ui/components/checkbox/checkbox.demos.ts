import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { CheckboxComponent } from "./checkbox.component";

const basicCode = `<onyx-checkbox label="Accept terms" />`;
@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: basicCode,
})
class CheckboxBasicDemoComponent {}

const statesCode = `<onyx-checkbox label="Indeterminate" [indeterminate]="true" />
<onyx-checkbox label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: statesCode,
})
class CheckboxStatesDemoComponent {}

export const checkboxDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: CheckboxBasicDemoComponent },
  { title: "States", code: statesCode, component: CheckboxStatesDemoComponent },
];
