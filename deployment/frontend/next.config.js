// Next.js config with static generation disabled 
module.exports = {
  experimental: {
    disableStaticGeneration: true
  }, 
  reactStrictMode: false, 
  eslint: { 
    ignoreDuringBuilds: true 
  }, 
  env: { 
    NEXT_PUBLIC_DISABLE_STATIC_GENERATION: 'true',
    NEXT_PRIVATE_TARGET: 'serverless' 
  },
  distDir: '.next',
  trailingSlash: true
};
