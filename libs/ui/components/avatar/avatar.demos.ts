import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxAvatarComponent } from "./avatar.component";

const initialsCode = `<onyx-avatar name="Ada Lovelace" />
<onyx-avatar name="Grace Hopper" />
<onyx-avatar name="Alan Turing" shape="square" />`;
@Component({
  standalone: true,
  imports: [OnyxAvatarComponent],
  template: initialsCode,
})
class AvatarInitialsDemoComponent {}

const sizesCode = `<onyx-avatar size="sm" name="Ada Lovelace" />
<onyx-avatar size="md" name="Ada Lovelace" />
<onyx-avatar size="lg" name="Ada Lovelace" />`;
@Component({
  standalone: true,
  imports: [OnyxAvatarComponent],
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
