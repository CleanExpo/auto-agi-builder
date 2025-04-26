// next.config.js for staging
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
    ENVIRONMENT: 'staging',
  },
  webpack: (config, { isServer }) =
    // Add source maps for better debugging
    if (isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
  experimental: {
    optimizeCss: true,
  },
};
ECHO is off.
module.exports = nextConfig;
