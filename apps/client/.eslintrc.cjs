require("@kokomen/eslint-config/patch");

module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaVersion: 2020,
  },
  extends: ["@kokomen/eslint-config", "@kokomen/eslint-config/mixins/next"],
  settings: {
    next: {
      rootDir: __dirname,
    },
  },
  rules: {},
};
