import { ComponentDoc } from "@onyx/ui/docs-model";
import { buttonDemos } from "./button.demos";

export const buttonDoc: ComponentDoc = {
  id: "button",
  title: "Button",
  description:
    "Action trigger with primary, secondary and text variants, plus disabled and loading states.",
  api: [
    {
      name: "variant",
      type: "'primary' | 'secondary' | 'text'",
      default: "'primary'",
      description: "Visual variant.",
    },
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Control size.",
    },
    {
      name: "type",
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: "Native button type.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disabled; never emits clicked.",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description: "Shows spinner; suppresses interaction.",
    },
    {
      name: "(clicked)",
      type: "MouseEvent",
      default: "-",
      description: "Emitted on activation when interactive.",
    },
  ],
  demos: buttonDemos,
};
