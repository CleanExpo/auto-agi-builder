# Context Compression Troubleshooting Guide

This document provides solutions for common issues that might arise when using the context compression tools in the Auto AGI Builder deployment pipeline.

## Table of Contents

1. [Compression Failures](#compression-failures)
2. [Deployment Issues with Compressed Files](#deployment-issues-with-compressed-files)
3. [Performance Issues](#performance-issues)
4. [LLM-Specific Problems](#llm-specific-problems)
5. [Configuration Issues](#configuration-issues)

## Compression Failures

### Issue: Middle-Out Compression Algorithm Fails

**Symptoms:**
- Error message: `Error compressing file: unexpected token...`
- Compression process exits with non-zero code
- Incomplete output files

**Solutions:**
1. **Check file encoding**: Ensure source files are UTF-8 encoded
   ```bash
   # PowerShell command to check encoding
   Get-Content -Path "path/to/file" -Encoding UTF8 -ErrorAction SilentlyContinue
   ```

2. **Check for syntax errors**: Verify the source file has valid syntax
   ```bash
   # For JavaScript files
   node --check path/to/file.js
   ```

3. **Increase memory limit**: For very large files
   ```bash
   # Run with increased memory limit
   node --max-old-space-size=8192 middle-out-compress.js --file="large-file.js"
   ```

4. **Process in chunks**: Split extremely large files into smaller sections
   ```bash
   # Use the --chunk-size option
   node middle-out-compress.js --file="large-file.js" --chunk-size=500
   ```

### Issue: Missing Dependencies

**Symptoms:**
- Error message: `Cannot find module '...'`
- Compression fails to start

**Solutions:**
1. **Install required packages**: 
   ```bash
   npm install
   ```

2. **Check for specific missing packages**:
   ```bash
   npm list
   ```

3. **Reinstall with forced resolution**:
   ```bash
   npm install --force
   ```

## Deployment Issues with Compressed Files

### Issue: Vercel Deployment Fails with Compressed Files

**Symptoms:**
- Build error during Vercel deployment
- Error message in deployment logs about file parsing
- Functions missing or undefined in compressed files

**Solutions:**
1. **Update Vercel configuration**: Ensure `vercel.json` is properly configured
   ```json
   {
     "headers": [
       {
         "source": "/(.*)\\.js$",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

2. **Check compression ratio**: Lower the compression level for critical files
   ```javascript
   // In compression-config.js
   production: {
     enabled: true,
     level: "medium", // Change from "high" to "medium"
     ratio: 0.5,      // Change from 0.75 to 0.5
     paths: [...]
   }
   ```

3. **Exclude problematic files**: Add specific files to the excludes list
   ```javascript
   excludes: [
     "node_modules",
     ".git",
     "dist",
     ".next",
     "problematic-file.js"
   ]
   ```

### Issue: Routing Problems After Deployment

**Symptoms:**
- 404 errors for routes that should exist
- Missing functionality in deployed application
- Console errors about undefined functions

**Solutions:**
1. **Check build output**: Verify that compressed files were properly built
   ```bash
   # Examine build directory
   ls -la ./compressed-deploy/
   ```

2. **Revert critical files**: Selectively skip compression for router files
   ```javascript
   // In compression-config.js
   excludes: [
     "node_modules",
     ".git",
     "router.js",
     "routes.js"
   ]
   ```

3. **Check file references**: Ensure all import/require paths are correct after compression

## Performance Issues

### Issue: Slow Compression Process

**Symptoms:**
- Compression takes a very long time
- High CPU usage during compression
- Process seems to hang

**Solutions:**
1. **Optimize file selection**: Be more selective about which files to compress
   ```javascript
   // In compression-config.js
   paths: [
     "./frontend/components/",   // Instead of "./frontend/"
     "./app/api/important-apis/" // Instead of "./app/api/"
   ]
   ```

2. **Increase threshold**: Only compress files above a larger size
   ```javascript
   // In deployment-compress.js, change threshold
   const largeFiles = findLargeFiles(dirPath, 1000 * 1024, envConfig.excludes); // 1MB instead of 100KB
   ```

3. **Run in parallel**: Modify the script to process files in parallel (advanced)

### Issue: Memory Usage Issues

**Symptoms:**
- "JavaScript heap out of memory" errors
- Process crashes during compression of large files
- System becomes unresponsive

**Solutions:**
1. **Increase Node.js memory limit**:
   ```bash
   # Run with increased memory
   NODE_OPTIONS=--max_old_space_size=8192 node deployment-compress.js
   ```

2. **Process files in batches**:
   ```javascript
   // Modify the script to process a few files at a time
   const batchSize = 5;
   for (let i = 0; i < largeFiles.length; i += batchSize) {
     const batch = largeFiles.slice(i, i + batchSize);
     compressFiles(batch, compressionLevel);
   }
   ```

## LLM-Specific Problems

### Issue: Compressed Files Not Recognized by LLM

**Symptoms:**
- LLM ignores compressed files
- Error messages about syntax in compressed files
- Poor responses due to mangled code

**Solutions:**
1. **Use LLM-specific compression settings**:
   ```bash
   # Use the LLM-specific environment
   .\deploy-compress.bat   # Then select option 4 (LLM)
   # or
   .\deploy-compress.ps1   # Then select option 4 (LLM)
   ```

2. **Preserve important sections**: Modify the compression algorithm to better preserve LLM-relevant parts
   ```javascript
   // Add patterns to preserve (in middle-out-compress.js)
   const preservePatterns = [
     /\/\*\* @LLM_IMPORTANT \*\/([\s\S]*?)\/\*\* @LLM_END \*\//g,
     /\/\/ @LLM_PRESERVE: (.*)/g
   ];
   ```

3. **Format compressed output**: Ensure the compressed output maintains readability
   ```bash
   # Add formatting flag if available
   node middle-out-compress.js --file="input.js" --output="output.js" --format
   ```

### Issue: Token Counting Discrepancies

**Symptoms:**
- LLM reports different token counts than expected
- Compression doesn't achieve the expected reduction in tokens
- LLM still hits context limits despite compression

**Solutions:**
1. **Use more aggressive compression** for LLM mode:
   ```javascript
   // In compression-config.js
   llm: {
     enabled: true,
     level: "extreme",
     ratio: 0.95,  // Increase from 0.9 to 0.95
     // ...
   }
   ```

2. **Use multiple compression passes**:
   ```bash
   # First compress with regular settings
   node middle-out-compress.js --file="input.js" --output="temp.js"
   
   # Then compress the result with LLM settings
   node middle-out-compress.js --file="temp.js" --output="final.js" --level=extreme
   ```

3. **Manually verify token counts** with a tokenizer tool

## Configuration Issues

### Issue: Environment-Specific Settings Not Applied

**Symptoms:**
- Compression settings seem to be ignored
- Wrong files are compressed or excluded
- Compression level different than expected

**Solutions:**
1. **Verify environment variable**:
   ```bash
   # Check the current NODE_ENV value
   echo %NODE_ENV%   # Windows
   echo $NODE_ENV    # Linux/Mac
   ```

2. **Set environment variable explicitly**:
   ```bash
   # Windows
   set NODE_ENV=production
   
   # Linux/Mac
   export NODE_ENV=production
   ```

3. **Debug configuration loading**:
   ```javascript
   // Add this to deployment-compress.js
   console.log("Current environment:", process.env.NODE_ENV);
   console.log("Loaded config:", JSON.stringify(envConfig, null, 2));
   ```

### Issue: Integration with Deployment Pipeline Fails

**Symptoms:**
- Compressed files not included in deployment
- Deployment proceeds with original files
- Pipeline steps fail or get skipped

**Solutions:**
1. **Check deployment logs**:
   ```bash
   # Look for compression-related messages
   cat ./compression-deploy-log-*.log
   ```

2. **Verify file paths**:
   ```bash
   # Make sure compressed files are in the expected location
   ls -la ./compressed-deploy/
   ```

3. **Manually run deployment with compressed files**:
   ```bash
   # Copy compressed files to the right location first
   cp -r ./compressed-deploy/* ./public/js/
   
   # Then deploy
   vercel --prod
   ```

4. **Check for path conflicts** between compression output and build output directories
