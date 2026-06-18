import { COMPONENT_DOCS } from "./registry";

/** A single navigable entry in the sidebar. */
export interface NavItem {
  /** Router path (absolute). */
  path: string;
  /** Display label. */
  label: string;
}

/** A titled group of nav entries. */
export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Single source of truth for the docs navigation. The sidebar renders this and
 * the router derives its component routes from {@link COMPONENT_DOCS}.
 */
export const NAV: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { path: "/introduction", label: "Introduction" },
      { path: "/installation", label: "Installation" },
      { path: "/theming", label: "Theming" },
    ],
  },
  {
    title: "Components",
    items: COMPONENT_DOCS.map((d) => ({
      path: `/components/${d.id}`,
      label: d.title,
    })),
  },
];
