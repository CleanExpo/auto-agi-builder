// Fix for missing ClientProvider and AuthProvider contexts
const fs = require('fs');
const path = require('path');

console.log('Creating fix for ClientProvider and AuthProvider contexts...');

// Path to the contexts directory
const contextsDir = path.join('deployment', 'frontend', 'contexts');
const appFile = path.join('deployment', 'frontend', 'pages', '_app.js');

// Create ClientProvider
const clientProviderContent = `
import React, { createContext, useContext, useState } from 'react';

const ClientContext = createContext();

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}

export function ClientProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);

  const value = {
    clients,
    setClients,
    currentClient,
    setCurrentClient,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}
`;

// Create AuthProvider (enhanced version of what might be missing)
const authProviderContent = `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Check if the user is authenticated on page load
  useEffect(() => {
    // This would normally fetch the logged-in user from an API endpoint
    // For now we'll just simulate it
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      // This would normally make an API call to authenticate
      // Simulated login
      setUser({ email, name: 'User', role: 'admin' });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    router.push('/auth/login');
  };
  
  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
`;

// Update to app.js to include providers
function updateAppJs(appFilePath) {
  try {
    if (!fs.existsSync(appFilePath)) {
      console.log(`File not found: ${appFilePath}`);
      return false;
    }

    let content = fs.readFileSync(appFilePath, 'utf8');
    
    // Check if providers already exist
    if (content.includes('ClientProvider') && content.includes('AuthProvider')) {
      console.log('App file already contains providers');
      return true;
    }
    
    // Add imports
    let updatedContent = content;
    
    if (!content.includes('import { ClientProvider }')) {
      // Find the last import and add after it
      const lastImportIndex = content.lastIndexOf('import');
      const endOfImportIndex = content.indexOf('\n', lastImportIndex);
      
      if (lastImportIndex !== -1 && endOfImportIndex !== -1) {
        updatedContent = 
          content.substring(0, endOfImportIndex + 1) + 
          "import { ClientProvider } from '../contexts/ClientProvider';\n" +
          "import { AuthProvider } from '../contexts/AuthProvider';\n" +
          content.substring(endOfImportIndex + 1);
      }
    }
    
    // Wrap the component with providers
    // This is a simplistic approach - in real apps, this would need more care
    // Find the return statement
    const returnIndex = updatedContent.indexOf('return');
    if (returnIndex !== -1) {
      const openBraceIndex = updatedContent.indexOf('{', returnIndex);
      const closeBraceIndex = updatedContent.lastIndexOf('}');
      
      if (openBraceIndex !== -1 && closeBraceIndex !== -1) {
        const returnStatement = updatedContent.substring(returnIndex, openBraceIndex + 1);
        const componentContent = updatedContent.substring(openBraceIndex + 1, closeBraceIndex);
        
        updatedContent = 
          updatedContent.substring(0, returnIndex) + 
          returnStatement + 
          '\n      <AuthProvider>\n        <ClientProvider>\n' + 
          componentContent + 
          '        </ClientProvider>\n      </AuthProvider>\n' +
          updatedContent.substring(closeBraceIndex);
      }
    }
    
    fs.writeFileSync(appFilePath, updatedContent, 'utf8');
    console.log(`Updated ${appFilePath} with provider wrappers`);
    return true;
  } catch (error) {
    console.error(`Error updating ${appFilePath}:`, error);
    return false;
  }
}

try {
  // Create contexts directory if it doesn't exist
  if (!fs.existsSync(contextsDir)) {
    fs.mkdirSync(contextsDir, { recursive: true });
    console.log(`Created directory: ${contextsDir}`);
  }

  // Create ClientProvider file
  fs.writeFileSync(path.join(contextsDir, 'ClientProvider.js'), clientProviderContent.trim(), 'utf8');
  console.log('Created ClientProvider.js');
  
  // Create AuthProvider file
  fs.writeFileSync(path.join(contextsDir, 'AuthProvider.js'), authProviderContent.trim(), 'utf8');
  console.log('Created AuthProvider.js');
  
  // Update _app.js to include providers
  updateAppJs(appFile);
  
  console.log('Successfully created and configured providers!');
} catch (error) {
  console.error('Error fixing providers:', error);
  process.exit(1);
}
