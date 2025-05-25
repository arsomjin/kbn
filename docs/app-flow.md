# 🚀 App Flow – KBN

This document outlines the latest application flow in the KBN platform after authentication, focusing on user journey paths, real-time role assignment, province-based access, privilege checks, and redirection logic.

---

## 📋 Overview

The KBN application uses a dynamic flow to direct users to different screens based on authentication status, assigned roles, province access, and privilege levels. Real-time Firestore listeners ensure users are redirected as soon as their role, province access, or permissions change, providing a seamless experience.

The application supports multi-province architecture with comprehensive RBAC (Role-Based Access Control) system that ensures users only access data and features they have permissions for.

---

## 🔄 Post-Authentication Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Auth Success   │────▶│  Profile        │────▶│    Role Check   │
│                 │     │  Complete?      │     │                 │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │ No                    │ Yes
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
                               │  Pending Page   │         │ Check Permission│
                               │ (Real-time      │         │  & Privilege    │
                               │  listener)      │         │     Level       │
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
                                  │Province-Specific│                       │ Province Select │
                                  │   Dashboard     │                       │   Overview      │
                                  │                 │                       │                 │
                                  └─────────────────┘                       └─────────────────┘
```

---

## 🗂️ Key Flow Components

| Component                                          | Purpose                                                  |
| -------------------------------------------------- | -------------------------------------------------------- |
| `src/navigation/router/AppRouter.tsx`              | Main router managing redirects based on auth/role status |
| `src/hooks/useRedirectLogic.ts`                    | Custom hook handling redirection logic                   |
| `src/modules/auth/RoleCheck.tsx`                   | Component for checking user role status                  |
| `src/modules/auth/CompleteProfilePage.tsx`         | Page for new users to complete their profile information |
| `src/modules/auth/PendingPage.tsx`                 | Page for users waiting for role assignment               |
| `src/modules/dashboard/Overview.tsx`               | Overview page for privileged users                       |
| `src/utils/roleUtils.ts`                           | Utilities for role and permission management             |
| `src/hooks/useProvinceAccess.ts`                   | Hook for checking user's province access permissions     |
| `src/contexts/ProvinceContext.tsx`                 | Context provider for province-related data               |
| `src/constants/roles.ts`                           | Role definitions, hierarchy, and permission mappings     |
| `src/components/auth/PermissionProtectedRoute.tsx` | Route protection with permission checks                  |

---

## 🔀 User Flow Paths

### 1. New User Flow

1. **Authentication**: User authenticates with Firebase.
2. **Profile Check**: System verifies if profile is complete.
3. **Profile Completion** (if incomplete):
   - Redirected to `/complete-profile` page.
   - User selects type (Employee/Visitor) and completes required fields.
   - Profile saved with role set to `PENDING`.
   - Initial province access is empty (requires admin assignment).
4. **Role Assignment Wait**:
   - Redirected to `/pending` page.
   - Real-time Firestore listener monitors user document changes.
   - Displays "Waiting for admin approval" message.
   - Automatic redirect when role/permissions are assigned.

### 2. Privileged User Flow (SUPER_ADMIN, DEVELOPER, PRIVILEGE, GENERAL_MANAGER)

1. **Authentication & Profile Check**: User logs in with complete profile.
2. **Role Verification**: System confirms privileged role assignment.
3. **Permission Check**: Validates user has privileged permissions.
4. **Province Access**:
   - Privileged users have access to all provinces by default.
   - Province selector available in navigation header.
   - Can switch between provinces dynamically.
5. **Landing Page**:
   - If province selected: `/province/:provinceId/overview`
   - If no province: Province selection prompt or default selection.
6. **Features Available**:
   - Administrative controls and dashboards.
   - Cross-province data access and management.
   - User management and role assignment capabilities.

### 3. Standard User Flow (EMPLOYEE, MANAGER, etc.)

1. **Authentication & Profile Check**: User logs in with complete profile.
2. **Role Verification**: System confirms standard role assignment.
3. **Permission Validation**: Checks specific permissions for user role.
4. **Province Access Check**:
   - Validates user has explicit province access.
   - If multiple provinces: Province selection required.
   - If single province: Auto-selection.
   - If no access: Access denied message.
5. **Landing Page**: `/province/:provinceId/dashboard`
6. **Features Available**:
   - Province-specific data and operations only.
   - Limited to assigned permissions within the province.
   - Cannot access other provinces without explicit permission.

### 4. Province Switching Flow

1. **Permission Check**: Verify user can access target province.
2. **Context Update**: Update province context and Redux state.
3. **Route Transition**: Navigate to appropriate page for new province.
4. **Data Refresh**: Reload data filtered for new province.
5. **Permission Revalidation**: Apply province-specific permissions.

---

## ⚙️ Implementation Details

### Profile Completion

- **Dynamic Forms**: Different fields based on user type (Employee/Visitor).
- **Validation**: Form validation with TypeScript interfaces.
- **Storage**: Profile data stored in Firestore users collection.
- **Initial State**: Role set to `PENDING`, empty province access.

### Multi-Province Architecture

- **Route Structure**: All protected routes include provinceId parameter.
- **Data Isolation**: All queries include provinceId filter.
- **Context Management**: Province context maintained throughout app.
- **Permission Inheritance**: Permissions checked at both global and province levels.

### Role-Based Access Control (RBAC)

```typescript
// Example permission checking
const hasPermission = (permission: string): boolean => {
  return (
    user.permissions[permission] || hasPrivilegedRole(user.role) || user.role === 'SUPER_ADMIN'
  );
};

