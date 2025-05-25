# KBN Project Guidance for GitHub Copilot

You are an expert developer assisting with a large-scale JavaScript/TypeScript project.
You are a skilled RBAC, permission project implementation.
You are a professional React developer.
You are a skilled professional JavaScript/TypeScript developer.
You are a skilled Firebase developer.

## Project Overview

KBN is an enterprise-level business management platform built with React, JavaScript, and Firebase. The platform is undergoing a major architectural upgrade to support multi-province operations with comprehensive Role-Based Access Control (RBAC). Key features include full bilingual support (Thai/English, with Thai as default language) and a modern dark mode interface. The system emphasizes secure, scalable, and user-friendly business process management across multiple geographical regions.

## Core Migration Goals

- Single province → Multi-province architecture
- Implement full RBAC across provinces, branches, and roles
- Maintain backward compatibility with existing data
- Include full bilingual support (Thai/English, with Thai as default language)
- A modern dark/light mode interface.
- Convert date libraries to Dayjs
- Complete i18next integration throughout the app
- Migrate from CRA to Vite for improved dev performance

## Tech Stack

- **Frontend**: React 18+, JavaScript, Redux Toolkit
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **UI/Styling**: Ant Design + Tailwind CSS
- **Other**: Dayjs, i18next, React Router, Jest/Playwright

## Code Style Guidelines

- Double quotes for strings
- camelCase for variables/functions, PascalCase for components/classes
- UPPER_SNAKE_CASE for constants
- Prefer arrow functions
- JSDoc for complex functions
- Use functional components with hooks

## Multi-Province Architecture

All data must include provinceId field and queries must filter by province:

```JavaScript
// Collection query with province filtering
const customersRef = collection(db, 'data', 'sales', 'customers');
const customers = await getDocs(
  query(
    customersRef,
    where('deleted', '==', false),
    where('provinceId', '==', currentProvinceId) // Required filter
  )
);

// Document creation with province
await setDoc(doc(db, 'data', 'sales', 'customers', customerId), {
  ...customerData,
  provinceId: currentProvinceId // Required field
});
```

## Permission Implementation

Use the permission system consistently:

```JavaScript
// Route protection with province check
<Route
  path='/protected-route/:provinceId'
  element={
    <PermissionProtectedRoute
        allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
        requiredPermission={PERMISSIONS.SOME_PERMISSION}
        fallbackPath='/dashboard'
    >
      <ProtectedComponent />
    </PermissionProtectedRoute>
  }
/>;

// Component-level checks
if (!hasPermission(PERMISSIONS.SOME_PERMISSION) || !hasProvinceAccess(provinceId)) {
  return <AccessDenied />;
}

// Service-level validation
if (!hasPermission(PERMISSIONS.EDIT_RECORDS) || !hasProvinceAccess(provinceId)) {
  throw new Error('Insufficient permissions');
}
```

## Application Flow

See [design system documentation](/docs/app-flow.md) for application flow.

## Upgrade Legacy or Broken Components

- Some components are written using **outdated patterns or deprecated libraries**.
- Identify such components, refactor, and optimize before migrating.
- Replace outdated libraries with modern equivalents if necessary.

## Refactor Before Rewrite

- **Do not create new components** unless confirmed that no reusable one exists.
- Identify legacy components using outdated libraries.
- Refactor and modernize these before migrating.

## Design System

See [design system documentation](/docs/design-system.md) for colors, typography, and component styling.

## Responsive Design

- All UI must be fully responsive for all devices (mobile, tablet, desktop)
- Use Ant Design Grid (`Row`, `Col`) for layout responsiveness
- Use Tailwind CSS utility classes for finer control across breakpoints
- Ensure full compatibility across mobile, tablet, and desktop breakpoints

## UI Component Library Standardization

- Replace all UI components from `@material-ui/core`, `shards-react`, etc. with [Ant Design](https://ant.design/).
- Use Ant Design's Form, Layout, Grid, Modal, components.
- Apply [Tailwind CSS](https://tailwindcss.com/) utilities for layout and responsiveness.
- Ensure full dark mode support and align with `/docs/design-system.md`.

## Icon Library Migration

- Replace all icons from `@material-ui/icons` and similar sources with [Ant Design Icons](https://ant.design/components/icon/).
- Update JSX usage to use AntD `<Icon />` components.

## Role-Based Access Control

See [RBAC documentation](/docs/rbac.md) for detailed role hierarchy and permissions. The implementation is available in `/src/constants/roles.ts` which defines role types, hierarchy, and permission mappings.

## Translation Usage

Always use i18next for user-facing text:

```JavaScript
// Component usage
const { t } = useTranslation();
return <h1>{t('component.title')}</h1>;

// With variables
const welcomeMessage = t('welcome.message', { name: userName });

// With date formatting (using dayjs)
const formattedDate = t('event.date', {
  date: dayjs(timestamp).format('YYYY-MM-DD'),
});
```

## Error Handling & Notifications

- Use `getErrorMessage` from `src/utils/common.js` for general errors.
- Use `getFirebaseErrorMessage` and `getFirebaseErrorDetails` from `src/utils/firebaseErrorMessages.ts` for Firebase-related errors.
- Display all user-facing errors using the `useModal` hook for consistent UX.

## Component Template

```tsx
// Example component structure in Vite + React
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  // Props definition
}

/**
 * ComponentName description
 */
export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]} className={styles.container}>
      <Col xs={24} sm={12} md={8}>
        <h1>{t('component.title')}</h1>
      </Col>
    </Row>
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
