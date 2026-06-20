import { ComponentDoc } from "@onyx/ui/docs-model";
import { selectDemos } from "./select.demos";

export const selectDoc: ComponentDoc = {
  id: "select",
  title: "Select",
  description:
    "Single-select dropdown implementing ControlValueAccessor. Combobox trigger and listbox panel (overlay primitive) with full keyboard support and aria-activedescendant.",
  api: [
    {
      name: "options",
      type: "SelectOption[]",
      default: "[]",
      description: "Options ({ value, label, disabled? }).",
    },
    {
      name: "placeholder",
      type: "string",
      default: "'Select…'",
      description: "Shown when nothing is selected.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables the control (also via forms).",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name (falls back to the placeholder).",
    },
  ],
  demos: selectDemos,
};
