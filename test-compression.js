// Test compression functionality
// This script creates a large test file and then compresses it to demonstrate the tools

const fs = require('fs');
const path = require('path');
const { middleOutCompress, processFile } = require('./middle-out-compress');

// Configuration
const TEST_DIR = './test-files';
const TEST_FILENAME = 'large-test-file.js';
const COMPRESSED_FILENAME = 'compressed-test-file.js';

// Create test directory if it doesn't exist
if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

// Generate a large JavaScript file with repeating content
function generateLargeFile() {
    console.log(`Generating large test file: ${path.join(TEST_DIR, TEST_FILENAME)}`);
    
    // Start with imports and configuration (important beginning content)
    let content = `// This is a large test file to demonstrate compression
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const CONFIG = {
    apiKey: 'test-api-key-12345',
    endpoint: 'https://api.example.com/v1',
    timeout: 30000,
    retries: 3,
    logLevel: 'info'
};

/**
 * Main application class
 */
class TestApplication {
    constructor(options) {
        this.options = options;
        this.initialized = false;
        this.clients = [];
        this.data = {};
    }

    init() {
        console.log('Initializing test application...');
        this.initialized = true;
        return this;
    }

`;
    
    // Generate many similar methods to inflate the file size (middle content)
    // Increased from 500 to 2000 methods to exceed token limits
    for (let i = 1; i <= 2000; i++) {
        content += `    /**
     * Test method ${i} - This is a generated method that would likely be compressed
     * @param {string} param1 - First parameter
     * @param {number} param2 - Second parameter
     * @returns {Object} - Result object
     */
    testMethod${i}(param1, param2) {
        console.log(\`Running test method ${i} with \${param1} and \${param2}\`);
        
        // This is filler code that simulates a real method
        const result = {
            id: ${i},
            name: \`Test ${i}\`,
            value: param2 * ${i},
            timestamp: new Date().toISOString(),
            description: \`This is test method ${i} that processes \${param1}\`
        };
        
        // More filler code
        if (param2 > 10) {
            result.category = 'high';
        } else if (param2 > 5) {
            result.category = 'medium';
        } else {
            result.category = 'low';
        }
        
        return result;
    }

`;
    }
    
    // End with important code (important ending content)
    content += `    /**
     * Run the application
     * @param {string} mode - Application mode
     * @returns {Promise<void>}
     */
    async run(mode) {
        if (!this.initialized) {
            throw new Error('Application not initialized');
        }
        
        console.log(\`Running application in \${mode} mode\`);
        
        try {
            const response = await axios.get(CONFIG.endpoint);
            const data = response.data;
            
            console.log('Data received:', data);
            
            // Process the data
            this.processData(data);
            
            return {
                success: true,
                message: 'Application ran successfully',
                data: this.data
            };
        } catch (error) {
            console.error('Error running application:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Process data
     * @param {Object} data - Data to process
     */
    processData(data) {
        console.log('Processing data...');
        this.data = data;
    }
}

// Create and export application instance
const app = new TestApplication(CONFIG);
module.exports = app;

// Run if executed directly
if (require.main === module) {
    app.init().run('test')
        .then(result => console.log('Result:', result))
        .catch(err => console.error('Error:', err));
}
`;
    
    // Write the large file
    fs.writeFileSync(path.join(TEST_DIR, TEST_FILENAME), content);
    
    // Calculate file size
    const stats = fs.statSync(path.join(TEST_DIR, TEST_FILENAME));
    const fileSize = stats.size;
    const fileSizeKB = (fileSize / 1024).toFixed(2);
    
    console.log(`Test file generated: ${fileSizeKB} KB`);
    console.log(`Estimated tokens: ~${Math.ceil(fileSize * 0.25)}`);
    
    return {
        filePath: path.join(TEST_DIR, TEST_FILENAME),
        fileSize: fileSize
    };
}

// Test the compression functionality
async function testCompression() {
    console.log('=== Testing Compression Tools ===');
    
    // Generate a large test file
    const { filePath, fileSize } = generateLargeFile();
    
    // Compress the file
    console.log('\nCompressing test file...');
    const outputPath = path.join(TEST_DIR, COMPRESSED_FILENAME);
    
    const result = processFile(filePath, outputPath);
    
    if (result.success) {
        // Calculate compression stats
        const compressionRatio = ((fileSize - result.compressedSize) / fileSize * 100).toFixed(2);
        
        console.log('\n=== Compression Results ===');
        console.log(`Original file: ${(fileSize / 1024).toFixed(2)} KB (~${Math.ceil(fileSize * 0.25)} tokens)`);
        console.log(`Compressed file: ${(result.compressedSize / 1024).toFixed(2)} KB (~${result.estimatedTokens} tokens)`);
        console.log(`Compression ratio: ${compressionRatio}%`);
        console.log(`Original file: ${filePath}`);
        console.log(`Compressed file: ${outputPath}`);
        
        console.log('\n✅ Test completed successfully');
        console.log('You can compare the original and compressed files to see what content was preserved.');
    } else {
        console.error('❌ Compression test failed:', result.error);
    }
}

// Run the test
testCompression();
