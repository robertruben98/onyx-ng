module.exports = {
  preset: "jest-preset-angular",
  collectCoverage: false,
  collectCoverageFrom: [
    "libs/ui/**/*.ts",
    "!libs/ui/**/*.spec.ts",
    "!libs/ui/**/*.stories.ts",
    "!libs/ui/**/*.demos.ts",
    "!libs/ui/**/*.docs.ts",
    "!libs/ui/**/index.ts",
    "!libs/ui/**/test-utils/**",
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/apps/docs/",
    "\\.stories\\.ts$",
    "\\.demos\\.ts$",
    "\\.docs\\.ts$",
    "/index\\.ts$",
    "/test-utils/",
  ],
  coverageReporters: ["text", "json-summary", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jsdom",
  roots: ["<rootDir>/libs", "<rootDir>/apps/docs/src"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^@onyx/ui/components$": "<rootDir>/libs/ui/components/index.ts",
    "^@onyx/ui/primitives$": "<rootDir>/libs/ui/primitives/index.ts",
  },
  transform: {
    "^.+\\.(ts|mjs|js|html)$": [
      "jest-preset-angular",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
        stringifyContentPathRegex: "\\.(html|svg)$",
      },
    ],
  },
};
