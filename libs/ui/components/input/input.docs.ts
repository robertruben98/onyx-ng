import { ComponentDoc } from "@onyx/ui/docs-model";
import { inputDemos } from "./input.demos";

export const inputDoc: ComponentDoc = {
  id: "input",
  title: "Input",
  description:
    "Text input implementing ControlValueAccessor, with label, prefix/suffix slots, a hint/error message region, and invalid and disabled states.",
  api: [
    {
      name: "type",
      type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'",
      default: "'text'",
      description: "Native input type.",
    },
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
      description: "Visible label, linked to the input.",
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
      name: "hint",
      type: "string",
      default: "''",
      description: "Hint text below the field, linked via aria-describedby.",
    },
    {
      name: "error",
      type: "string",
      default: "''",
      description:
        "Error text below the field; also forces the invalid state.",
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
    {
      name: "[slot=prefix]",
      type: "content",
      default: "-",
      description: "Content rendered before the input (e.g. an icon).",
    },
    {
      name: "[slot=suffix]",
      type: "content",
      default: "-",
      description: "Content rendered after the input (e.g. a unit).",
    },
  ],
  demos: inputDemos,
};
