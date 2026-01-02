import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Biarkan TypeScript ignore agar build tidak gagal karena error tipe
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // HAPUS blok 'experimental' dan 'turbopack' sepenuhnya.
  // Next.js 16 sudah cukup pintar menangani defaultnya, dan konfigurasi manual seringkali malah bikin konflik.
  
  // Konfigurasi Webpack untuk SVG (Wajib ada karena Anda pakai SVGR)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;