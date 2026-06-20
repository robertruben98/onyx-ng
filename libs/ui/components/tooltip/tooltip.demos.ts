import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TooltipDirective } from "./tooltip.directive";

const basicCode = `<button type="button" onyxTooltip="Saves your changes">Save</button>
<button type="button" onyxTooltip="Discards the draft" onyxTooltipPlacement="bottom">Cancel</button>`;
@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: basicCode,
})
class TooltipBasicDemoComponent {}

export const tooltipDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TooltipBasicDemoComponent },
];