const hasProvinceAccess = (provinceId: string): boolean => {
  return hasPrivilegedRole(user.role) || user.provinces?.includes(provinceId) || false;
};
```

### Real-time Updates

- **Firestore Listeners**: Monitor user document changes.
- **Automatic Redirects**: No manual refresh required for role changes.
- **State Synchronization**: Redux state updated with Firestore changes.

### Data Security

- **Query Filtering**: All data queries include province filtering.
- **Route Protection**: PermissionProtectedRoute component guards routes.
- **Service Validation**: Backend validation of permissions and province access.

```typescript
// Example secure query
const getCustomers = async (provinceId: string) => {
  if (!hasProvinceAccess(provinceId)) {
    throw new Error('Insufficient permissions');
  }

  const customersRef = collection(db, 'data', 'sales', 'customers');
  return await getDocs(
    query(
      customersRef,
      where('deleted', '==', false),
      where('provinceId', '==', provinceId),
      orderBy('created', 'desc'),
    ),
  );
};
```

### Error Handling

- **Graceful Degradation**: Handle missing/incomplete user data.
- **Clear Feedback**: Informative messages for pending/denied states.
- **Offline Support**: Basic offline functionality with cached data.
- **Security Defaults**: Default to least privilege when uncertain.

### Performance Optimization

- **State Caching**: Role and province info cached in Redux.
- **Lazy Loading**: Components loaded based on user permissions.
- **Listener Management**: Proper cleanup of Firestore listeners.
- **Minimal Queries**: Optimized database queries with proper indexing.

---

## 🔐 Security Considerations

### Firestore Security Rules

- Province-based data access restrictions.
- Role-based read/write permissions.
- User document protection.
- Audit trail for sensitive operations.

### Client-Side Protection

- Route guards with permission checks.
- Component-level permission validation.
- State protection against unauthorized access.
- Secure token handling and refresh.

### Backend Validation

- Server-side permission verification.
- Cross-province access prevention.
- Data integrity checks.
- Audit logging for compliance.

---

## 🌐 Internationalization (i18n)

All user-facing text uses i18next translation system:

- Error messages and notifications.
- Form labels and validation messages.
- Navigation and button text.
- Status and confirmation messages.

Example usage:

```typescript
const { t } = useTranslation();
const errorMessage = t('auth.errors.insufficientPermissions');
```

---

## 📱 Responsive Design

- **Mobile-First**: All flows optimized for mobile devices.
- **Progressive Enhancement**: Desktop features built on mobile foundation.
- **Touch-Friendly**: Appropriate touch targets and gestures.
- **Adaptive Layouts**: Content adapts to screen size and orientation.

---

## 🔗 Related Documentation

- [Authentication Flow](./authentication-flow.md) - Detailed authentication process
- [RBAC System](./rbac.md) - Role hierarchy and permission implementation
- [Data Schema](./data-schema-detail.md) - Multi-province data structure
- [Navigation Structure](./navigation.md) - Route configuration and protection
- [Translation System](./translation-system.md) - i18next implementation
- [State Management](./state-management.md) - Redux store structure
- [User Journey](./user-journey.md) - Complete user experience flows
