import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxSwitchComponent } from "./switch.component";

const basicCode = `<onyx-switch label="Enable notifications" />`;
@Component({
  standalone: true,
  imports: [OnyxSwitchComponent],
  template: basicCode,
})
class SwitchBasicDemoComponent {}

const disabledCode = `<onyx-switch label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [OnyxSwitchComponent],
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
