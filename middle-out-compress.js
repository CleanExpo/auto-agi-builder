// Middle-Out Compression for Large Context Windows
// This script compresses large text inputs to fit within token limits
// Usage: node middle-out-compress.js <input-file> <output-file> [max-tokens]

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_MAX_TOKENS = 195000; // Slightly under 200k to leave room for output
const ESTIMATED_TOKENS_PER_CHAR = 0.25; // Rough estimate: ~4 chars per token

// Compress text using "middle-out" strategy
// Preserves beginning and end of text, summarizes middle sections
function middleOutCompress(text, maxTokens) {
    // Rough character count estimation based on token limit
    const maxChars = Math.floor(maxTokens / ESTIMATED_TOKENS_PER_CHAR);
    
    // If text is already under limit, return it unchanged
    if (text.length <= maxChars) {
        console.log('Text already within token limit, no compression needed.');
        return text;
    }
    
    // Split text into lines for easier processing
    const lines = text.split('\n');
    
    // Calculate how much to preserve from beginning and end
    const preservePercent = 0.4; // Preserve 40% of content from each end
    const preserveCount = Math.floor(lines.length * preservePercent);
    
    // Extract beginning and end sections
    const beginningLines = lines.slice(0, preserveCount);
    const endLines = lines.slice(-preserveCount);
    
    // Calculate how many middle lines exist
    const middleLines = lines.slice(preserveCount, -preserveCount);
    
    // Create a summary of the middle section
    const middleSummary = [
        '',
        '/* ... COMPRESSED: ' + middleLines.length + ' lines removed to fit token limit ... */',
        ''
    ];
    
    // Combine sections
    const compressedLines = [...beginningLines, ...middleSummary, ...endLines];
    const compressedText = compressedLines.join('\n');
    
    // Check if we need to compress further
    if (compressedText.length > maxChars) {
        // Recursive compression with more aggressive settings
        console.log('First compression pass insufficient, compressing further...');
        const furtherCompressed = middleOutCompress(compressedText, maxTokens);
        return furtherCompressed;
    }
    
    // Calculate compression ratio
    const compressionRatio = ((text.length - compressedText.length) / text.length * 100).toFixed(2);
    console.log(`Compressed from ${text.length} chars to ${compressedText.length} chars (${compressionRatio}% reduction)`);
    
    return compressedText;
}

// Process a file with middle-out compression
function processFile(inputFile, outputFile, maxTokens = DEFAULT_MAX_TOKENS) {
    console.log(`Processing file: ${inputFile}`);
    console.log(`Maximum tokens: ${maxTokens}`);
    
    try {
        // Read input file
        const text = fs.readFileSync(inputFile, 'utf8');
        console.log(`Original size: ${text.length} characters`);
        
        // Compress the text
        const compressedText = middleOutCompress(text, maxTokens);
        
        // Write compressed output
        fs.writeFileSync(outputFile, compressedText);
        console.log(`Compressed output written to: ${outputFile}`);
        
        // Estimate tokens
        const estimatedTokens = Math.ceil(compressedText.length * ESTIMATED_TOKENS_PER_CHAR);
        console.log(`Estimated tokens: ~${estimatedTokens}`);
        
        return {
            success: true,
            originalSize: text.length,
            compressedSize: compressedText.length,
            estimatedTokens
        };
    } catch (error) {
        console.error('Error processing file:', error);
        return { success: false, error: error.message };
    }
}

// Process a directory of files
function processDirectory(inputDir, outputDir, maxTokens = DEFAULT_MAX_TOKENS) {
    console.log(`Processing directory: ${inputDir}`);
    console.log(`Output directory: ${outputDir}`);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Get all files in directory
    const files = fs.readdirSync(inputDir);
    
    const results = {};
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    // Process each file
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);
        
        // Skip directories
        if (fs.statSync(inputPath).isDirectory()) {
            console.log(`Skipping directory: ${inputPath}`);
            continue;
        }
        
        // Process the file
        const result = processFile(inputPath, outputPath, maxTokens);
        results[file] = result;
        
        if (result.success) {
            totalOriginalSize += result.originalSize;
            totalCompressedSize += result.compressedSize;
        }
    }
    
    // Calculate overall compression ratio
    const overallRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2);
    console.log(`\nOverall compression: ${overallRatio}% reduction`);
    console.log(`Total original size: ${totalOriginalSize} characters`);
    console.log(`Total compressed size: ${totalCompressedSize} characters`);
    
    return {
        results,
        totalOriginalSize,
        totalCompressedSize,
        overallRatio
    };
}

// Main function
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage:');
        console.log('  For single file: node middle-out-compress.js <input-file> <output-file> [max-tokens]');
        console.log('  For directory: node middle-out-compress.js --dir <input-dir> <output-dir> [max-tokens]');
        process.exit(1);
    }
    
    // Check if processing a directory
    if (args[0] === '--dir') {
        const inputDir = args[1];
        const outputDir = args[2];
        const maxTokens = args[3] ? parseInt(args[3]) : DEFAULT_MAX_TOKENS;
        
        if (!inputDir || !outputDir) {
            console.log('Error: Input and output directories are required');
            process.exit(1);
        }
        
        processDirectory(inputDir, outputDir, maxTokens);
    } else {
        const inputFile = args[0];
        const outputFile = args[1];
        const maxTokens = args[2] ? parseInt(args[2]) : DEFAULT_MAX_TOKENS;
        
        processFile(inputFile, outputFile, maxTokens);
    }
}

// Run the main function if this script is executed directly
if (require.main === module) {
    main();
} else {
    // Export functions for use as a module
    module.exports = {
        middleOutCompress,
        processFile,
        processDirectory
    };
}
