import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { TextareaComponent } from "./textarea.component";

const basicCode = `<ui-textarea label="Bio" placeholder="Tell us about yourself…" [rows]="3" />`;
@Component({
  standalone: true,
  imports: [TextareaComponent],
  template: basicCode,
})
class TextareaBasicDemoComponent {}

export const textareaDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: TextareaBasicDemoComponent },
];
