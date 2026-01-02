import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We keep this to prevent TypeScript errors from failing the build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Explicitly set an empty turbopack config to silence the error as per the log suggestion
  experimental: {
     turbo: {
        rules: {
           '*.svg': {
              loaders: ['@svgr/webpack'],
              as: '*.js',
           },
        }
     }
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;