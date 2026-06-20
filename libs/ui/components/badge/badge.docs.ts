import { ComponentDoc } from "@onyx/ui/docs-model";
import { badgeDemos } from "./badge.demos";

export const badgeDoc: ComponentDoc = {
  id: "badge",
  title: "Badge",
  description:
    "Small status label with neutral, info, success, warning and danger variants.",
  api: [
    {
      name: "variant",
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: "Semantic variant.",
    },
  ],
  demos: badgeDemos,
};
