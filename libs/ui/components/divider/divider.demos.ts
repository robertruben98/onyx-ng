import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxDividerComponent } from "./divider.component";

const basicCode = `<p>Above</p>
<onyx-divider />
<p>Below</p>`;
@Component({
  standalone: true,
  imports: [OnyxDividerComponent],
  template: basicCode,
})
class DividerBasicDemoComponent {}

const labelCode = `<onyx-divider label="OR" />`;
@Component({
  standalone: true,
  imports: [OnyxDividerComponent],
  template: labelCode,
})
class DividerLabelDemoComponent {}

export const dividerDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: DividerBasicDemoComponent },
  {
    title: "With label",
    code: labelCode,
    component: DividerLabelDemoComponent,
  },
];
