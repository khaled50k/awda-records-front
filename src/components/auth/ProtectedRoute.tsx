import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  hasRouteAccess, 
  isRouteProtected, 
  isRouteAdminOnly, 
  getDefaultRouteForRole,
  ROUTES 
} from '../../config/routes';
import { UserRole, ROLES } from '../../config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, getProfile, fetchStaticData, user } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // If authenticated, always fetch profile to ensure we have latest user data
        if (isAuthenticated) {
          await getProfile();
          
          // After getting profile, fetch static data for dropdowns and form options
          await fetchStaticData();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // If profile fetch fails, auth state will be cleared automatically
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, getProfile, fetchStaticData]);

  // Show loading spinner while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if route requires authentication
  const routeRequiresAuth = isRouteProtected(location.pathname);
  
  // If route doesn't require auth, render children directly
  if (!routeRequiresAuth) {
    return <>{children}</>;
  }

  // If not authenticated and route requires auth, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Get user role from auth state
  const userRole = (() => {
    if (!user) return null;
    
    let roleCode: string | null = null;
    
    // Handle nested structure: { user: { role_code: "admin", role: { code: "admin" } } }
    if ('user' in user && user.user) {
      const nestedUser = user.user as any;
      roleCode = nestedUser.role?.code || nestedUser.role_code || null;
    }
    
    // Handle direct structure: { role_code: "admin", role: { code: "admin" } }
    if ('role_code' in user || 'role' in user) {
      const directUser = user as any;
      roleCode = directUser.role?.code || directUser.role_code || null;
    }
    
    // Validate role code against allowed roles
    if (roleCode && Object.values(ROLES).includes(roleCode as UserRole)) {
      return roleCode as UserRole;
    }
    
    return null;
  })();

  // Check if route is admin-only and user is not admin
  if (isRouteAdminOnly(location.pathname) && userRole !== ROLES.ADMIN) {
    // Redirect non-admin users to their default route
    const defaultRoute = getDefaultRouteForRole(userRole);
    return <Navigate to={defaultRoute} replace />;
  }

  // Check if user has access to the current route
  if (!hasRouteAccess(userRole, location.pathname)) {
    // Redirect to appropriate dashboard based on user role
    const defaultRoute = getDefaultRouteForRole(userRole);
    return <Navigate to={defaultRoute} replace />;
  }

  // If authenticated and has access, render children
  return <>{children}</>;
}; 