module.exports = {
  root: true,

  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "out/",
    ".yarn/",
    "public/",

    ".eslintrc.cjs", // ESLint 설정 파일 자체

    "*.json", // tsconfig.json, package.json 등을 포함하여 모든 .json 파일 무시

    ".vscode/", // .vscode 디렉토리 전체 무시
  ],
};
