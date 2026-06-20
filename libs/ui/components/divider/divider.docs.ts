import { ComponentDoc } from "@onyx/ui/docs-model";
import { dividerDemos } from "./divider.demos";

export const dividerDoc: ComponentDoc = {
  id: "divider",
  title: "Divider",
  description:
    "Visual separator with horizontal/vertical orientation and an optional centered label.",
  api: [
    {
      name: "orientation",
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: "Layout orientation.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Optional centered label (horizontal).",
    },
  ],
  demos: dividerDemos,
};
