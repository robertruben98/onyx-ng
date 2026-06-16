import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TabsComponent } from "./tabs.component";
import { TabComponent } from "./tab.component";

const basicCode = `<ui-tabs ariaLabel="Account">
  <ui-tab label="Profile">Your public profile details.</ui-tab>
  <ui-tab label="Security">Password and two-factor settings.</ui-tab>
  <ui-tab label="Billing" [disabled]="true">Upgrade to manage billing.</ui-tab>
</ui-tabs>`;
@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  template: basicCode,
})
class TabsBasicDemoComponent {}

export const tabsDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TabsBasicDemoComponent },
];
