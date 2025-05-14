# KBN Project Guidance for GitHub Copilot

## Project Overview
KBN is a business management platform built with React, TypeScript, and Firebase. We're migrating from JavaScript to TypeScript and extending the platform to support multiple provinces with comprehensive RBAC.

## Core Migration Goals
- JavaScript → TypeScript with proper typing
- Single province → Multi-province architecture
- Implement full RBAC across provinces, branches, and roles
- Maintain backward compatibility with existing data
- Convert date libraries to Luxon
- Complete i18next integration throughout the app

## Tech Stack
- **Frontend**: React 18+, TypeScript, Redux Toolkit
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **UI/Styling**: Ant Design + Tailwind CSS
- **Other**: Luxon, i18next, React Router, Jest/Playwright

## Code Style Guidelines
- Double quotes for strings
- Use Yarn (not npm)
- camelCase for variables/functions, PascalCase for components/classes
- UPPER_SNAKE_CASE for constants
- Prefer arrow functions
- Explicit return types in TypeScript
- JSDoc for complex functions
- Use functional components with hooks

## Multi-Province Architecture
All data must include provinceId field and queries must filter by province:

```typescript
// Collection query with province filtering
const customersRef = collection(db, "data", "sales", "customers");
const customers = await getDocs(query(
  customersRef,
  where("deleted", "==", false),
  where("provinceId", "==", currentProvinceId), // Required filter
  orderBy("created", "desc")
));

// Document creation with province
await setDoc(doc(db, "data", "sales", "customers", customerId), {
  ...customerData,
  provinceId: currentProvinceId // Required field
});
```

## Permission Implementation
Use the permission system consistently:

```tsx
// Route protection with province check
<Route
  path="/protected-route/:provinceId"
  element={
    <PermissionProtectedRoute 
      requiredPermission={PERMISSIONS.SOME_PERMISSION}
      provinceCheck={(params) => hasProvinceAccess(params.provinceId)}
    >
      <ProtectedComponent />
    </PermissionProtectedRoute>
  }
/>

// Component-level checks
if (!hasPermission(PERMISSIONS.SOME_PERMISSION) || !hasProvinceAccess(provinceId)) {
  return <AccessDenied />;
}

// Service-level validation
if (!hasPermission(PERMISSIONS.EDIT_RECORDS) || !hasProvinceAccess(provinceId)) {
  throw new Error("Insufficient permissions");
}
```

## Translation Usage
Always use i18next for user-facing text:

```tsx
// Component usage
const { t } = useTranslation();
return <h1>{t("component.title")}</h1>;

// With variables
const welcomeMessage = t("welcome.message", { name: userName });

// With date formatting (using Luxon)
const formattedDate = t("event.date", { 
  date: DateTime.fromMillis(timestamp).toFormat("yyyy-MM-dd")
});
```

## Error Handling
Use consistent error handling pattern:

```typescript
try {
  // Operation
} catch (error) {
  console.error("Context:", error);
  const message = error instanceof Error ? error.message : "Unexpected error";
  notification.error({
    message: "Error Title",
    description: message,
  });
}
```

## Component Template
```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ComponentName.module.css";

interface ComponentNameProps {
  // Props definition
}

/**
 * ComponentName description
 */
export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.container}>
      {/* Component content with translations */}
      <h1>{t("component.title")}</h1>
    </div>
  );
};
```

## Firestore Data Structure
See [detailed data schema](/docs/data-schema-detail.md) for collection structure.

## Design System
See [design system documentation](/docs/design-system.md) for colors, typography, and component styling.

## Responsive Design
- All UI must be fully responsive for all devices (mobile, tablet, desktop)
- Use Ant Design and Tailwind CSS responsive utilities
- Test layouts on common breakpoints

## Role-Based Access Control
See [RBAC documentation](/docs/rbac.md) for detailed role hierarchy and permissions. The implementation is available in `/src/constants/roles.ts` which defines role types, hierarchy, and permission mappings.

## Refer to Project Documentation
- [Detailed Data Schema](/docs/data-schema-detail.md) - Firestore collection structure, interfaces, and query patterns
- [Design System](/docs/design-system.md) - Colors, typography, and component styling guidelines
- [Role-Based Access Control](/docs/rbac.md) - Role hierarchy and permission implementation
- [Translation System](/docs/translation-system.md) - i18next integration and usage patterns
- [User Journey](/docs/user-journey.md) - Core application flows
- [Authentication Flow](/docs/authentication-flow.md) - Login, registration, and permission checking
- [Navigation Structure](/docs/navigation.md) - Route configuration and protection
- [Notification System](/docs/notification-system.md)
- [State Management](/docs/state-management.md)

## Firestore Security Rules
The current rules are too permissive. Let's enhance them with proper RBAC:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function hasProvinceAccess(provinceId) {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return isAuthenticated() && (
        user.role in ['SUPER_ADMIN', 'DEVELOPER', 'PRIVILEGE', 'GENERAL_MANAGER'] ||
        user.provinceId == provinceId
      );
    }
    
    function hasPermission(permission) {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return isAuthenticated() && (
        user.permissions[permission] == true ||
        hasRole('SUPER_ADMIN') ||
        hasRole('DEVELOPER')
      );
    }

    // User collection rules
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == userId ||
        hasPermission('USER_VIEW')
      );
      allow write: if isAuthenticated() && (
        request.auth.uid == userId ||
        hasPermission('USER_EDIT')
      );
    }

    // Data collection rules with province check
    match /data/{provinceId}/{collection}/{document} {
      allow read: if isAuthenticated() && hasProvinceAccess(provinceId);
      allow write: if isAuthenticated() && hasProvinceAccess(provinceId) && (
        hasPermission('DATA_EDIT') ||
        hasPermission('DATA_CREATE')
      );
    }

    // Other collections with similar pattern
    match /{collection}/{document} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && hasPermission('DATA_EDIT');
    }
  }
}
```

## Type Definitions
Let's create type definitions for the RBAC system:

```typescript
// Define role types
type Role = 'SUPER_ADMIN' | 'DEVELOPER' | 'PRIVILEGE' | 'GENERAL_MANAGER';

// Define permission types
type Permission = string;

// Define user type
type User = {
  role: Role;
  provinceId?: string;
  permissions: Record<Permission, boolean>;
};

// Define RBAC functions
function isAuthenticated(): boolean;
function hasRole(role: Role): boolean;
function hasProvinceAccess(provinceId: string): boolean;
function hasPermission(permission: Permission): boolean;
```
