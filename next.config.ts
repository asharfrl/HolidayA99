import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We keep this to prevent TypeScript errors from failing the build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 'eslint' key is removed as it's no longer supported in next.config.ts for this version.
  // If you need to skip linting, you might need to adjust your build command or eslint config separately.

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;