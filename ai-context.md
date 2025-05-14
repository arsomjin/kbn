# AI Context for Cursor

You are an expert developer assisting with a large-scale migration project.
You are a professional React developer.
You are a skilled Firebase developer.

Please help migrate components from this JavaScript project to TypeScript with full type safety:
🔗 GitHub Repo: https://github.com/arsomjin/kubota-benjapol.git

## Project Overview
KBN is a business management platform built with React, TypeScript, and Firebase. This file serves as an AI reference for Cursor, offering guidance on structure, tech stack, and best practices. We're migrating from JavaScript to TypeScript and extending the platform to support multiple provinces with comprehensive RBAC.

## Core Migration Goals
- JavaScript → TypeScript with proper typing
- Single province → Multi-province architecture
- Implement full RBAC across provinces, branches, and roles
- Maintain backward compatibility with existing data
- Upgrade Legacy or Broken Components
- Convert date libraries to Luxon
- Complete i18next integration throughout the app

## Database Migration Strategy
The project requires a careful database migration approach to ensure zero downtime:

1. **Environment Configuration**
   - Use separate Firebase projects for development and production
   - Maintain `.env.development` and `.env.production` files
   - Never commit environment files to version control
   - Use `env-cmd` for environment-specific builds

2. **Data Structure Compatibility**
   - Maintain identical collection names and document structures
   - Keep the same security rules across environments
   - Export production schema to test database
   - Ensure backward compatibility with existing data

3. **Development Workflow**
   - Use test database for all development work
   - Deploy to test environment using `yarn run build:dev`
   - Test thoroughly before production deployment
   - Use Firebase Emulators for local development

4. **Production Deployment**
   - Deploy to production using `yarn run build`
   - Verify data structure compatibility
   - Maintain existing production system until migration is complete
   - Plan for zero-downtime switchover

## Existing Project Information
To assist with the migration, share the following information about the existing project:

1. **Repository Access**
   - Repository URL or access method
   - Branch information
   - Any specific commit/tag to reference

2. **Key Files to Share**
   - `package.json` for dependencies and scripts
   - Firebase configuration files
   - Main component files
   - Data structure definitions
   - Migration-related files

3. **Documentation**
   The project has comprehensive documentation in the `/docs` folder:
   - `structure.md` - Project folder structure and organization
   - `data-schema-detail.md` - Detailed Firestore data schema
   - `rbac.md` - Role-based access control implementation
   - `authentication-flow.md` - Authentication and authorization flow
   - `navigation.md` - Routing and navigation structure
   - `state-management.md` - Redux store and state management
   - `notification-system.md` - Notification handling
   - `translation-system.md` - i18n implementation
   - `design-system.md` - UI/UX guidelines
   - `user-journey.md` - User flow documentation
   - `api-integration.md` - API integration patterns

4. **Environment Configuration**
   - Environment file structure (without sensitive data)
   - Configuration differences between environments
   - Required environment variables

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

---

## Migration Rules & Component Upgrade Checklist

### 🔁 1. JavaScript → TypeScript Migration
- Convert all `.js` and `.jsx` files to `.ts` or `.tsx`.
- Add explicit prop types, function signatures, and Redux typings.
- Follow naming conventions: `camelCase` for variables, `PascalCase` for components, and `UPPER_SNAKE_CASE` for constants.
- Add JSDoc for utility functions or complex logic.

### 🎨 2. UI Component Library Standardization
- Replace all UI components from `@material-ui/core`, `shards-react`, etc. with [Ant Design](https://ant.design/).
- Use Ant Design's Form, Layout, Grid, Modal, and Table components.
- Apply [Tailwind CSS](https://tailwindcss.com/) utilities for layout and responsiveness.
- Ensure full dark mode support and align with `/docs/design-system.md`.

### 🧩 3. Icon Library Migration
- Replace all icons from `@material-ui/icons` and similar sources with [Ant Design Icons](https://ant.design/components/icon/).
- Update JSX usage to use AntD `<Icon />` components.

### 4. Upgrade Legacy or Broken Components
   - Some components are written using **outdated patterns or deprecated libraries**.
   - Identify such components, refactor, and optimize before migrating.
   - Replace outdated libraries with modern equivalents if necessary.

### 🕓 5. Date/Time Handling
- Replace `moment`, `moment-timezone`, `dayjs`, etc. with [Luxon](https://moment.github.io/luxon/).
- Use `DateTime` for all date parsing, formatting, and manipulation.
- Combine Luxon with i18next for localized formatting.

### 🌐 6. i18next Internationalization
- Migrate all user-facing strings to `t("key")` format.
- Ensure translation keys are present in both `en.json` and `th.json`.
- Use interpolation and pluralization as needed.

### 🏢 7. Multi-Province + RBAC Enforcement
- Always include `provinceId` in Firestore queries and document creation.
- Filter data per province.
- Implement role and permission checks at:
  - Route level
  - Component level
  - Service level
- Follow patterns in `/docs/rbac.md`.

### 🚨 8. Error Handling & Notifications
- Use Ant Design's `notification` and `message` components.
- Display user-friendly messages on catch blocks or API errors.
- Follow global error handling format across all services and UIs.

### 🧼 9. Code Quality Standards
- Double quotes for all strings
- Arrow functions and functional components
- Explicit return types
- Avoid any usage of `any`
- Use `Yarn` for all dependency management

### 📚 10. Refactor Before Rewrite
- **Do not create new components** unless confirmed that no reusable one exists.
- Identify legacy components using outdated libraries.
- Refactor and modernize these before migrating.

---

> 🧠 Tip: Refer to `/docs/*` files for detailed schema, design system, RBAC roles, translation rules, and more.
