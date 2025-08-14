import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoutes } from '../../hooks/useRoutes';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/dashboard'
}) => {
  const { userRole, isAuthenticated, hasAccess } = useRoutes();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to fallback if role is required and user doesn't have access
  if (requiredRole && !hasAccess(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
