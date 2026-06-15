import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { CheckboxComponent } from "./checkbox.component";

const basicCode = `<ui-checkbox label="Accept terms" />`;
@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: basicCode,
})
class CheckboxBasicDemo {}

const statesCode = `<ui-checkbox label="Indeterminate" [indeterminate]="true" />
<ui-checkbox label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: statesCode,
})
class CheckboxStatesDemo {}

export const checkboxDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: CheckboxBasicDemo },
  { title: "States", code: statesCode, component: CheckboxStatesDemo },
];
