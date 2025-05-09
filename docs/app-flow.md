# 🚀 App Flow – KBN

wThis document outlines the latest application flow in the KBN platform after authentication, focusing on user journey paths, real-time role assignment, province-based access, privilege checks, and redirection logic.

---

## 📋 Overview

The KBN application uses a dynamic flow to direct users to different screens based on authentication status, assigned roles, province access, and privilege levels. Real-time Firestore listeners ensure users are redirected as soon as their role, province access, or permissions change, providing a seamless experience.

---

## 🔄 Post-Authentication Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Auth Success   │────▶│  Profile        │────▶│    Role Check   │
│                 │     │  Complete?      │     │                 │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │                       │
                                 │                       │
                                 ▼                       │
                       ┌────────────────────┐            │
                       │                    │            │
                       │  Complete Profile  │            │
                       │ (Employee/Visitor) │            │
                       │                    │            │
                       └─────────┬──────────┘            │
                                 │                       │
                                 │                       │
                                 │          ┌────────────┴──────────┐
                                 │          │                       │
                                 ▼          ▼                       ▼
                               ┌─────────────────┐         ┌─────────────────┐
                               │                 │         │                 │
                               │  Pending Page   │         │ Check Privilege │
                               │ (Real-time      │         │     Level       │
                               │  listener)      │         │                 │
                               └─────────────────┘         └────────┬────────┘
                                                                    │
                                          ┌─────────────────────────┴───────────────────┐
                                          │                                             │
                                          ▼                                             ▼
                                  ┌─────────────────┐                       ┌─────────────────┐
                                  │                 │                       │                 │
                                  │  Standard User  │                       │ Privileged User │
                                  │                 │                       │                 │
                                  └────────┬────────┘                       └────────┬────────┘
                                           │                                         │
                                           ▼                                         ▼
                                  ┌─────────────────┐                       ┌─────────────────┐
                                  │                 │                       │                 │
                                  │ Check Province  │                       │ Access to All   │
                                  │     Access      │                       │   Provinces     │
                                  │                 │                       │                 │
                                  └────────┬────────┘                       └────────┬────────┘
                                           │                                         │
                                           ▼                                         ▼
                                  ┌─────────────────┐                       ┌─────────────────┐
                                  │                 │                       │                 │
                                  │  Standard User  │                       │ Privileged User │
                                  │  Dashboard      │                       │  Overview Page  │
                                  │                 │                       │                 │
                                  └─────────────────┘                       └─────────────────┘
