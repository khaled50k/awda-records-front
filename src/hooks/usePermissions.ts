import { useMemo } from 'react';
import { User } from '../types/api';
import { PermissionChecker, PERMISSIONS, ROLES } from '../lib/permissions';

/**
 * Hook for checking user permissions
 */
export function usePermissions(user: User | null) {
  return useMemo(() => {
    if (!user) {
      return {
        isAdmin: false,
        isEmployee: false,
        canViewUsers: false,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canViewPatients: false,
        canCreatePatients: false,
        canUpdatePatients: false,
        canDeletePatients: false,
        canViewRecords: false,
        canCreateRecords: false,
        canUpdateRecords: false,
        canDeleteRecords: false,
        canViewTransfers: false,
        canCreateTransfers: false,
        canUpdateTransfers: false,
        canDeleteTransfers: false,
        canReceiveTransfers: false,
        canCompleteTransfers: false,
      };
    }

    return {
      isAdmin: PermissionChecker.isAdmin(user),
      isEmployee: PermissionChecker.isEmployee(user),
      
      // User permissions
      canViewUsers: PermissionChecker.canPerformAction(user, 'USERS', 'VIEW'),
      canCreateUsers: PermissionChecker.canPerformAction(user, 'USERS', 'CREATE'),
      canUpdateUsers: PermissionChecker.canPerformAction(user, 'USERS', 'UPDATE'),
      canDeleteUsers: PermissionChecker.canPerformAction(user, 'USERS', 'DELETE'),
      
      // Patient permissions
      canViewPatients: PermissionChecker.canPerformAction(user, 'PATIENTS', 'VIEW'),
      canCreatePatients: PermissionChecker.canPerformAction(user, 'PATIENTS', 'CREATE'),
      canUpdatePatients: PermissionChecker.canPerformAction(user, 'PATIENTS', 'UPDATE'),
      canDeletePatients: PermissionChecker.canPerformAction(user, 'PATIENTS', 'DELETE'),
      
      // Record permissions
      canViewRecords: PermissionChecker.canPerformAction(user, 'RECORDS', 'VIEW'),
      canCreateRecords: PermissionChecker.canPerformAction(user, 'RECORDS', 'CREATE'),
      canUpdateRecords: PermissionChecker.canPerformAction(user, 'RECORDS', 'UPDATE'),
      canDeleteRecords: PermissionChecker.canPerformAction(user, 'RECORDS', 'DELETE'),
      
      // Transfer permissions
      canViewTransfers: PermissionChecker.canPerformAction(user, 'TRANSFERS', 'VIEW'),
      canCreateTransfers: PermissionChecker.canPerformAction(user, 'TRANSFERS', 'CREATE'),
      canUpdateTransfers: PermissionChecker.canPerformAction(user, 'TRANSFERS', 'UPDATE'),
      canDeleteTransfers: PermissionChecker.canPerformAction(user, 'TRANSFERS', 'DELETE'),
      canReceiveTransfers: PermissionChecker.canPerformAction(user, 'TRANSFERS', 'RECEIVE'),
      canCompleteTransfers: PermissionChecker.canPerformAction(user, 'TRANSFERS', 'COMPLETE'),
    };
  }, [user]);
}

/**
 * Hook for checking if user can perform a specific action
 */
export function useCanPerformAction(user: User | null, permission: keyof typeof PERMISSIONS, action: string) {
  return useMemo(() => {
    if (!user) return false;
    return PermissionChecker.canPerformAction(user, permission, action);
  }, [user, permission, action]);
}

/**
 * Hook for checking if user has a specific role
 */
export function useHasRole(user: User | null, role: keyof typeof ROLES) {
  return useMemo(() => {
    if (!user) return false;
    return PermissionChecker.hasRole(user, ROLES[role]);
  }, [user, role]);
}

/**
 * Hook for checking if user is admin
 */
export function useIsAdmin(user: User | null) {
  return useMemo(() => {
    if (!user) return false;
    return PermissionChecker.isAdmin(user);
  }, [user]);
}

/**
 * Hook for checking if user is employee
 */
export function useIsEmployee(user: User | null) {
  return useMemo(() => {
    if (!user) return false;
    return PermissionChecker.isEmployee(user);
  }, [user]);
}

/**
 * Hook for building navigation menu based on user permissions
 */
export function useNavigationMenu(user: User | null) {
  return useMemo(() => {
    const { NAVIGATION_MENU } = require('../lib/permissions');
    
    const menuItems = [
      ...NAVIGATION_MENU.COMMON,
      ...NAVIGATION_MENU.SHARED,
    ];

    // Add admin-only menu items if user is admin
    if (user && PermissionChecker.isAdmin(user)) {
      menuItems.push(...NAVIGATION_MENU.ADMIN_ONLY);
    }

    return menuItems;
  }, [user]);
}
