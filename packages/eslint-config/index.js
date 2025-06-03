const path = require("path");
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["**/*.js", "**/*.mjs", "**/*.d.ts"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {},
};
