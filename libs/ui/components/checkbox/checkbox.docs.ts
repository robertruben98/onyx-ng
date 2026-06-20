import { ComponentDoc } from "@onyx/ui/docs-model";
import { checkboxDemos } from "./checkbox.demos";

export const checkboxDoc: ComponentDoc = {
  id: "checkbox",
  title: "Checkbox",
  description:
    "Boolean checkbox implementing ControlValueAccessor, with indeterminate, invalid and disabled states.",
  api: [
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Control size.",
    },
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
      name: "indeterminate",
      type: "boolean",
      default: "false",
      description: "Tri-state visual dash.",
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
  demos: checkboxDemos,
};
