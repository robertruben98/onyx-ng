import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxMenuComponent, MenuItem } from "./menu.component";

const basicCode = `<onyx-menu [items]="items" (itemSelect)="onSelect($event)">
  Actions
</onyx-menu>`;
@Component({
  standalone: true,
  imports: [OnyxMenuComponent],
  template: basicCode,
})
class MenuBasicDemoComponent {
  protected readonly items: MenuItem[] = [
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "archive", label: "Archive" },
    { id: "delete", label: "Delete", disabled: true },
  ];
  protected onSelect(item: MenuItem): void {
    void item;
  }
}

export const menuDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: MenuBasicDemoComponent },
];
