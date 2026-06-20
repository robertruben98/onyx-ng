import { ComponentDoc } from "@onyx/ui/docs-model";
import { stackDemos } from "./stack.demos";

export const stackDoc: ComponentDoc = {
  id: "stack",
  title: "Stack",
  description:
    "Token-spaced flex layout for arranging projected content without adding interaction or semantics.",
  api: [
    {
      name: "direction",
      type: "'row' | 'column' | 'row-reverse' | 'column-reverse'",
      default: "'column'",
      description:
        "Main-axis direction. Reverse values do not change DOM or keyboard order.",
    },
    {
      name: "gap",
      type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: "Token-backed distance between children.",
    },
    {
      name: "align",
      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
      default: "'stretch'",
      description: "Cross-axis alignment.",
    },
    {
      name: "justify",
      type: "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'",
      default: "'start'",
      description: "Main-axis distribution.",
    },
    {
      name: "wrap",
      type: "boolean",
      default: "false",
      description: "Allows children to flow onto additional lines.",
    },
  ],
  demos: stackDemos,
};
