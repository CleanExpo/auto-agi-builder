import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts';

/**
 * ProtectedRoute component
 * 
 * Wraps protected pages to ensure only authenticated users can access them.
 * If user is not authenticated, redirects to login page.
 * Optionally supports role-based access control.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page content
 * @param {Array<string>} props.requiredRoles - Optional roles required to access the page
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check if authentication is still loading
    if (isLoading) {
      return;
    }
    
    // Authentication check
    if (!isAuthenticated) {
      // Remember the page they tried to access for redirect after login
      const returnUrl = encodeURIComponent(router.asPath);
      router.push(`/auth/login?redirect=${returnUrl}`);
      return;
    }
    
    // Role-based access check (if roles specified)
    if (requiredRoles.length > 0) {
      // Check if user has at least one of the required roles
      const hasRequiredRole = user?.roles?.some(role => 
        requiredRoles.includes(role)
      );
      
      if (!hasRequiredRole) {
        router.push('/dashboard');
        return;
      }
    }
    
    // Mark as authorized if all checks pass
    setAuthorized(true);
  }, [isAuthenticated, isLoading, router, user, requiredRoles]);
  
  // Show loading while checking authentication
  if (isLoading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Render protected page content
  return children;
};

/**
 * WithProtection HOC
 * 
 * Higher-order component to wrap pages that need protection.
 * Can be used to protect entire pages without modifying their code.
 * 
 * @param {React.ComponentType} Component - The component to protect
 * @param {Object} options - Protection options
 * @param {Array<string>} options.requiredRoles - Optional roles required to access the page
 */
export const withProtection = (Component, options = {}) => {
  const ProtectedComponent = (props) => (
    <ProtectedRoute requiredRoles={options.requiredRoles || []}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  // Copy display name for better debugging
  ProtectedComponent.displayName = `Protected(${Component.displayName || Component.name || 'Component'})`;
  
  return ProtectedComponent;
};

export default ProtectedRoute;
