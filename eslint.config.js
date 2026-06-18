const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".nx/**",
      "storybook-static/**",
      "out-tsc/**",
      "coverage/**",
      "**/*.config.js",
      ".stylelintrc.js",
      "eslint.config.js",
      "**/.storybook/**",
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
        { type: "attribute", prefix: "ui", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "ui", style: "kebab-case" },
      ],
    },
  },
  {
    // The docs app is an application, not the component library — its own
    // chrome components use the `docs-` prefix (library components keep `ui-`).
    files: ["apps/docs/**/*.ts"],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "docs", style: "kebab-case" },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
  },
);
