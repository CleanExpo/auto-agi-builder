// next.config.js for production 
const nextConfig = { 
  output: 'export', 
  distDir: 'out', 
  trailingSlash: true, 
  images: { 
    unoptimized: true 
  }, 
  env: { 
    ENVIRONMENT: 'production', 
  }, 
}; 
 
module.exports = nextConfig; 
