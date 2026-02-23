// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathPattern: ["**/__tests__/**/*.test.ts?(x)"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "actions/**/*.ts",
    "components/**/*.tsx",
    "!**/*.d.ts",
  ],
};

module.exports = createJestConfig(customJestConfig);
