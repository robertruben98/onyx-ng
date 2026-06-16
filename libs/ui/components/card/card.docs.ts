import { ComponentDoc } from "@onyx/ui/docs-model";
import { cardDemos } from "./card.demos";

export const cardDoc: ComponentDoc = {
  id: "card",
  title: "Card",
  description:
    "Surface container with optional header and footer slots, in elevated or outlined variants.",
  api: [
    {
      name: "variant",
      type: "'elevated' | 'outlined'",
      default: "'elevated'",
      description: "Visual variant.",
    },
  ],
  demos: cardDemos,
};
