import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}", // Storybook에도 적용되도록
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
