const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

// Storybook was removed from this repo on 2026-06-15 (approved docs-site spec,
// commit 9cc7bdb). Components are documented in <name>.docs.ts + <name>.demos.ts
// and rendered live by apps/docs. Anything Storybook-shaped is a leftover from
// the old component template and must not come back.
const NO_STORYBOOK =
  "Storybook was removed on 2026-06-15. Document the component in " +
  "<name>.docs.ts + <name>.demos.ts and register it in " +
  "apps/docs/src/app/registry.ts instead.";

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".nx/**",
      "out-tsc/**",
      "coverage/**",
      "**/*.config.js",
      ".stylelintrc.js",
      "eslint.config.js",
    ],
  },
  {
    files: ["**/*.ts"],
    extends: [
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "onyx", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "onyx", style: "kebab-case" },
      ],
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@storybook/*"], message: NO_STORYBOOK }] },
      ],
    },
  },
  {
    // A *.stories.ts file is wrong regardless of its content.
    files: ["**/*.stories.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "Program", message: NO_STORYBOOK },
      ],
    },
  },
  {
    // The docs app is an application, not the component library — its own
    // chrome components use the `docs-` prefix (library components use `onyx-`).
    files: ["apps/docs/**/*.ts"],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "docs", style: "kebab-case" },
      ],
    },
  },
  {
    // Same template-accessibility gate as the component library: the docs app
    // is where users meet the components, so it holds the same bar.
    files: ["apps/docs/**/*.html"],
    extends: [...angular.configs.templateAccessibility],
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
  },
);
