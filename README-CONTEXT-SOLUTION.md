# Auto AGI Builder - Context Length Solution

This toolkit solves the context length issue you're experiencing with the Auto AGI Builder project, where your input exceeds the 200,000 token limit (specifically 204,381 tokens: 196,189 input + 8,192 output).

## Quick Start

1. Simply run `run-compression.bat` for a menu-driven interface
2. Choose what you want to do:
   - Check which files are causing token issues
   - Compress specific files or directories
   - Get help on using compressed files

## What's Included

- **middle-out-compress.js**: Core compression algorithm that preserves the most important parts of files
- **compress-auto-agi.js**: Specialized script for analyzing and compressing Auto AGI Builder files
- **run-compression.bat**: User-friendly batch script with menu interface

## How It Works

The "middle-out" compression algorithm:
1. Preserves the beginning and end of each file (where imports, configurations, exports, and main functionality typically reside)
2. Removes/summarizes the middle portion of the file
3. Creates compressed versions that maintain essential code while fitting within token limits

## Usage Instructions

### Method 1: Using the Batch Menu

1. Run `run-compression.bat`
2. Select option 1 to identify which files are contributing most to your token count
3. Select option 5 to compress the specific file causing the context length error
4. Use the compressed file for your LLM context window

### Method 2: Direct Command Line

```
# Analyze token usage
node compress-auto-agi.js --check

# Compress a specific file
node compress-auto-agi.js "path/to/your/file.js"

# Compress an entire directory
node compress-auto-agi.js "path/to/directory"
```

### Method 3: Compress All Large Files

If you're not sure which specific file is causing issues, run:

```
node compress-auto-agi.js
```

This will scan the entire Auto AGI Builder project and compress any files that might contribute to token limit issues.

## Using Compressed Files

After compression, you'll find your compressed files in the `./compressed-agi-files` directory. When working with LLMs:

1. Use these compressed versions instead of the originals when uploading files
2. The compressed files maintain the essential structure and functionality while fitting within token limits
3. If you need different compression levels, adjust the `preservePercent` variable in `middle-out-compress.js`

## Example

If you were going to upload:
```
../OneDrive - Disaster Recovery/1111/Auto AGI Builder/unified-deploy.js
```

Use the compressed version instead:
```
./compressed-agi-files/unified-deploy.js
```

## Troubleshooting

- If compressed files are still too large, try adjusting the `preservePercent` in `middle-out-compress.js` to a smaller value
- If important code is being removed, try adjusting the `preservePercent` to a larger value
- For very large projects, you might need to selectively choose which files to include in your context
