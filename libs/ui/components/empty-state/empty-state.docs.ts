import { ComponentDoc } from "@onyx/ui/docs-model";
import { emptyStateDemos } from "./empty-state.demos";

export const emptyStateDoc: ComponentDoc = {
  id: "empty-state",
  title: "EmptyState",
  description:
    "Responsive placeholder for empty or zero-data views with decorative visuals, structured copy, and optional primary and secondary actions.",
  api: [
    {
      name: "role",
      type: "'region' | 'status'",
      default: "'region'",
      description:
        "Host role. Use status when a dynamically rendered empty state should be announced.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description:
        "Accessible name that overrides labelling by the projected title.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables both actions and marks the host aria-disabled.",
    },
    {
      name: "(primaryAction)",
      type: "MouseEvent",
      default: "-",
      description: "Emitted when the primary action is activated.",
    },
    {
      name: "(secondaryAction)",
      type: "MouseEvent",
      default: "-",
      description: "Emitted when the secondary action is activated.",
    },
    {
      name: "Slots",
      type: "icon | illustration | title | description | primary-action | secondary-action",
      default: "-",
      description:
        "Projected visual, copy, and action-label content. Title is required unless ariaLabel is provided.",
    },
  ],
  demos: emptyStateDemos,
};
