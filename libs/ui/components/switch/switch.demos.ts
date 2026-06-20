import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { SwitchComponent } from "./switch.component";

const basicCode = `<onyx-switch label="Enable notifications" />`;
@Component({
  standalone: true,
  imports: [SwitchComponent],
  template: basicCode,
})
class SwitchBasicDemoComponent {}

const disabledCode = `<onyx-switch label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [SwitchComponent],
  template: disabledCode,
})
class SwitchDisabledDemoComponent {}

export const switchDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: SwitchBasicDemoComponent },
  {
    title: "Disabled",
    code: disabledCode,
    component: SwitchDisabledDemoComponent,
  },
];
