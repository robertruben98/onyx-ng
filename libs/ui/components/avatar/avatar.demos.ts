import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { AvatarComponent } from "./avatar.component";

const initialsCode = `<ui-avatar name="Ada Lovelace" />
<ui-avatar name="Grace Hopper" />
<ui-avatar name="Alan Turing" shape="square" />`;
@Component({
  standalone: true,
  imports: [AvatarComponent],
  template: initialsCode,
})
class AvatarInitialsDemoComponent {}

const sizesCode = `<ui-avatar size="sm" name="Ada Lovelace" />
<ui-avatar size="md" name="Ada Lovelace" />
<ui-avatar size="lg" name="Ada Lovelace" />`;
@Component({
  standalone: true,
  imports: [AvatarComponent],
  template: sizesCode,
})
class AvatarSizesDemoComponent {}

export const avatarDemos: Demo[] = [
  {
    title: "Initials & shape",
    code: initialsCode,
    component: AvatarInitialsDemoComponent,
  },
  { title: "Sizes", code: sizesCode, component: AvatarSizesDemoComponent },
];
