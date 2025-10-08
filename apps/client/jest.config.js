/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const config = {
  coverageProvider: "v8",
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1"
  },
  resolver: require.resolve("jest-pnp-resolver"),
  moduleDirectories: [
    "node_modules",
    "<rootDir>/node_modules",
    "<rootDir>/../../node_modules"
  ],
  rootDir: ".",
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!<rootDir>/out/**",
    "!<rootDir>/.next/**",
    "!<rootDir>/*.config.js",
    "!<rootDir>/coverage/**",
    "!<rootDir>/next.lock/**"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/next.lock/",
    "https://cdn.jsdelivr.net/"
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  testEnvironment: "jest-fixed-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript"
        ]
      }
    ]
  },
  transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"]
};

module.exports = createJestConfig(config);
