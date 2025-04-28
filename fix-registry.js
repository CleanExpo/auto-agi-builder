// Fix for MCP registry.ts file
const fs = require('fs');
const path = require('path');

console.log('Fixing registry.ts syntax error...');

const registryPath = path.join('deployment', 'frontend', 'lib', 'mcp', 'registry.ts');

try {
  // Read the current content
  let content = fs.readFileSync(registryPath, 'utf8');
  
  // Fix the syntax error on line 152-153
  content = content.replace(
    /registry\?: ContextRegistry;\s*\}\> = \(\{ children, registry = globalRegistry \}\) =>/,
    'registry?: ContextRegistry;\n}): React.ReactElement => ({ children, registry = globalRegistry }) =>'
  );
  
  // Write the fixed content back
  fs.writeFileSync(registryPath, content);
  
  console.log('Successfully fixed registry.ts syntax error!');
} catch (error) {
  console.error('Error fixing registry.ts:', error);
  process.exit(1);
}
