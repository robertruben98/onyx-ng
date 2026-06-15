import { ComponentDoc } from "@onyx/ui/docs-model";
import { radioGroupDemos } from "./radio-group.demos";

export const radioGroupDoc: ComponentDoc = {
  id: "radio-group",
  title: "RadioGroup",
  description:
    "Single-choice group of native radios with roving focus, implementing ControlValueAccessor.",
  api: [
    {
      name: "options",
      type: "RadioOption[]",
      default: "(required)",
      description: "Options: { label, value, disabled? }.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible group label (legend).",
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
      description: "Disables the whole group.",
    },
    {
      name: "(valueChange)",
      type: "string",
      default: "-",
      description: "Emitted on selection change.",
    },
  ],
  demos: radioGroupDemos,
};
