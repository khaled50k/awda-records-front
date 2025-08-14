import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  getRoutesForRole, 
  hasRouteAccess, 
  getDefaultRouteForRole,
  Route, 
  UserRole,
  ROLES
} from '../config/routes';

// Type guard to check if user has nested structure
const hasNestedUser = (user: unknown): user is { user: { role?: { code: string }, role_code?: string } } => {
  return typeof user === 'object' && user !== null && 'user' in user && user.user !== null;
};

// Type guard to check if user has direct structure
const hasDirectUser = (user: unknown): user is { role?: { code: string }, role_code?: string } => {
  return typeof user === 'object' && user !== null && !('user' in user);
};

export const useRoutes = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Extract user role from nested or direct structure
  const userRole = useMemo((): UserRole | null => {
    if (!user) return null;
    
    let roleCode: string | null = null;
    
    // Handle nested structure: { user: { role_code: "admin", role: { code: "admin" } } }
    if (hasNestedUser(user)) {
      roleCode = user.user.role?.code || user.user.role_code || null;
    }
    
    // Handle direct structure: { role_code: "admin", role: { code: "admin" } }
    if (hasDirectUser(user)) {
      roleCode = user.role?.code || user.role_code || null;
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
  
  // Get default route for user role
  const defaultRoute = useMemo(() => {
    if (!userRole) return '/login';
    return getDefaultRouteForRole(userRole);
  }, [userRole]);
  
  // Check if user has access to a specific route
  const hasAccess = useMemo(() => {
    return (routePath: string) => {
      if (!userRole) return false;
      return hasRouteAccess(userRole, routePath);
    };
  }, [userRole]);
  
  // Get user role display information
  const getUserRoleInfo = useMemo(() => {
    if (!userRole) return { display: 'لوحة التحكم', type: 'مستخدم', permissions: 'صلاحيات عادية' };
    
    const roleInfo = {
      [ROLES.ADMIN]: {
        display: 'لوحة المدير',
        type: 'مدير النظام',
        permissions: 'صلاحيات كاملة'
      },
      [ROLES.EMPLOYEE]: {
        display: 'لوحة الموظف',
        type: 'موظف',
        permissions: 'صلاحيات محدودة'
      },
      [ROLES.DOCTOR]: {
        display: 'لوحة الموظف',
        type: 'موظف',
        permissions: 'صلاحيات محدودة'
      },
      [ROLES.NURSE]: {
        display: 'لوحة الموظف',
        type: 'موظف',
        permissions: 'صلاحيات محدودة'
      }
    };
    
    return roleInfo[userRole] || { display: 'لوحة التحكم', type: 'مستخدم', permissions: 'صلاحيات عادية' };
  }, [userRole]);
  
  return {
    userRole,
    routes,
    defaultRoute,
    hasAccess,
    getUserRoleInfo,
    isAuthenticated: !!user
  };
};
