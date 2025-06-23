const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'next/dist/compiled/typescript',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // New in webpack 5
  },
  // Enhanced optimizations in webpack 5
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
  // Enhanced experiments for webpack 5
  experiments: {
    layers: true,
    topLevelAwait: true,
    asyncWebAssembly: true,
    outputModule: true,
  },
  // Dev server config for webpack-dev-server 5
  devServer: {
    hot: true,
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: true,
      progress: true,
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
};