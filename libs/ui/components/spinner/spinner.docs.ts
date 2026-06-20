import { ComponentDoc } from "@onyx/ui/docs-model";
import { spinnerDemos } from "./spinner.demos";

export const spinnerDoc: ComponentDoc = {
  id: "spinner",
  title: "Spinner",
  description:
    "Indeterminate loading indicator with an accessible status label, in three sizes.",
  api: [
    {
      name: "size",
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Spinner size.",
    },
    {
      name: "label",
      type: "string",
      default: "'Loading'",
      description: "Accessible status label.",
    },
  ],
  demos: spinnerDemos,
};
