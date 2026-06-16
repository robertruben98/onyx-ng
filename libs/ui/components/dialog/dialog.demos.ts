import { Component, signal } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { ButtonComponent } from "../button";
import { DialogComponent } from "./dialog.component";

const basicCode = `<ui-button (clicked)="open.set(true)">Open dialog</ui-button>
<ui-dialog [(open)]="open" heading="Confirm action">
  <p>This action cannot be undone. Do you want to continue?</p>
  <div uiDialogFooter>
    <ui-button variant="secondary" (clicked)="open.set(false)">Cancel</ui-button>
    <ui-button (clicked)="open.set(false)">Confirm</ui-button>
  </div>
</ui-dialog>`;
@Component({
  standalone: true,
  imports: [DialogComponent, ButtonComponent],
  template: basicCode,
})
class DialogBasicDemoComponent {
  protected readonly open = signal(false);
}

const sizesCode = `<ui-button variant="secondary" (clicked)="open.set(true)">Open large dialog</ui-button>
<ui-dialog [(open)]="open" heading="Terms" size="lg">
  <p>A wider panel for long-form content.</p>
</ui-dialog>`;
@Component({
  standalone: true,
  imports: [DialogComponent, ButtonComponent],
  template: sizesCode,
})
class DialogSizesDemoComponent {
  protected readonly open = signal(false);
}

export const dialogDemos: Demo[] = [
  {
    title: "Basic",
    description: "Heading, body and a footer with actions.",
    code: basicCode,
    component: DialogBasicDemoComponent,
  },
  {
    title: "Sizes",
    description: "Panel width is token-driven via the size input.",
    code: sizesCode,
    component: DialogSizesDemoComponent,
  },
];
