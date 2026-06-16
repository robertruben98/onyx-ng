import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { DividerComponent } from "./divider.component";

const basicCode = `<p>Above</p>
<ui-divider />
<p>Below</p>`;
@Component({
  standalone: true,
  imports: [DividerComponent],
  template: basicCode,
})
class DividerBasicDemoComponent {}

const labelCode = `<ui-divider label="OR" />`;
@Component({
  standalone: true,
  imports: [DividerComponent],
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
