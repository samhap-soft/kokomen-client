import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import path from "path";
import PnpWebpackPlugin from "pnp-webpack-plugin";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kokomen/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.devtool = false;
      config.optimization.splitChunks = {
        chunks: "all",
        minChunks: 2,
        maxInitialRequests: 10,
      };
    }
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(PnpWebpackPlugin);

    config.resolveLoader = {
      ...config.resolveLoader,
      plugins: [PnpWebpackPlugin.moduleLoader(import.meta.url)],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve("./src"),
      "@kokomen/ui": path.resolve("../../packages/ui/src"),
    };
    return config;
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "kokomen",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: false,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
