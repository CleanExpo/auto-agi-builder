// Fix for MCP registry.ts file
const fs = require('fs');
const path = require('path');

console.log('Fixing registry.ts syntax error...');

const registryPath = path.join('deployment', 'frontend', 'lib', 'mcp', 'registry.ts');

try {
  // Read the current content
  let content = fs.readFileSync(registryPath, 'utf8');
  
  // Fix the syntax error by completely rewriting the problematic component
  const regex = /export const RegistryProvider.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*/s;
  const replacement = `export const RegistryProvider: React.FC<{
  children: React.ReactNode;
  registry?: ContextRegistry;
}> = ({ children, registry = globalRegistry }) => {
  return (
    <RegistryContext.Provider value={registry}>
      {children}
    </RegistryContext.Provider>
  );
};`;
  
  content = content.replace(regex, replacement);
  
  // Write the fixed content back
  fs.writeFileSync(registryPath, content);
  
  console.log('Successfully fixed registry.ts syntax error!');
} catch (error) {
  console.error('Error fixing registry.ts:', error);
  process.exit(1);
}
