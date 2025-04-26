// Compress-Auto-AGI - Context Length Solution
// This script helps compress Auto AGI Builder files to fit within LLM context limits
// Usage: node compress-auto-agi.js [target-file | target-directory]

const fs = require('fs');
const path = require('path');
const { middleOutCompress, processFile, processDirectory } = require('./middle-out-compress');

// Configuration
const MAX_TOKENS = 195000; // Set to 195K to leave room for response
const DISASTER_RECOVERY_PATH = '../OneDrive - Disaster Recovery/1111/Auto AGI Builder';
const COMPRESSED_OUTPUT_DIR = './compressed-agi-files';

// Helper function to check file size and estimate tokens
function checkFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const sizeInBytes = stats.size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const estimatedTokens = Math.ceil(sizeInBytes * 0.25); // Rough estimation
        
        return {
            path: filePath,
            sizeBytes: sizeInBytes,
            sizeKB: sizeInKB,
            estimatedTokens: estimatedTokens,
            exceedsLimit: estimatedTokens > 200000
        };
    } catch (error) {
        return {
            path: filePath,
            error: error.message
        };
    }
}

// Find large files in directory
function findLargeFiles(directory, threshold = 150000) {
    const largeFiles = [];
    
    function scanDirectory(dir) {
        try {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory()) {
                    // Skip node_modules and .git directories
                    if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                        scanDirectory(filePath);
                    }
                } else {
                    const fileInfo = checkFileSize(filePath);
                    if (fileInfo.estimatedTokens > threshold) {
                        largeFiles.push(fileInfo);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error);
        }
    }
    
    scanDirectory(directory);
    return largeFiles;
}

// Analyze a specific file for token usage
function analyzeFile(filePath) {
    const fileInfo = checkFileSize(filePath);
    
    console.log('\nFile Analysis:');
    console.log(`Path: ${fileInfo.path}`);
    console.log(`Size: ${fileInfo.sizeKB} KB`);
    console.log(`Estimated tokens: ~${fileInfo.estimatedTokens}`);
    
    if (fileInfo.exceedsLimit) {
        console.log('❌ This file exceeds the 200K token limit and needs compression');
    } else {
        console.log('✅ This file is within the 200K token limit');
    }
    
    return fileInfo;
}

// Function to compress the Auto AGI Builder project
function compressAutoAGI(targetPath = DISASTER_RECOVERY_PATH) {
    console.log('=== Auto AGI Builder Context Length Solution ===');
    console.log(`Targeting: ${targetPath}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(COMPRESSED_OUTPUT_DIR)) {
        fs.mkdirSync(COMPRESSED_OUTPUT_DIR, { recursive: true });
    }
    
    // Check if path is a file or directory
    const stats = fs.statSync(targetPath);
    
    if (stats.isFile()) {
        // Process single file
        const fileInfo = analyzeFile(targetPath);
        
        if (fileInfo.exceedsLimit) {
            const fileName = path.basename(targetPath);
            const outputPath = path.join(COMPRESSED_OUTPUT_DIR, fileName);
            
            console.log(`\nCompressing file to fit context length...`);
            const result = processFile(targetPath, outputPath, MAX_TOKENS);
            
            if (result.success) {
                console.log(`\n✅ Compression complete!`);
                console.log(`Original size: ~${result.estimatedTokens} tokens`);
                console.log(`Compressed file saved to: ${outputPath}`);
                console.log(`Use this compressed file in your LLM context window.`);
            }
        } else {
            console.log('\nThis file does not need compression.');
        }
    } else {
        // Process directory
        console.log('\nScanning directory for large files...');
        const largeFiles = findLargeFiles(targetPath);
        
        if (largeFiles.length === 0) {
            console.log('No files exceeding token limit found.');
            return;
        }
        
        console.log(`\nFound ${largeFiles.length} large files that may cause context length issues:`);
        largeFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.path} (~${file.estimatedTokens} tokens)`);
        });
        
        console.log('\nCompressing large files...');
        
        // Process each large file
        for (const file of largeFiles) {
            const relativePath = path.relative(targetPath, file.path);
            const outputPath = path.join(COMPRESSED_OUTPUT_DIR, relativePath);
            
            // Ensure directory structure exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            console.log(`\nCompressing: ${file.path}`);
            const result = processFile(file.path, outputPath, MAX_TOKENS);
            
            if (result.success) {
                console.log(`✅ Compressed file saved to: ${outputPath}`);
            }
        }
        
        console.log('\n=== Compression Summary ===');
        console.log(`Original files in: ${targetPath}`);
        console.log(`Compressed files in: ${COMPRESSED_OUTPUT_DIR}`);
        console.log('Use the compressed files when working with LLMs to avoid context length issues.');
    }
}

// Check for token usage in Auto AGI Builder project files
function checkProjectTokens() {
    console.log('=== Auto AGI Builder Token Usage Analysis ===');
    
    // Common large file types in web projects
    const targetExtensions = ['.js', '.py', '.json', '.html', '.md', '.css', '.jsx', '.ts', '.tsx'];
    
    // Paths to check (based on your VSCode tabs)
    const pathsToCheck = [
        DISASTER_RECOVERY_PATH + '/unified-deploy.js',
        DISASTER_RECOVERY_PATH + '/DEPLOYMENT_GUIDE.md',
        DISASTER_RECOVERY_PATH + '/frontend/package.json',
        DISASTER_RECOVERY_PATH + '/app/main.py',
    ];
    
    console.log('Analyzing key project files...');
    
    let totalTokens = 0;
    const fileStats = [];
    
    // Analyze each path
    for (const filePath of pathsToCheck) {
        try {
            const fileInfo = checkFileSize(filePath);
            fileStats.push(fileInfo);
            totalTokens += fileInfo.estimatedTokens;
            
            console.log(`- ${path.basename(filePath)}: ~${fileInfo.estimatedTokens} tokens`);
        } catch (error) {
            console.log(`- ${path.basename(filePath)}: Error - ${error.message}`);
        }
    }
    
    console.log(`\nTotal estimated tokens for analyzed files: ~${totalTokens}`);
    
    if (totalTokens > 200000) {
        console.log('❌ These files combined exceed the 200K token limit.');
        console.log('Recommendation: Process individual files or select specific directories.');
    } else {
        console.log('✅ These files combined are within the 200K token limit.');
        
        // Check if we might be missing something
        console.log('\nChecking for other potential large files...');
        const largeFiles = findLargeFiles(DISASTER_RECOVERY_PATH);
        
        if (largeFiles.length > 0) {
            console.log(`Found ${largeFiles.length} additional large files that might contribute to token usage:`);
            largeFiles.forEach((file, index) => {
                if (!pathsToCheck.includes(file.path)) {
                    console.log(`- ${file.path}: ~${file.estimatedTokens} tokens`);
                }
            });
        } else {
            console.log('No other large files found.');
        }
    }
}

// Main function
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help') {
        console.log('Usage:');
        console.log('  Check token usage: node compress-auto-agi.js --check');
        console.log('  Compress single file: node compress-auto-agi.js <file-path>');
        console.log('  Compress directory: node compress-auto-agi.js <directory-path>');
        console.log('  Default project path: node compress-auto-agi.js');
        return;
    }
    
    if (args[0] === '--check') {
        checkProjectTokens();
    } else if (args[0]) {
        compressAutoAGI(args[0]);
    } else {
        compressAutoAGI();
    }
}

// Run the main function
main();
