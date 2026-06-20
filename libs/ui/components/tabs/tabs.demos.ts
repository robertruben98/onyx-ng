import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TabsComponent } from "./tabs.component";
import { TabComponent } from "./tab.component";

const basicCode = `<onyx-tabs ariaLabel="Account">
  <onyx-tab label="Profile">Your public profile details.</onyx-tab>
  <onyx-tab label="Security">Password and two-factor settings.</onyx-tab>
  <onyx-tab label="Billing" [disabled]="true">Upgrade to manage billing.</onyx-tab>
</onyx-tabs>`;
@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  template: basicCode,
})
class TabsBasicDemoComponent {}

export const tabsDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TabsBasicDemoComponent },
];
