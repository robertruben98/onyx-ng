import { ComponentDoc } from "@onyx/ui/docs-model";
import { skeletonDemos } from "./skeleton.demos";

export const skeletonDoc: ComponentDoc = {
  id: "skeleton",
  title: "Skeleton",
  description:
    "Shimmering loading placeholder in text, circle and rect shapes. Hidden from assistive technology (aria-hidden) and static under prefers-reduced-motion.",
  api: [
    {
      name: "variant",
      type: "'text' | 'circle' | 'rect'",
      default: "'text'",
      description:
        "Shape preset: text lines, circle (avatar) or rect (card / image).",
    },
    {
      name: "lines",
      type: "number",
      default: "1",
      description: "Number of shimmer lines. Only used by the text variant.",
    },
  ],
  demos: skeletonDemos,
};
