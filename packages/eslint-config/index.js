module.exports = {
  extends: ["@rushstack/eslint-config/profile/web-app"],
  ignorePatterns: ["**/*.js", "**/*.mjs", "**/*.d.ts"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "@typescript-eslint/naming-convention": "off",
  },
};
