import { ComponentDoc } from "@onyx/ui/docs-model";
import { menuDemos } from "./menu.demos";

export const menuDoc: ComponentDoc = {
  id: "menu",
  title: "Menu",
  description:
    "Dropdown action menu. Trigger button with aria-haspopup=menu; role=menu panel via the overlay primitive with focus moved onto items and arrow-key navigation.",
  api: [
    {
      name: "items",
      type: "MenuItem[]",
      default: "[]",
      description: "Menu items ({ id?, label, disabled? }).",
    },
    {
      name: "(itemSelect)",
      type: "MenuItem",
      default: "-",
      description: "Emitted with the chosen item on activation.",
    },
  ],
  demos: menuDemos,
};
