import { createRequire } from "module";
import { dirname, join } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const require = createRequire(import.meta.url);
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  docs: {
    autodocs: "tag",
  },
  // 면접관 실사 영상은 앱 public 에 있다. 스토리에서도 같은 경로(/interviewer/...)로 쓰도록 연결한다.
  staticDirs: [
    { from: "../../../apps/client/public/interviewer", to: "/interviewer" },
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  viteFinal: async (config, { configType }) => {
    config.plugins = [...config.plugins, tsconfigPaths()];

    return { ...config };
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {},
    skipCompiler: false,
  },
};
export default config;
