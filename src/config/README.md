# Simple & Efficient Routing System

A minimal, secure routing system with role-based access control using **ONE ROUTE PER PAGE** and **feature-based permissions**.

## 🎯 **Key Features**

- **Single Route Per Page**: No duplicate routes, clean structure
- **Role-Based Access**: Automatic filtering based on user roles
- **Feature Permissions**: Show/hide specific features within pages
- **Minimal Code**: Simple and maintainable
- **Type Safe**: Full TypeScript support

## 🏗️ **Architecture**

### Files Structure
```
src/
├── config/
│   └── routes.ts          # Route definitions & permissions
├── hooks/
│   ├── useRoutes.ts       # Main routing hook
│   └── useRoleAccess.ts   # Role-based access control
└── components/
    └── layout/
        └── Sidebar.tsx    # Navigation using routes
```

### Route Configuration
```typescript
// ONE ROUTE PER PAGE with role-based access
{
  path: '/admin/patients',
  label: 'إدارة المرضى',
  icon: Heart,
  roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE]
}
```

## 🚀 **Usage Examples**

### 1. **In Components - Show/Hide Features**
```tsx
import { useRoleAccess } from '../hooks/useRoleAccess';

const PatientsPage = () => {
  const { isAdmin } = useRoleAccess();
  
  return (
    <div>
      {/* View button - Only visible to admins */}
      {isAdmin && (
        <Button onClick={handleView}>
          <Eye className="w-4 h-4" />
        </Button>
      )}
      
      {/* Edit button - Visible to all authenticated users */}
      <Button onClick={handleEdit}>
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  );
};
```

### 2. **In Navigation - Filter Routes**
```tsx
import { useRoutes } from '../hooks/useRoutes';

const Sidebar = () => {
  const { routes, getUserRoleInfo } = useRoutes();
  const { display, type, permissions } = getUserRoleInfo;
  
  return (
    <nav>
      {routes.map(route => (
        <NavLink key={route.path} to={route.path}>
          <route.icon />
          <span>{route.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
```

### 3. **Route Protection**
```tsx
import { useRoleAccess } from '../hooks/useRoleAccess';

const ProtectedComponent = () => {
  const { hasAccess } = useRoleAccess();
  
  if (!hasAccess('/admin/users')) {
    return <div>Access Denied</div>;
  }
  
  return <UserManagement />;
};
```

## 🔐 **Security Features**

### Role-Based Access Control
- **Admin**: Full access to all features
- **Employee/Doctor/Nurse**: Limited access to patient management
- **Automatic filtering**: Routes and features filtered by role

### Feature Permissions
```typescript
// In routes.ts - Define what each role can do
export const canViewPatient = (userRole: UserRole | null): boolean => {
  return userRole === ROLES.ADMIN;
};

export const canEditPatient = (userRole: UserRole | null): boolean => {
  return [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.DOCTOR, ROLES.NURSE].includes(userRole as UserRole);
};
```

## 📝 **Adding New Routes**

### 1. **Add Route Definition**
```typescript
// In routes.ts
export const ROUTES = {
  // ... existing routes
  NEW_FEATURE: '/admin/new-feature'
} as const;
```

### 2. **Add Route Configuration**
```typescript
// In routes array
{
  path: ROUTES.NEW_FEATURE,
  label: 'الميزة الجديدة',
  icon: NewIcon,
  roles: [ROLES.ADMIN, ROLES.EMPLOYEE]
}
```

### 3. **Use in Component**
```tsx
const { hasAccess } = useRoleAccess();

if (hasAccess('/admin/new-feature')) {
  // Show new feature
}
```

## 🎨 **Customization**

### Role Display Names
```typescript
// In useRoutes.ts - Customize role display
const roleInfo = {
  [ROLES.ADMIN]: {
    display: 'لوحة المدير',
    type: 'مدير النظام',
    permissions: 'صلاحيات كاملة'
  }
  // ... other roles
};
```

### Default Routes
```typescript
// In routes.ts - Set where each role lands
const roleRoutes = {
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.EMPLOYEE]: ROUTES.ADMIN_PATIENTS
};
```

## ✅ **Benefits**

1. **Simple**: One route per page, clear structure
2. **Secure**: Role-based access control
3. **Efficient**: Minimal code, fast performance
4. **Maintainable**: Easy to add/modify routes
5. **Type Safe**: Full TypeScript support
6. **Scalable**: Easy to extend with new roles/features

## 🔧 **Best Practices**

1. **Always use hooks**: Use `useRoleAccess()` or `useRoutes()` instead of hardcoding
2. **Conditional rendering**: Use `{isAdmin && <Component />}` for role-based UI
3. **Route protection**: Check access before rendering protected content
4. **Consistent naming**: Use the same route constants everywhere
5. **Role validation**: Always validate user roles before granting access

---

**This system provides a clean, secure, and efficient way to handle routing and permissions with minimal code and maximum security.**
