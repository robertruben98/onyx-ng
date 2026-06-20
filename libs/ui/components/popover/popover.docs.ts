import { ComponentDoc } from "@onyx/ui/docs-model";
import { popoverDemos } from "./popover.demos";

export const popoverDoc: ComponentDoc = {
  id: "popover",
  title: "Popover",
  description:
    "Directive that toggles a focus-trapped dialog popover anchored to its trigger. Dismisses on outside click or Escape and restores focus. Built on the overlay primitive.",
  api: [
    {
      name: "onyxPopover",
      type: "TemplateRef",
      default: "(required)",
      description: "Content template rendered inside the popover.",
    },
    {
      name: "onyxPopoverPlacement",
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'bottom'",
      description: "Preferred placement.",
    },
    {
      name: "onyxPopoverLabel",
      type: "string",
      default: "''",
      description: "Accessible label for the popover dialog.",
    },
  ],
  demos: popoverDemos,
};
