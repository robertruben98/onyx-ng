import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { InputComponent } from "./input.component";

const basicCode = `<ui-input label="Email" placeholder="you@example.com" type="email" />`;
@Component({ standalone: true, imports: [InputComponent], template: basicCode })
class InputBasicDemoComponent {}

const statesCode = `<ui-input label="Invalid" [invalid]="true" />
<ui-input label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [InputComponent],
  template: statesCode,
})
class InputStatesDemoComponent {}

export const inputDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: InputBasicDemoComponent },
  { title: "States", code: statesCode, component: InputStatesDemoComponent },
];
