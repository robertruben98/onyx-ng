/**
 * Selector each preset is scoped to. A preset with no entry here is a build
 * error (build.mjs). Shared with reference.mjs so the token reference the docs
 * app ships names the same class the CSS build emits, from one definition.
 */
export const SELECTORS = {
  dark: ".onyx-dark",
  acme: ".onyx-theme-acme",
};
