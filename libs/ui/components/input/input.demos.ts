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

const affixesCode = `<onyx-input label="Amount" type="number" placeholder="0.00">
  <span slot="prefix">$</span>
  <span slot="suffix">USD</span>
</onyx-input>`;
@Component({
  standalone: true,
  imports: [OnyxInputComponent],
  template: affixesCode,
})
class InputAffixesDemoComponent {}

const messagesCode = `<onyx-input label="Username" hint="3–20 characters." />
<onyx-input label="Email" type="email" error="Enter a valid email address." />`;
@Component({
  standalone: true,
  imports: [OnyxInputComponent],
  template: messagesCode,
})
class InputMessagesDemoComponent {}

export const inputDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: InputBasicDemoComponent },
  { title: "Sizes", code: sizesCode, component: InputSizesDemoComponent },
  {
    title: "Prefix & suffix",
    code: affixesCode,
    component: InputAffixesDemoComponent,
  },
  {
    title: "Hint & error",
    code: messagesCode,
    component: InputMessagesDemoComponent,
  },
  { title: "States", code: statesCode, component: InputStatesDemoComponent },
];
