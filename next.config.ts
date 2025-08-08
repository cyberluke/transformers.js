import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // reactStrictMode: true,
  // Enable experimental features
  // experimental: {
  //   // turbo: process.env.NEXT_WEBPACK !== 'true' ? {} : undefined,
  //   typedRoutes: true,
  //   serverActions: {
  //     allowedOrigins: [],
  //   },
  // },

  // turbopack: process.env.NEXT_WEBPACK !== 'true' ? {} : undefined,
  devIndicators: {
    position: "top-right", // top-right, bottom-right, top-left, bottom-left
  },
};

export default nextConfig;
