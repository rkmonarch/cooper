import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Native NAPI-RS module — must not be bundled by Turbopack/webpack
  serverExternalPackages: ["@open-wallet-standard/core"],
};

export default nextConfig;
