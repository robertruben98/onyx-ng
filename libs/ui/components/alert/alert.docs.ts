import { ComponentDoc } from "@onyx/ui/docs-model";
import { alertDemos } from "./alert.demos";

export const alertDoc: ComponentDoc = {
  id: "alert",
  title: "Alert",
  description:
    "Inline feedback banner with semantic variants, optional title, and a dismiss action.",
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'info'",
      description: "Semantic variant.",
    },
    {
      name: "title",
      type: "string",
      default: "''",
      description: "Optional bold title.",
    },
    {
      name: "dismissible",
      type: "boolean",
      default: "false",
      description: "Shows a dismiss button.",
    },
    {
      name: "dismissLabel",
      type: "string",
      default: "'Dismiss'",
      description: "Accessible name for the dismiss button.",
    },
    {
      name: "(dismissed)",
      type: "void",
      default: "-",
      description: "Emitted when dismissed.",
    },
  ],
  demos: alertDemos,
};
