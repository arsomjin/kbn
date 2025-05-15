# 🧭 Navigation Structure – KBN

This document describes the navigation and routing setup for the KBN platform, outlining how routes are organized, protected, and rendered within the application.

---

## 🗂️ Navigation Overview

The navigation is managed using **React Router v6** and is defined in `src/navigation/AppRouter.tsx`. The routing structure supports authentication, role-based access, and modular layouts.

```
/src/navigation/AppRouter.tsx
├── <BrowserRouter>
│   └── <Routes>
│       ├── "*"                        # Catch-all: Redirect to home
│       ├── "/role-check"              # Role-based redirect after authentication
│       ├── "/auth"                    # Auth layout (public routes)
│       │   ├── login                  # Login page
│       │   ├── signup                 # Registration page
│       │   ├── reset-password         # Password recovery
│       │   └── verification           # Email verification
│       ├── "/logout"                  # Protected logout route
│       ├── "/pending"                 # For users with PENDING role
│       ├── "/complete-profile"        # For users with incomplete profiles
│       ├── "/overview"                # For privilege users
│       ├── "/province/:provinceId"    # Province-specific routes
│       │   ├── dashboard              # Province dashboard
│       │   ├── settings               # Province settings
│       │   ├── reports                # Province reports
│       │   └── [other province pages] # Other province-specific routes
│       └── "/"                        # Main protected layout
│           ├── index                  # Landing page (redirects by role)
│           ├── landing                # General landing page
│           ├── dashboard              # GENERAL_MANAGER, PROVINCE_MANAGER
│           ├── branch-dashboard       # BRANCH_MANAGER only
│           ├── profile                # User profile management
│           ├── province/*            # Province-specific routes
│           │   ├── dashboard         # Province dashboard
│           │   ├── settings          # Province settings
│           │   └── reports           # Province reports
│           ├── admin/*               # Admin routes
│           │   ├── review-users      # User approval
│           │   ├── users             # User management
│           │   ├── send-notification # Send notifications
│           │   ├── provinces         # Province management
│           │   ├── branches          # Branch management
│           │   └── employees/*       # Employee management
│           │       ├── new           # Create employee
│           │       ├── :id/edit      # Edit employee
│           │       └── :id           # View employee details
│           ├── about                  # About page
│           ├── developer              # Developer info (DEVELOPER role)
│           ├── review-users           # User approval (admin roles)
│           ├── send-notification      # Send notifications (admin roles)
│           └── [other protected pages]# Additional role-protected routes
```

---

## 🔒 Route Protection & Layouts

The application implements several protection mechanisms for routes:

- **RequireAuth**: Guards routes for authenticated users, redirects unauthenticated users to `/auth/login`.
- **ProfileGuard**: Only allows users with incomplete profiles to access `/complete-profile`.
- **PendingGuard**: Only allows users with the PENDING role to access `/pending`.
- **PermissionProtectedRoute**: Guards routes based on specific permissions, redirecting unauthorized users.
- **ProtectedRoute**: Checks authentication, profile completion, allowed roles, and minimum privilege level.
- **Private**: Restricts access to users in a specific role category (e.g., ADMIN, PRIVILEGE, DEVELOPER).
- **PublicOnlyRoute**: Prevents authenticated users from accessing public auth routes.
- **ProvinceGuard**: Verifies if a user has access to the requested province, redirecting to permitted provinces if not.

- **Role Hierarchy Enforcement**: Access controls respect the defined role hierarchy:
  ```
  DEVELOPER > SUPER_ADMIN > PRIVILEGE > GENERAL_MANAGER > PROVINCE_ADMIN > 
  PROVINCE_MANAGER > BRANCH_MANAGER > LEAD > USER/BRANCH > PENDING > GUEST
  ```

- **Permission Context**: Components access permission checking via the PermissionContext with utility functions:
  - `hasPermission(permissionString)` - Checks if user has a specific permission
  - `hasRole(roleString)` - Checks if user has a specific role or higher in hierarchy
  - `hasProvinceAccess(provinceId)` - Checks if user has access to the specified province

---

## 📌 Key Routes

