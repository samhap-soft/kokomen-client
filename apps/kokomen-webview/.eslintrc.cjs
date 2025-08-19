require("@kokomen/eslint-config/patch");

module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true
  },
  extends: ["@kokomen/eslint-config", "@kokomen/eslint-config/mixins/react"],
  root: true,
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname
  },
  settings: {
    react: {
      version: "19.0"
    }
  },

  rules: {
    "@typescript-eslint/no-floating-promises": "off",
    "@rushstack/typedef-var": "off"
  }
};
