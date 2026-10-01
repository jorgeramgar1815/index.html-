import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática: genera /out listo para Vercel, Netlify o GitHub Pages.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
