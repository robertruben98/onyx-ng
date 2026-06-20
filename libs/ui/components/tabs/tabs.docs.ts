import { ComponentDoc } from "@onyx/ui/docs-model";
import { tabsDemos } from "./tabs.demos";

export const tabsDoc: ComponentDoc = {
  id: "tabs",
  title: "Tabs",
  description:
    "Tabbed interface with role=tablist/tab/tabpanel, roving tabindex and full arrow-key navigation. Declare panels with ui-tab.",
  api: [
    {
      name: "selectedIndex",
      type: "number",
      default: "0",
      description:
        "Selected tab index. Two-way bindable via [(selectedIndex)].",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible label for the tab list.",
    },
    {
      name: "ui-tab label",
      type: "string",
      default: "(required)",
      description: "Trigger label of a tab.",
    },
    {
      name: "ui-tab disabled",
      type: "boolean",
      default: "false",
      description: "Disables a tab.",
    },
  ],
  demos: tabsDemos,
};
