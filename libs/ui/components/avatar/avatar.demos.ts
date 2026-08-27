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

const statusCode = `<onyx-avatar name="Ada Lovelace" status="online" />
<onyx-avatar name="Grace Hopper" status="away" />
<onyx-avatar name="Alan Turing" status="busy" />
<onyx-avatar name="Katherine Johnson" status="offline" />`;
@Component({
  standalone: true,
  imports: [OnyxAvatarComponent],
  template: statusCode,
})
class AvatarStatusDemoComponent {}

export const avatarDemos: Demo[] = [
  {
    title: "Initials & shape",
    code: initialsCode,
    component: AvatarInitialsDemoComponent,
  },
  { title: "Sizes", code: sizesCode, component: AvatarSizesDemoComponent },
  { title: "Status", code: statusCode, component: AvatarStatusDemoComponent },
];
