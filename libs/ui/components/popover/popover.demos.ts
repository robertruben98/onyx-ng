import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxPopoverDirective } from "./popover.directive";

const basicCode = `<button type="button" [onyxPopover]="menu" onyxPopoverLabel="Quick actions">
  Actions
</button>
<ng-template #menu>
  <p>Choose an action for this item.</p>
  <button type="button">Rename</button>
  <button type="button">Delete</button>
</ng-template>`;
@Component({
  standalone: true,
  imports: [OnyxPopoverDirective],
  template: basicCode,
})
class PopoverBasicDemoComponent {}

export const popoverDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: PopoverBasicDemoComponent },
];
