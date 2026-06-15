import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { RadioGroupComponent, RadioOption } from "./radio-group.component";

const sizeOptions: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];
const basicCode = `<ui-radio-group label="Size" [options]="options" />`;
@Component({
  standalone: true,
  imports: [RadioGroupComponent],
  template: basicCode,
})
class RadioBasicDemoComponent {
  readonly options = sizeOptions;
}

export const radioGroupDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: RadioBasicDemoComponent },
];
