// next.config.js for production
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    domains: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  env: {
    ENVIRONMENT: 'production',
  },
  webpack: (config, { isServer }) =
    // Add tree shaking and dead code elimination
    config.optimization.usedExports = true;
    // Production optimization flags
    if (isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  experimental: {
    optimizeCss: true,
  },
};
ECHO is off.
module.exports = nextConfig;
