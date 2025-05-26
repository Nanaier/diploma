import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  images: {
    domains: ["psych-vault.s3.amazonaws.com"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
