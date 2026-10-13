import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/webp"] },
  // Blazify's privacy policy is a static page in public/; the app stores link to it without "index.html".
  async rewrites() {
    return [
      { source: "/blazify/privacy", destination: "/blazify/privacy/index.html" },
      { source: "/blazify/privacy/", destination: "/blazify/privacy/index.html" },
    ];
  },
};

export default nextConfig;
