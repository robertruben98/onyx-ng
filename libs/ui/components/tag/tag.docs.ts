import { ComponentDoc } from "@onyx/ui/docs-model";
import { tagDemos } from "./tag.demos";

export const tagDoc: ComponentDoc = {
  id: "tag",
  title: "Tag",
  description:
    "Compact label / chip in semantic variants, optionally removable via a close button.",
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: "Visual variant (semantic role).",
    },
    {
      name: "removable",
      type: "boolean",
      default: "false",
      description: "Shows a remove button.",
    },
    {
      name: "removeLabel",
      type: "string",
      default: "'Remove'",
      description: "Accessible name for the remove button.",
    },
    {
      name: "(removed)",
      type: "void",
      default: "-",
      description: "Emitted when removed.",
    },
  ],
  demos: tagDemos,
};
