import { ComponentDoc } from "@onyx/ui/docs-model";
import { tooltipDemos } from "./tooltip.demos";

export const tooltipDoc: ComponentDoc = {
  id: "tooltip",
  title: "Tooltip",
  description:
    "Directive that shows a positioned tooltip on hover/focus, hides on leave/blur/Escape, and wires aria-describedby. Built on the overlay primitive.",
  api: [
    {
      name: "uiTooltip",
      type: "string",
      default: "(required)",
      description: "Tooltip text.",
    },
    {
      name: "uiTooltipPlacement",
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'top'",
      description: "Preferred placement.",
    },
  ],
  demos: tooltipDemos,
};
