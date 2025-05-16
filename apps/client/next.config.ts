import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kokomen/ui"],
  output: "standalone",
};

export default nextConfig;
