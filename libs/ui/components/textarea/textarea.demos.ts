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

export const textareaDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TextareaBasicDemoComponent },
];
