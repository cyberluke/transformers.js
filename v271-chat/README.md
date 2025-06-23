# Assistant UI Starter

A Next.js project configured with both Turbopack and Webpack 5 for development.

## Development Options

You can run the development server using either Turbopack or Webpack:

### Using Turbopack (Default, Faster)
```bash
bun run dev
# or
bun run dev:turbo
```

### Using Webpack 5.99.9 with Enhanced Features
```bash
bun run dev:webpack
```

## Tech Stack

- **Next.js**: ^15.3.4 - Latest version with improved performance
- **Webpack**: 5.99.9 - For traditional bundling with modern features
  - webpack-cli: ^6.0.1
  - webpack-dev-server: ^5.2.2
- **TypeScript Native Preview**: ^7.0.0-dev.20250620.1
- **Biome**: 2.0.0 - Modern linting and formatting

## Features

- **Dual Bundler Support**: Choose between Turbopack for faster development or Webpack for compatibility
- **Enhanced Webpack Features**:
  - Improved chunk splitting for better caching
  - Module federation support
  - Top-level await support
  - WebAssembly support
  - Layer support for better code organization
- **Development Optimizations**:
  - Hot Module Replacement (HMR)
  - Fast Refresh
  - Improved error overlay
  - Progress indicators
  - Dynamic code splitting

## Configuration

- `next.config.js`: Contains bundler configuration and feature flags
- `webpack.config.js`: Enhanced Webpack 5 configuration with modern features
- `biome.json`: Linting and formatting rules

## Scripts

- `dev`: Run development server with default bundler (Turbopack)
- `dev:turbo`: Explicitly use Turbopack
- `dev:webpack`: Use Webpack 5.99.9 with enhanced features
- `build`: Create production build
- `start`: Run production server
- `lint`: Check code with Biome
- `format`: Check formatting
- `format:write`: Apply formatting fixes
- `check:all`: Run all checks
