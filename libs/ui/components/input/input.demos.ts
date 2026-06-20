import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxInputComponent } from "./input.component";

const basicCode = `<onyx-input label="Email" placeholder="you@example.com" type="email" />`;
@Component({ standalone: true, imports: [OnyxInputComponent], template: basicCode })
class InputBasicDemoComponent {}

const statesCode = `<onyx-input label="Invalid" [invalid]="true" />
<onyx-input label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [OnyxInputComponent],
  template: statesCode,
})
class InputStatesDemoComponent {}

const sizesCode = `<onyx-input size="sm" label="Small" placeholder="sm" />
<onyx-input size="md" label="Medium" placeholder="md" />
<onyx-input size="lg" label="Large" placeholder="lg" />`;
@Component({
  standalone: true,
  imports: [OnyxInputComponent],
  template: sizesCode,
})
class InputSizesDemoComponent {}

export const inputDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: InputBasicDemoComponent },
  { title: "Sizes", code: sizesCode, component: InputSizesDemoComponent },
  { title: "States", code: statesCode, component: InputStatesDemoComponent },
];
