// ============================================================================
// FRONTEND ROLE-BASED ACCESS CONTROL
// Medical Records Management System
// ============================================================================

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  patient_id: number;
  full_name: string;
  national_id: number;
  gender_code: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  record_id: number;
  patient_id: number;
  health_center_code: string;
  status_code: string;
  created_by: number;
  last_modified_by: number;
  created_at: string;
  updated_at: string;
}

export interface RecordTransfer {
  transfer_id: number;
  record_id: number;
  sender_id: number;
  recipient_id: number;
  transfer_notes?: string;
  transferred_at: string;
  received_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export type UserRole = 'admin' | 'employee';

export const ROLES = {
  ADMIN: 'admin' as const,
  EMPLOYEE: 'employee' as const,
} as const;

// ============================================================================
// PERMISSION MATRIX
// ============================================================================

export const PERMISSIONS = {
  // User Management
  USERS: {
    VIEW: [ROLES.ADMIN],
    CREATE: [ROLES.ADMIN],
    UPDATE: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN],
  },
  
  // Patient Management
  PATIENTS: {
    VIEW: [ROLES.ADMIN, ROLES.EMPLOYEE],
    CREATE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    UPDATE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    DELETE: [ROLES.ADMIN], // Employee cannot delete
  },
  
  // Medical Records
  RECORDS: {
    VIEW: [ROLES.ADMIN, ROLES.EMPLOYEE],
    CREATE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    UPDATE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    DELETE: [ROLES.ADMIN], // Employee cannot delete
  },
  
  // Record Transfers
  TRANSFERS: {
    VIEW: [ROLES.ADMIN, ROLES.EMPLOYEE],
    CREATE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    UPDATE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    DELETE: [ROLES.ADMIN], // Employee cannot delete
    RECEIVE: [ROLES.ADMIN, ROLES.EMPLOYEE],
    COMPLETE: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
} as const;

// ============================================================================
// ROUTE ACCESS CONTROL
// ============================================================================

export const ROUTE_ACCESS = {
  // Public routes (no authentication required)
  PUBLIC: [
    '/api/login',
    '/api/static',
    '/api/static/types',
    '/api/static/{type}',
    '/api/static/{type}/{code}',
  ],
  
  // Admin-only routes
  ADMIN_ONLY: [
    '/api/users',
    '/api/users/{id}',
  ],
  
  // Routes accessible to both admin and employee
  EMPLOYEE_AND_ADMIN: [
    '/api/profile',
    '/api/logout',
    '/api/patients',
    '/api/patients/{id}',
    '/api/records',
    '/api/records/{id}',
    '/api/transfers',
    '/api/transfers/{id}',
    '/api/transfers/{id}/receive',
    '/api/transfers/{id}/complete',
  ],
} as const;

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

export class PermissionChecker {
  /**
   * Check if user has a specific role
   */
  static hasRole(user: User, role: UserRole): boolean {
    return user.role_code === role;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User): boolean {
    return this.hasRole(user, ROLES.ADMIN);
  }

  /**
   * Check if user is employee
   */
  static isEmployee(user: User): boolean {
    return this.hasRole(user, ROLES.EMPLOYEE);
  }

  /**
   * Check if user can perform a specific action
   */
  static canPerformAction(user: User, permission: keyof typeof PERMISSIONS, action: string): boolean {
    const allowedRoles = PERMISSIONS[permission][action as keyof typeof PERMISSIONS[typeof permission]];
    return allowedRoles.includes(user.role_code as UserRole);
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: User, route: string): boolean {
    // Public routes are always accessible
    if (ROUTE_ACCESS.PUBLIC.some(publicRoute => route.startsWith(publicRoute))) {
      return true;
    }

    // Admin-only routes
    if (ROUTE_ACCESS.ADMIN_ONLY.some(adminRoute => route.startsWith(adminRoute))) {
      return this.isAdmin(user);
    }

    // Employee and admin routes
    if (ROUTE_ACCESS.EMPLOYEE_AND_ADMIN.some(sharedRoute => route.startsWith(sharedRoute))) {
      return this.isAdmin(user) || this.isEmployee(user);
    }

    // Default: deny access
    return false;
  }
}

// ============================================================================
// API ENDPOINT PERMISSIONS
// ============================================================================

export const API_ENDPOINT_PERMISSIONS = {
  // Authentication endpoints
  'POST /api/login': { roles: [], public: true },
  'POST /api/register': { roles: [ROLES.ADMIN], public: false },
  'POST /api/logout': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'GET /api/profile': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  
  // Static data endpoints
  'GET /api/static': { roles: [], public: true },
  'GET /api/static/types': { roles: [], public: true },
  'GET /api/static/{type}': { roles: [], public: true },
  'GET /api/static/{type}/{code}': { roles: [], public: true },
  
  // User management endpoints (admin only)
  'GET /api/users': { roles: [ROLES.ADMIN], public: false },
  'GET /api/users/{id}': { roles: [ROLES.ADMIN], public: false },
  'POST /api/users': { roles: [ROLES.ADMIN], public: false },
  'PUT /api/users/{id}': { roles: [ROLES.ADMIN], public: false },
  'DELETE /api/users/{id}': { roles: [ROLES.ADMIN], public: false },
  
  // Patient management endpoints
  'GET /api/patients': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'GET /api/patients/{id}': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'POST /api/patients': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'PUT /api/patients/{id}': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'DELETE /api/patients/{id}': { roles: [ROLES.ADMIN], public: false },
  
  // Medical record endpoints
  'GET /api/records': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'GET /api/records/{id}': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'POST /api/records': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'PUT /api/records/{id}': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'DELETE /api/records/{id}': { roles: [ROLES.ADMIN], public: false },
  
  // Record transfer endpoints
  'GET /api/transfers': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'GET /api/transfers/{id}': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'POST /api/transfers': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'PUT /api/transfers/{id}': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'DELETE /api/transfers/{id}': { roles: [ROLES.ADMIN], public: false },
  'POST /api/transfers/{id}/receive': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
  'POST /api/transfers/{id}/complete': { roles: [ROLES.ADMIN, ROLES.EMPLOYEE], public: false },
} as const;

// ============================================================================
// NAVIGATION MENU CONFIGURATION
// ============================================================================

export const NAVIGATION_MENU = {
  // Menu items visible to all authenticated users
  COMMON: [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ],
  
  // Menu items visible to both admin and employee
  SHARED: [
    { label: 'Patients', path: '/patients', icon: '👥' },
    { label: 'Medical Records', path: '/records', icon: '📋' },
    { label: 'Record Transfers', path: '/transfers', icon: '📤' },
  ],
  
  // Menu items visible only to admin
  ADMIN_ONLY: [
    { label: 'User Management', path: '/users', icon: '👥' },
    { label: 'System Settings', path: '/settings', icon: '⚙️' },
    { label: 'Audit Logs', path: '/audit', icon: '📊' },
  ],
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PermissionChecker,
  NAVIGATION_MENU,
  API_ENDPOINT_PERMISSIONS,
};
