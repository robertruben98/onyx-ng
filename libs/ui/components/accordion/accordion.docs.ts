import { ComponentDoc } from "@onyx/ui/docs-model";
import { accordionDemos } from "./accordion.demos";

export const accordionDoc: ComponentDoc = {
  id: "accordion",
  title: "Accordion",
  description:
    "Stack of collapsible sections with header buttons (aria-expanded) and region panels. Single-open by default or multi.",
  api: [
    {
      name: "multi",
      type: "boolean",
      default: "false",
      description: "Allow multiple items expanded at once.",
    },
    {
      name: "ui-accordion-item heading",
      type: "string",
      default: "(required)",
      description: "Header text of a section.",
    },
    {
      name: "ui-accordion-item disabled",
      type: "boolean",
      default: "false",
      description: "Disables a section.",
    },
  ],
  demos: accordionDemos,
};
