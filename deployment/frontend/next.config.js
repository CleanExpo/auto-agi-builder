/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  // Disable static optimization completely
  webpack: (config, { isServer }) => {
    // Fix for Node.js 22 compatibility issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    
    // Increase memory limit for webpack
    config.performance = {
      ...config.performance,
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    };
    
    return config;
  },
  // Completely disable static generation
  experimental: {
    disableStaticGeneration: true
  }
};

module.exports = nextConfig;
