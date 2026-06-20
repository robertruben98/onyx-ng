import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxButtonComponent } from "../button";
import { OnyxStackComponent } from "./stack.component";

const directionCode = `<onyx-stack direction="row" gap="sm" align="center">
  <onyx-button>Save</onyx-button>
  <onyx-button variant="secondary">Preview</onyx-button>
  <onyx-button variant="text">Cancel</onyx-button>
</onyx-stack>`;
@Component({
  standalone: true,
  imports: [OnyxButtonComponent, OnyxStackComponent],
  template: directionCode,
})
class StackDirectionDemoComponent {}

const wrappingCode = `<onyx-stack
  direction="row"
  gap="md"
  align="center"
  justify="space-between"
  wrap
>
  <onyx-button>Alpha</onyx-button>
  <onyx-button>Beta</onyx-button>
  <onyx-button>Gamma</onyx-button>
  <onyx-button>Delta</onyx-button>
</onyx-stack>`;
@Component({
  standalone: true,
  imports: [OnyxButtonComponent, OnyxStackComponent],
  template: wrappingCode,
})
class StackWrappingDemoComponent {}

export const stackDemos: Demo[] = [
  {
    title: "Direction and gap",
    description: "Arrange controls on either axis using token-backed spacing.",
    code: directionCode,
    component: StackDirectionDemoComponent,
  },
  {
    title: "Wrapping and alignment",
    description:
      "Wrap crowded rows while controlling cross-axis alignment and distribution.",
    code: wrappingCode,
    component: StackWrappingDemoComponent,
  },
];
