# 🔒 Roles and Permissions – KBN

This document outlines the role-based access control (RBAC) system implemented in the KBN platform, helping developers understand how permissions are managed and how to implement permission-based features.

---

## 📋 Overview

KBN implements a comprehensive role-based access control (RBAC) system to manage user permissions across the application. This system enables fine-grained control over which users can access specific features, data, or perform certain actions based on their assigned roles.

---

## 👤 User Roles

The application defines a hierarchical user role system, each with increasing levels of access and capabilities:

| Role | Description | Access Level |
| --- | --- | --- |
| `GUEST` | Unauthenticated or limited access users | Minimal |
| `PENDING` | Users awaiting approval | Very Limited |
| `USER` | Standard authenticated users | Basic |
| `BRANCH` | Branch-level users | Basic |
| `LEAD` | Document reviewers/Team leads | Enhanced Basic |
| `BRANCH_MANAGER` | Branch-level managers | Intermediate |
| `PROVINCE_MANAGER` | Province-level managers | Higher Intermediate |
| `GENERAL_MANAGER` | General managers | Advanced |
| `ADMIN` | Administrative users with extended privileges | High |
| `PRIVILEGE` | Users with special privileges | Very High |
| `SUPER_ADMIN` | System administrators with complete access | Full |
| `DEVELOPER` | Developers with complete system access | Full |

Role definitions are stored in `src/constants/roles.ts`.

---

## 🔑 Permissions

Permissions represent specific actions or access rights within the application. These are assigned to roles to create a comprehensive access control system.

### Permission Categories

Permissions are organized into the following categories:

1. **Data Access** - Controls access to different data types
2. **User Management** - Controls ability to manage users and their roles
3. **Content Management** - Controls ability to create, edit, or delete content
4. **System Configuration** - Controls access to system settings and configurations
5. **Operational Actions** - Controls ability to perform specific operations
6. **Document Management** - Controls access to document creation, review, and approval processes

Permission definitions are stored in `src/constants/Permissions.ts`.

---

## 🔄 Role-Permission Mapping

Each role is assigned a set of permissions, creating a hierarchical access model:

```
┌────────────────┐
│   DEVELOPER    │ ─ All permissions (equivalent to SUPER_ADMIN)
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  SUPER_ADMIN   │ ─ All permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│   PRIVILEGE   │ ─ Privileged permissions + Admin permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│     ADMIN      │ ─ Admin permissions + General Manager permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ GENERAL_MANAGER│ ─ General Manager permissions + Province Manager permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│PROVINCE_MANAGER│ ─ Province Manager permissions + Branch Manager permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│BRANCH_MANAGER  │ ─ Branch Manager permissions + Lead permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│     LEAD       │ ─ Lead permissions + User permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  USER/BRANCH   │ ─ Basic user permissions + Guest permissions
└────────┬───────┘
         │
         ▼
┌────────────────┐
│    PENDING     │ ─ Limited permissions while awaiting approval
└────────┬───────┘
         │
         ▼
┌────────────────┐
│     GUEST      │ ─ Public access permissions
└────────────────┘
```

---

## ⚙️ Implementation

### Permission Checks

The application implements permission checks at various levels:

#### 1. Route-Level Authorization

Protected routes check for specific roles or permissions before allowing access:

```tsx
// Example of permission-based route protection
<Route
  path="/admin/settings"
  element={
    <PermissionProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_EDIT}>
      <AdminSettingsScreen />
    </PermissionProtectedRoute>
  }
/>
```

#### 2. Component-Level Authorization

UI elements conditionally render based on user permissions:

```jsx
// Example of permission-based UI rendering
const ActionButton = () => {
  const { hasPermission } = usePermissions();

  if (hasPermission(PERMISSIONS.CONTENT_EDIT)) {
    return <Button onClick={handleEdit}>Edit Content</Button>;
  }

  return null;
};
```

#### 3. API/Service-Level Authorization

Backend services validate permissions before processing requests:

```javascript
// Example of permission check in a service function
export const updateUserRole = async (userId, newRole) => {
  const currentUser = getCurrentUser();

  if (!hasPermission(currentUser, PERMISSIONS.USER_ROLE_EDIT)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  return await firestore.collection('users').doc(userId).update({
    role: newRole
  });
};
```

### Permission Hooks

The application provides custom hooks for permission management:

```jsx
// Example usage of permission hooks
const MyComponent = () => {
  const { hasRole, hasPermission } = usePermissions();

  if (hasRole(ROLES.PROVINCE_ADMIN)) {
    // Admin-only UI
  }

  if (hasPermission(PERMISSIONS.DATA_EXPORT)) {
    // Show export options
  }

  return (
    // Component rendering
  );
};
```

---

## 🔐 Permission Storage and Management

### User Role Assignment

User roles are stored in the user's profile document in Firestore:

```javascript
// User document structure example
{
  uid: "user123",
  email: "user@example.com",
  role: "BRANCH_MANAGER",
  customPermissions: ["REPORT_VIEW", "USER_INVITE"]  // Optional additional permissions
}
```

### Permission Context

The application uses React Context API to provide permission information throughout the component tree:

```tsx
// PermissionContext provides permission checks to all components
export const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  hasRole: () => false
});
```

### Dynamic Permission Updates

The application supports dynamic updates to user permissions:

1. When a user's role changes, their permissions are automatically updated
2. Custom permissions can be assigned to users independently of their role
3. Permission updates are reflected in real-time across the application

---

## 📝 Best Practices

1. **Always verify permissions server-side**: Don't rely solely on client-side permission checks
2. **Follow the principle of least privilege**: Assign the minimum permissions necessary
3. **Create granular permissions**: Define specific permissions rather than broad access rights
4. **Document role-permission relationships**: Maintain clear documentation of which roles have which permissions
5. **Audit permission checks**: Regularly review and test permission boundaries
6. **Handle permission denials gracefully**: Provide clear feedback when access is denied
7. **Use role inheritance wisely**: Build logical hierarchies but avoid overly complex permission structures
8. **Check privilege level**: Use `getPrivilegeLevel()` utility for numeric comparison of roles

---

## 🧪 Testing Permission Logic

The application includes utilities for testing permission-based features:

```javascript
// Example permission testing utility
export const withTestPermissions = permissions => Component => {
  return props => {
    // Mock the permission context for testing
    return (
      <PermissionContext.Provider value={{ permissions }}>
        <Component {...props} />
      </PermissionContext.Provider>
    );
  };
};
```

Testing permission logic should verify:

1. That protected routes redirect unauthorized users
2. That UI elements properly appear/disappear based on permissions
3. That API calls correctly validate permissions before processing

---

## 🔄 Permission Workflow Examples

### Adding a New Role

1. Define the new role in `src/constants/Roles.js`
2. Map appropriate permissions to the role
3. Update any relevant UI components to recognize the new role
4. Test the role's access boundaries

### Adding a New Permission

1. Define the new permission in `src/constants/Permissions.js`
2. Assign the permission to appropriate roles
3. Implement permission checks where required
4. Test permission enforcement

### Changing User Roles

1. Admin accesses user management interface
2. Selects user and changes role assignment
3. System updates user document in Firestore
4. User's permissions are updated immediately or on next login

---

## 🔗 Related Documentation

- [Authentication Flow](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/authentication-flow.md)
- [Firebase Security Rules Best Practices](https://firebase.google.com/docs/rules/best-practices)
