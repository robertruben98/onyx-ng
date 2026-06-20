import { ComponentDoc } from "@onyx/ui/docs-model";
import { gridDemos } from "./grid.demos";

export const gridDoc: ComponentDoc = {
  id: "grid",
  title: "Grid",
  description:
    "CSS Grid layout primitive with token-backed gaps, container-responsive column counts, and semantic-element span helpers.",
  api: [
    {
      name: "columns",
      type: "1 | 2 | ... | 12",
      default: "1",
      description: "Column count at the base breakpoint.",
    },
    {
      name: "columnsSm / columnsMd / columnsLg",
      type: "1 | 2 | ... | 12",
      default: "-",
      description:
        "Optional column overrides at 30rem, 48rem, and 64rem container widths.",
    },
    {
      name: "gap",
      type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: "Semantic spacing token used between rows and columns.",
    },
    {
      name: "dense",
      type: "boolean",
      default: "false",
      description:
        "Fills grid holes; use only when visual reordering preserves a clear reading order.",
    },
    {
      name: "onyxGridItem: span",
      type: "1 | 2 | ... | 12 | 'full'",
      default: "1",
      description: "Base column span for an element carrying onyxGridItem.",
    },
    {
      name: "onyxGridItem: spanSm / spanMd / spanLg",
      type: "1 | 2 | ... | 12 | 'full'",
      default: "-",
      description: "Optional responsive span overrides.",
    },
  ],
  demos: gridDemos,
};
