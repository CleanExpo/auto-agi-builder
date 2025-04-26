/**
 * Context Compression Configuration
 * 
 * This file defines how the middle-out compression algorithm
 * should be applied across different environments.
 */

module.exports = {
  // Development environment settings
  development: {
    enabled: false,
    level: "low", 
    ratio: 0.3,  // Compress by 30% in development if enabled
    paths: [],   // No compression by default in development
    excludes: [
      "node_modules",
      ".git",
      "dist",
      ".next"
    ]
  },
  
  // Staging environment settings
  staging: {
    enabled: true,
    level: "medium",
    ratio: 0.5,  // Compress by 50% in staging
    paths: [
      "./frontend/components/",
      "./frontend/pages/",
      "./frontend/contexts/",
      "./frontend/services/"
    ],
    excludes: [
      "node_modules",
      ".git",
      "dist",
      ".next",
      "test",
      "*.min.js"
    ]
  },
  
  // Production environment settings
  production: {
    enabled: true,
    level: "high",
    ratio: 0.75, // Compress by 75% in production
    paths: [
      "./frontend/",
      "./app/api/",
      "./app/services/",
      "./app/core/"
    ],
    excludes: [
      "node_modules",
      ".git",
      "dist",
      ".next",
      "test",
      "*.min.js",
      "*.lock"
    ]
  },

  // LLM-specific compression (for AI context windows)
  llm: {
    enabled: true,
    level: "extreme",
    ratio: 0.9,  // Compress by 90% for LLM context
    paths: [
      "./",  // Entire project dir
    ],
    excludes: [
      "node_modules",
      ".git",
      "dist",
      ".next",
      "test",
      "*.min.js",
      "*.lock",
      "*.log",
      "*.map"
    ]
  }
};
