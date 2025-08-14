import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  ROLES, 
  UserRole, 
  getRoutesForRole, 
  hasRouteAccess, 
  getDefaultRouteForRole,
  isRouteProtected,
  isRouteAdminOnly
} from '../config/routes';

export const useRoleAccess = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Extract user role from auth state
  const userRole = useMemo((): UserRole | null => {
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
  }, [user]);
  
  // Get routes for user role
  const routes = useMemo(() => {
    if (!userRole) return [];
    return getRoutesForRole(userRole);
  }, [userRole]);
  
  // Check if user has access to a specific route
  const hasAccess = useMemo(() => {
    return (routePath: string) => {
      if (!userRole) return false;
      return hasRouteAccess(userRole, routePath);
    };
  }, [userRole]);
  
  // Check if route is protected
  const isProtected = useMemo(() => {
    return (routePath: string) => {
      return isRouteProtected(routePath);
    };
  }, []);
  
  // Check if route is admin-only
  const isAdminOnly = useMemo(() => {
    return (routePath: string) => {
      return isRouteAdminOnly(routePath);
    };
  }, []);
  
  // Get default route for user role
  const defaultRoute = useMemo(() => {
    if (!userRole) return '/login';
    return getDefaultRouteForRole(userRole);
  }, [userRole]);
  
  // Simple role checks
  const isAdmin = userRole === ROLES.ADMIN;
  const isEmployee = userRole ? [ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE].includes(userRole as any) : false;
  const isDoctor = userRole === ROLES.DOCTOR;
  const isNurse = userRole === ROLES.NURSE;
  
  // Check if user can access admin-only routes
  const canAccessAdminRoutes = isAdmin;
  
  return {
    userRole,
    routes,
    hasAccess,
    isProtected,
    isAdminOnly,
    defaultRoute,
    isAdmin,
    isEmployee,
    isDoctor,
    isNurse,
    canAccessAdminRoutes,
    isAuthenticated: !!user
  };
};
