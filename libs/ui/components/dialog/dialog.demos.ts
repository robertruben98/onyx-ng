import { Component, signal } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { DialogComponent } from "./dialog.component";

const basicCode = `<button type="button" (click)="open.set(true)">Open dialog</button>
<ui-dialog [(open)]="open" heading="Confirm action">
  <p>This action cannot be undone. Do you want to continue?</p>
  <div uiDialogFooter>
    <button type="button" (click)="open.set(false)">Cancel</button>
    <button type="button" (click)="open.set(false)">Confirm</button>
  </div>
</ui-dialog>`;
@Component({
  standalone: true,
  imports: [DialogComponent],
  template: basicCode,
})
class DialogBasicDemoComponent {
  protected readonly open = signal(false);
}

const sizesCode = `<button type="button" (click)="open.set(true)">Open large dialog</button>
<ui-dialog [(open)]="open" heading="Terms" size="lg">
  <p>A wider panel for long-form content.</p>
</ui-dialog>`;
@Component({
  standalone: true,
  imports: [DialogComponent],
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
