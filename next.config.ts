import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We keep this to prevent TypeScript errors from failing the build
  typescript: {
    ignoreBuildErrors: true,
  },
  

  turbopack: {},

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;