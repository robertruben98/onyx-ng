import { ComponentDoc } from "@onyx/ui/docs-model";
import { switchDemos } from "./switch.demos";

export const switchDoc: ComponentDoc = {
  id: "switch",
  title: "Switch",
  description:
    "Boolean toggle with role=switch implementing ControlValueAccessor.",
  api: [
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label.",
    },
    {
      name: "invalid",
      type: "boolean",
      default: "false",
      description: "Reflected via aria-invalid.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled state.",
    },
    {
      name: "(checkedChange)",
      type: "boolean",
      default: "-",
      description: "Emitted on every change.",
    },
  ],
  demos: switchDemos,
};
