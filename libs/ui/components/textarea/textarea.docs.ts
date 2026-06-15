import { ComponentDoc } from "@onyx/ui/docs-model";
import { textareaDemos } from "./textarea.demos";

export const textareaDoc: ComponentDoc = {
  id: "textarea",
  title: "Textarea",
  description:
    "Multi-line text input implementing ControlValueAccessor, with rows, invalid and disabled states.",
  api: [
    {
      name: "rows",
      type: "number",
      default: "3",
      description: "Visible text rows.",
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
      name: "placeholder",
      type: "string",
      default: "''",
      description: "Placeholder text.",
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
      name: "(valueChange)",
      type: "string",
      default: "-",
      description: "Emitted on every value change.",
    },
  ],
  demos: textareaDemos,
};