```

---

## 🗂️ Key Flow Components

| Component                                 | Purpose                                                  |
| ----------------------------------------- | -------------------------------------------------------- |
| `src/navigation/router/AppRouter.tsx`     | Main router managing redirects based on auth/role status |
| `src/hooks/useRedirectLogic.ts`           | Custom hook handling redirection logic                   |
| `src/modules/auth/RoleCheck.tsx`          | Component for checking user role status                  |
| `src/modules/auth/CompleteProfilePage.tsx`| Page for new users to complete their profile information |
| `src/modules/auth/PendingPage.tsx`        | Page for users waiting for role assignment (with real-time listener) |
| `src/modules/dashboard/Overview.tsx`      | Overview page for privilege users                      |
| `src/utils/roleUtils.ts`                  | Utilities for role and permission management             |
| `src/hooks/useProvinceAccess.ts`          | Hook for checking user's province access permissions     |
| `src/contexts/ProvinceContext.tsx`        | Context provider for province-related data              |

---

## 🔀 User Flow Paths

### 1. New User Flow

1. User authenticates with Firebase.
2. If profile is incomplete (missing required fields):
   - Redirected to `/complete-profile` page.
   - User selects their type (Employee or Visitor) and completes profile information.
   - Profile is saved with role set to `PENDING`.
   - Province access is initially empty or set to default province if specified.
3. Redirected to `/role-check`.
4. System checks for assigned role in user profile.
5. If role is `PENDING`:
   - Redirected to the Pending page (`/pending`).
   - Message: "Waiting for admin approval".
   - Real-time Firestore listener detects role assignment and province access changes.
   - Once assigned, user is automatically redirected to the correct landing page (no manual refresh needed).

### 2. Privileged User Flow

1. User logs in and is checked for profile completion.
2. If profile is complete, redirected to `/role-check`.
3. System confirms assigned role.
4. Privilege level is checked (role category or specific permissions).
5. If privilege (e.g., ADMIN, SUPER_ADMIN):
   - User has access to all provinces by default.
   - User can select any province from a dropdown in the header/navigation.
   - If no province is selected, they're prompted to select one or the default province is auto-selected.
   - Redirected to `/province/:provinceId/overview`.
   - Administrative dashboard and controls are shown with data filtered by selected province.
   - Can switch between provinces at any time via province selector component.

### 3. Standard User Flow

1. User logs in and is checked for profile completion.
2. If profile is complete, redirected to `/role-check`.
3. System confirms assigned role.
4. Privilege level is checked (role category or specific permissions).
5. If standard permissions:
   - Province access is verified:
     - If user has access to multiple provinces, they're prompted to select a province.
     - If user has access to only one province, it's auto-selected.
     - If no province access is granted, an error message is displayed.
   - Once province is determined, redirected to `/province/:provinceId/dashboard`.
   - Only relevant features for the selected province are displayed.

### 4. Province Switching

1. User can switch provinces from the application header/navigation if they have access to multiple provinces.
2. When switching:
   - Current state is saved.
   - Province context is updated.
   - User is redirected to the appropriate page for the newly selected province.
   - Permission checks are reapplied for the new province context.
   - For privilege users, all provinces are available in the selector.
   - For standard users, only provinces they have explicit access to are shown.

---

## ⚙️ Implementation Details

- **Profile Completion:**
  - Different form fields based on user type (Employee/Visitor).
  - Validates and stores profile information in Firestore.
  - Sets initial role as `PENDING` for admin approval.
  - Associates with province(s) if known at registration time.
- **Province-based Routing:**
  - All protected routes include province ID as a parameter (`/province/:provinceId/...`).
  - Province context is maintained throughout the application.
  - Navigation components reflect the current province context.
- **Redirection Logic:**
  - Managed by `useRedirectLogic` hook.
  - Handles authentication, profile completion checks, province access, role, and privilege checks.
  - Uses `navigate()` for route changes.
- **Province Access Validation:**
  - Uses `useProvinceAccess` hook to check if user has access to a specific province.
  - Standard users: Only granted access to provinces explicitly assigned to them.
  - Privileged users: Automatically granted access to all provinces.
  - Integrated with permission system for granular province-level access control.
- **Privilege Determination:**
  - Checks both role categories (e.g., PRIVILEGE, ADMIN, SUPER_ADMIN) and specific permissions.
  - Applies province-specific permission rules.
  - Uses helpers from `roleUtils.ts`.
  - Example validation:
    ```typescript
    const isPrivileged = hasPrivilegedRole(userRole) || 
                          hasPermission(PERMISSIONS.ADMIN_ACCESS);
    
    // For standard users, check province access
    const hasAccess = isPrivileged || 
                      (userProvinces && userProvinces.includes(currentProvinceId));
    ```
- **Real-time Role Assignment:**
  - Firestore listener on user profile document (in `PendingPage`).
  - Automatically redirects user when role changes from `PENDING` or when province access is updated.
- **Data Filtering:**
  - All queries include province filtering to ensure users only see data they have access to.
  - Example:
    ```typescript
    const customersRef = collection(db, "data", "sales", "customers");
    const customers = await getDocs(query(
      customersRef,
      where("deleted", "==", false),
      where("provinceId", "==", currentProvinceId), // Required filter
      orderBy("created", "desc")
    ));
    ```
- **Best Practices:**
  - Show loading indicators during checks.
  - Handle missing/incomplete user data gracefully.
  - Add/remove Firestore listeners to prevent memory leaks.
  - Default to least privilege if unsure.
  - Cache role and province info in Redux to reduce DB reads.
  - Provide clear feedback for pending/approval states.
  - Handle offline scenarios.
  - Never display data from provinces user doesn't have access to.

---

## 🔗 Related Documentation

- [Authentication Flow Documentation](./authentication-flow.md)
- [Roles and Permissions Documentation](./roles-and-permissions.md)
- [User Journey Documentation](./user-journey.md)
- [Multi-Province Architecture](./data-schema-detail.md)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
