/**
 * Next.js Configuration for Auto AGI Builder
 * Optimized for Vercel deployment
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable image optimization during development for faster builds
  images: {
    domains: [
      'yourdomain.com',  // Replace with your actual image domain
      'storage.googleapis.com',  // If using Google Cloud Storage
      'localhost'
    ],
    // Reduced image sizes for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Environment variables that should be accessible in the browser
  // These must also be set in Vercel's project settings
  env: {
    // This is a fallback - still set NEXT_PUBLIC_* in Vercel
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://auto-agi-builder.vercel.app',
  },
  
  // API route proxy configuration to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 
          process.env.NODE_ENV === 'production'
            ? `${process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com'}/api/:path*`
            : 'http://localhost:8000/api/:path*',
      },
    ];
  },
  
  // Custom webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Add optimizations or custom loaders here
    
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // Optimize build output
  experimental: {
    // Enable if your project grows to improve build performance
    // outputFileTracing: true,
    
    // Reduce client-side JavaScript for improved LCP
    optimizeCss: true,
    
    // Reduce build time for larger applications
    // esmExternals: true,
  },
  
  // Increase timeout for builds
  onDemandEntries: {
    // Time in ms after which idle page re-build can be triggered
    maxInactiveAge: 60 * 1000,
    // Number of pages to keep in memory
    pagesBufferLength: 5,
  },
  
  // Use gzip compression for static assets
  compress: true,
  
  // Set performance budget
  poweredByHeader: false,
};

module.exports = nextConfig;
