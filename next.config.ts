import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '40mb' // Set desired value here
}};

export default nextConfig;
