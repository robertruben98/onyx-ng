import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxSliderComponent } from "./slider.component";

const defaultCode = `<onyx-slider label="Volume" [min]="0" [max]="100" [step]="5" />`;
@Component({
  standalone: true,
  imports: [OnyxSliderComponent],
  template: defaultCode,
})
class SliderDefaultDemoComponent {}

const disabledCode = `<onyx-slider label="Volume" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [OnyxSliderComponent],
  template: disabledCode,
})
class SliderDisabledDemoComponent {}

export const sliderDemos: Demo[] = [
  {
    title: "Default",
    code: defaultCode,
    component: SliderDefaultDemoComponent,
  },
  {
    title: "Disabled",
    code: disabledCode,
    component: SliderDisabledDemoComponent,
  },
];