| Path                      | Component/Layout          | Access Control / Notes                                        |
|---------------------------|--------------------------|---------------------------------------------------------------|
| `/role-check`             | RoleCheck                | Post-authentication role-based redirection                    |
| `/auth/login`             | LoginPage                | Public (no auth)                                              |
| `/auth/signup`            | RegisterPage             | Public (no auth)                                              |
| `/auth/reset-password`    | ForgotPasswordPage       | Public (no auth)                                              |
| `/auth/verification`      | Verification             | Public (no auth)                                              |
| `/pending`                | PendingPage              | Only users with PENDING role                                  |
| `/complete-profile`       | CompleteProfilePage      | Only users with incomplete profiles                           |
| `/dashboard`              | Dashboard                | All authenticated users                                       |
| `/profile`                | Profile                  | All authenticated users                                       |
| `/province/*`             | ProvinceLayout           | Users with province access                                    |
| `/admin/*`                | AdminRoutes              | Admin roles (PROVINCE_ADMIN, SUPER_ADMIN, GENERAL_MANAGER)    |
| `/admin/review-users`     | UserReview               | PROVINCE_ADMIN, SUPER_ADMIN, GENERAL_MANAGER                  |
| `/admin/users`            | UserRoleManager          | PROVINCE_ADMIN, SUPER_ADMIN, GENERAL_MANAGER                  |
| `/admin/send-notification`| ComposeNotification      | Admin roles                                                   |
| `/admin/provinces`        | ProvincesManagement      | PRIVILEGE, SUPER_ADMIN                                        |
| `/admin/branches`         | BranchesManagement       | BRANCH_MANAGE permission                                      |
| `/admin/employees/*`      | EmployeeManagement       | USER_VIEW permission                                          |

---

## ⚙️ Navigation Components

- **AppRouter**: Main router component that defines all routes and layouts.
- **RequireAuth**: Wrapper for routes requiring authentication.
- **ProfileGuard**: Ensures only users with incomplete profiles can access `/complete-profile`.
- **PendingGuard**: Ensures only users with PENDING role can access `/pending`.
- **PermissionProtectedRoute**: Protects routes based on specific permissions.
- **ProtectedRoute**: Implements comprehensive route guarding based on authentication, profile completion, roles, and privilege levels.
- **ProvinceGuard**: Component that verifies province access permissions.
- **PublicOnlyRoute**: Prevents authenticated users from accessing public routes.
- **MainLayout**: Main application layout for authenticated users.
- **ProvinceLayout**: Layout for province-specific routes with province context.
- **RoleCheck**: Determines redirection based on user's role after authentication.
- **NotFound**: Catch-all for undefined or unauthorized routes.

---

## 🌐 Multi-Province Navigation

The KBN platform supports multiple provinces, with province-specific routes and access controls:

### Province Route Protection

All province-specific routes are protected using the ProvinceGuard component:

```tsx
<Route
  path="/province/*"
  element={
    <RequireAuth>
      <ProvinceGuard>
        <ProvinceLayout>
          <Outlet />
        </ProvinceLayout>
      </ProvinceGuard>
    </RequireAuth>
  }
>
  {/* Province-specific routes */}
  <Route path="dashboard" element={<ProvinceDashboard />} />
  <Route path="settings" element={<ProvinceSettings />} />
  <Route path="reports" element={<ProvinceReports />} />
</Route>
```

### Province Access Control

Routes can be protected with province-specific permissions using:

```tsx
// Route protection with province check
<Route
  path="/province/:provinceId/protected-route"
  element={
    <PermissionProtectedRoute 
      requiredPermission={PERMISSIONS.SOME_PERMISSION}
      provinceCheck={(params) => hasProvinceAccess(params.provinceId)}
    >
      <ProtectedComponent />
    </PermissionProtectedRoute>
  }
/>
```

### Province Context Provider

The application provides province context throughout the app:

```tsx
<ProvinceContext.Provider
  value={{
    currentProvinceId,
    setCurrentProvinceId,
    accessibleProvinces,
    hasProvinceAccess,
    currentProvince
  }}
>
  {children}
</ProvinceContext.Provider>
```

---

## 📝 Notes

- **Dynamic Redirection**: The landing page (`/`) uses `getLandingPage(userProfile)` to redirect users based on their role and profile status.
- **Real-time Role Updates**: Firestore listeners and Redux state are used for real-time updates and redirection when a user's role or profile status changes.
- **Permission-Based UI**: Navigation menu items and UI components conditionally render based on user permissions.
- **Numeric Privilege Comparison**: The `ROLE_HIERARCHY` object is used to compare roles numerically for access control decisions.
- **Legacy Auth Routes**: `/login`, `/register`, `/forgot-password` redirect to `/auth/*` equivalents.
- **Province Access Checks**: All data requests include province filtering to ensure users only access data from provinces they have permissions for.
- **Default Province Selection**: If a user has access to multiple provinces, the system selects their primary province by default.
- **Province Route Parameters**: All province-specific routes include the provinceId parameter used for access control and data filtering.

---
