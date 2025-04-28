// Next.js config with static generation disabled 
module.exports = { 
  reactStrictMode: false, 
  eslint: { 
    ignoreDuringBuilds: true 
  }, 
  env: { 
    NEXT_PUBLIC_DISABLE_STATIC_GENERATION: 'true' 
  } 
}; 
