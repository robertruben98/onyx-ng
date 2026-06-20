import { ComponentDoc } from "@onyx/ui/docs-model";
import { progressBarDemos } from "./progress-bar.demos";

export const progressBarDoc: ComponentDoc = {
  id: "progress-bar",
  title: "Progress Bar",
  description:
    "Determinate or indeterminate progress indicator exposing role=progressbar with ARIA values.",
  api: [
    {
      name: "value",
      type: "number",
      default: "0",
      description: "Current value.",
    },
    {
      name: "max",
      type: "number",
      default: "100",
      description: "Maximum value.",
    },
    {
      name: "indeterminate",
      type: "boolean",
      default: "false",
      description: "Unknown-progress mode.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Accessible label.",
    },
  ],
  demos: progressBarDemos,
};
