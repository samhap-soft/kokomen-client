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
    "^@/src/(.*)$": "<rootDir>/src/$1",
    // react-markdown / remark 체인은 ESM 전용이고, PnP에서는 패키지 경로에
    // /node_modules/ 가 포함되어 transformIgnorePatterns에 걸려 변환되지 않는다.
    // 마크다운 렌더링은 테스트 대상이 아니므로 스텁으로 대체한다.
    "^react-markdown$": "<rootDir>/test/stubs/reactMarkdown.tsx",
    "^remark-gfm$": "<rootDir>/test/stubs/emptyModule.ts"
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
