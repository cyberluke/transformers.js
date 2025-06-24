import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable webpack compiler alongside turbopack
  webpack: (config, { dev, isServer }) => {
    // Use webpack configuration when NEXT_WEBPACK is set
    if (process.env.NEXT_WEBPACK === 'true') {
      // Merge with custom webpack config
      const customWebpackConfig = require('./webpack.config.js');
      config = {
        ...config,
        ...customWebpackConfig,
        // Preserve Next.js specific options
        experiments: {
          ...config.experiments,
          ...customWebpackConfig.experiments,
        },
        optimization: {
          ...config.optimization,
          ...customWebpackConfig.optimization,
        },
      };
    }

    // Add additional webpack configuration here
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };

    return config;
  },
  // Enable experimental features
  experimental: {
    // turbo: process.env.NEXT_WEBPACK !== 'true' ? {} : undefined,
    typedRoutes: true,
    serverActions: {
      allowedOrigins: [],
    },
  },

  turbopack: process.env.NEXT_WEBPACK !== 'true' ? {} : undefined,
};

export default nextConfig;
