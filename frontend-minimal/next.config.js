/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable static generation to fix UI context provider issues
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // Disable static site generation
  staticPageGenerationTimeout: 1, // Very short timeout forces dynamic rendering
  // Force dynamic rendering for all pages
  runtime: 'nodejs',
  env: {
    NEXT_PUBLIC_DISABLE_STATIC_GENERATION: "true"
  }
};
