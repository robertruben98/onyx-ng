module.exports = {
  preset: "jest-preset-angular",
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: { branches: 65, functions: 80, lines: 89, statements: 87 },
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
