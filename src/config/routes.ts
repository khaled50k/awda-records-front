import { Home, Users, Heart, FileText, Send, User, Settings, Database } from 'lucide-react';

// Simple role definitions
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  DOCTOR: 'doctor',
  NURSE: 'nurse'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Simple route interface with protection
export interface Route {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  protected: boolean; // Whether this route requires authentication
  adminOnly: boolean; // Whether this route is admin-only
}

// Route definitions - ONE ROUTE PER PAGE
export const ROUTES = {
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PATIENTS: '/admin/patients',
  ADMIN_MEDICAL_RECORDS: '/admin/medical-records',
  ADMIN_MEDICAL_RECORDS_CREATE: '/admin/medical-records/create',
  ADMIN_TRANSFERS: '/admin/transfers',
  ADMIN_STATIC_DATA: '/admin/static-data',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_SETTINGS: '/admin/settings'
} as const;

// Simple route configuration with protection
const routes: Route[] = [
  {
    path: ROUTES.ADMIN_DASHBOARD,
    label: 'لوحة المدير',
    icon: Home,
    roles: [ROLES.ADMIN],
    protected: true,
    adminOnly: true
  },
  {
    path: ROUTES.ADMIN_USERS,
    label: 'إدارة المستخدمين',
    icon: Users,
    roles: [ROLES.ADMIN],
    protected: true,
    adminOnly: true
  },
  {
    path: ROUTES.ADMIN_STATIC_DATA,
    label: 'البيانات الثابتة',
    icon: Database,
    roles: [ROLES.ADMIN],
    protected: true,
    adminOnly: true
  },
  {
    path: ROUTES.ADMIN_PATIENTS,
    label: 'إدارة المرضى',
    icon: Heart,
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE],
    protected: true,
    adminOnly: false
  },
  {
    path: ROUTES.ADMIN_MEDICAL_RECORDS,
    label: 'السجلات الطبية',
    icon: FileText,
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE],
    protected: true,
    adminOnly: false
  },
  {
    path: ROUTES.ADMIN_TRANSFERS,
    label: 'إدارة التحويلات',
    icon: Send,
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE],
    protected: true,
    adminOnly: false
  },
];

// Simple utility functions
export const getRoutesForRole = (role: UserRole | null): Route[] => {
  if (!role) return [];
  return routes.filter(route => route.roles.includes(role));
};

export const hasRouteAccess = (userRole: UserRole | null, routePath: string): boolean => {
  if (!userRole) return false;
  
  // First check if it's an exact match in the main routes
  const route = routes.find(r => r.path === routePath);
  if (route) {
    return route.roles.includes(userRole);
  }
  
  // If route is not specified in main routes, allow access for all roles
  // This makes the function dynamic and allows sub-routes to work
  return true;
};

export const isRouteProtected = (routePath: string): boolean => {
  const route = routes.find(r => r.path === routePath);
  return route ? route.protected : true; // Default to protected for security
};

export const isRouteAdminOnly = (routePath: string): boolean => {
  const route = routes.find(r => r.path === routePath);
  return route ? route.adminOnly : false;
};

export const getDefaultRouteForRole = (role: UserRole | null): string => {
  if (!role) return ROUTES.LOGIN;
  
  const roleRoutes = {
    [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
    [ROLES.EMPLOYEE]: ROUTES.ADMIN_PATIENTS,
    [ROLES.DOCTOR]: ROUTES.ADMIN_PATIENTS,
    [ROLES.NURSE]: ROUTES.ADMIN_PATIENTS
  };
  
  return roleRoutes[role] || ROUTES.LOGIN;
};

// Simple feature access control
export const canViewPatient = (userRole: UserRole | null): boolean => {
  return userRole === ROLES.ADMIN;
};

export const canEditPatient = (userRole: UserRole | null): boolean => {
  return [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE].includes(userRole as UserRole);
};

export const canDeletePatient = (userRole: UserRole | null): boolean => {
  return userRole === ROLES.ADMIN;
};

export { routes };
