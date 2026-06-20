import { ComponentDoc } from "@onyx/ui/docs-model";
import { avatarDemos } from "./avatar.demos";

export const avatarDoc: ComponentDoc = {
  id: "avatar",
  title: "Avatar",
  description:
    "User avatar that shows an image or falls back to initials, in three sizes and circle/square shapes.",
  api: [
    {
      name: "src",
      type: "string",
      default: "''",
      description: "Image source URL.",
    },
    {
      name: "name",
      type: "string",
      default: "''",
      description: "Name for alt text and the initials fallback.",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Avatar size.",
    },
    {
      name: "shape",
      type: "'circle' | 'square'",
      default: "'circle'",
      description: "Avatar shape.",
    },
  ],
  demos: avatarDemos,
};
