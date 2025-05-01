/**
 * Authentication middleware for Auto AGI Builder
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

/**
 * Higher-order component for protecting routes
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} - The protected component
 */
export function withAuth(Component) {
  const ProtectedRoute = (props) => {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();
    
    useEffect(() => {
      // Check if the path is public
      const isPublicPath = publicPaths.some(path => 
        router.pathname === path ||
        router.pathname.startsWith('/api/')
      );
      
      // Redirect to login if not authenticated and not on a public path
      if (!loading && !isAuthenticated && !isPublicPath) {
        router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath));
      }
    }, [router, isAuthenticated, loading]);
    
    // Show loading state
    if (loading) {
      return <div>Loading...</div>;
    }
    
    // Return the component if authenticated or on public path
    return <Component {...props} />;
  };
  
  // Copy getInitialProps if it exists
  if (Component.getInitialProps) {
    ProtectedRoute.getInitialProps = Component.getInitialProps;
  }
  
  return ProtectedRoute;
}

/**
 * Check if user has required permissions
 * @param {string[]} requiredPermissions - Required permissions
 * @returns {boolean} - Whether the user has the required permissions
 */
export function hasPermission(requiredPermissions) {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  return requiredPermissions.every(permission => 
    user.permissions.includes(permission)
  );
}

/**
 * Higher-order component for role-based access control
 * @param {React.Component} Component - The component to wrap
 * @param {string[]} requiredPermissions - Required permissions
 * @returns {React.Component} - The protected component
 */
export function withPermission(Component, requiredPermissions) {
  return function PermissionProtectedRoute(props) {
    const router = useRouter();
    const hasRequiredPermission = hasPermission(requiredPermissions);
    
    useEffect(() => {
      if (!hasRequiredPermission) {
        router.push('/dashboard?error=insufficient_permissions');
      }
    }, [router, hasRequiredPermission]);
    
    if (!hasRequiredPermission) {
      return <div>You don't have permission to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
}
