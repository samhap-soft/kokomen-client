require("@kokomen/eslint-config/patch");

module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: ["*.cjs", "esm", ".turbo", ".cache"],
  extends: ["@kokomen/eslint-config"],
};
