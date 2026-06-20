import { ComponentDoc } from "@onyx/ui/docs-model";
import { dialogDemos } from "./dialog.demos";

export const dialogDoc: ComponentDoc = {
  id: "dialog",
  title: "Dialog",
  description:
    "Modal dialog built on the overlay primitive (CDK). Traps focus, restores it on close, closes on Esc or backdrop click, and exposes role=dialog with aria-modal.",
  api: [
    {
      name: "open",
      type: "boolean",
      default: "false",
      description: "Open state. Two-way bindable via [(open)].",
    },
    {
      name: "heading",
      type: "string",
      default: "''",
      description: "Title text; labels the dialog via aria-labelledby.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name used when no heading is provided.",
    },
    {
      name: "closeLabel",
      type: "string",
      default: "'Close'",
      description: "Accessible name for the close button.",
    },
    {
      name: "closeOnEsc",
      type: "boolean",
      default: "true",
      description: "Whether pressing Esc closes the dialog.",
    },
    {
      name: "closeOnBackdrop",
      type: "boolean",
      default: "true",
      description: "Whether clicking the backdrop closes the dialog.",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Panel size.",
    },
    {
      name: "(opened)",
      type: "void",
      default: "-",
      description: "Emitted after the dialog is attached.",
    },
    {
      name: "(closed)",
      type: "void",
      default: "-",
      description: "Emitted after the dialog is detached.",
    },
  ],
  demos: dialogDemos,
};
