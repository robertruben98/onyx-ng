import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxTextareaComponent } from "./textarea.component";

const basicCode = `<onyx-textarea label="Bio" placeholder="Tell us about yourself…" [rows]="3" />`;
@Component({
  standalone: true,
  imports: [OnyxTextareaComponent],
  template: basicCode,
})
class TextareaBasicDemoComponent {}

const counterCode = `<onyx-textarea
  label="Message"
  placeholder="Max 120 characters"
  [maxLength]="120"
/>`;
@Component({
  standalone: true,
  imports: [OnyxTextareaComponent],
  template: counterCode,
})
class TextareaCounterDemoComponent {}

const statesCode = `<onyx-textarea label="Invalid" [invalid]="true" />
<onyx-textarea label="Disabled" [disabled]="true" />`;
@Component({
  standalone: true,
  imports: [OnyxTextareaComponent],
  template: statesCode,
})
class TextareaStatesDemoComponent {}

export const textareaDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TextareaBasicDemoComponent },
  {
    title: "Character counter",
    code: counterCode,
    component: TextareaCounterDemoComponent,
  },
  { title: "States", code: statesCode, component: TextareaStatesDemoComponent },
];
