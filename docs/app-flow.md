# 🚀 App Flow – KBN

This document outlines the latest application flow in the KBN platform after authentication, focusing on user journey paths, real-time role assignment, privilege checks, and redirection logic.

---

## 📋 Overview

The KBN application uses a dynamic flow to direct users to different screens based on authentication status, assigned roles, and privilege levels. Real-time Firestore listeners ensure users are redirected as soon as their role or permissions change, providing a seamless experience.

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
                               │  listener)      │         └────────┬────────┘
                               └─────────────────┘                  │
                                                      ┌─────────────┴─────────────┐
                                                      │                           │
                                                      ▼                           ▼
                                          ┌─────────────────┐         ┌─────────────────┐
                                          │                 │         │                 │
                                          │  Standard User  │         │ Privileged User │
                                          │  Dashboard      │         │  Overview Page  │
                                          └─────────────────┘         └─────────────────┘
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
| `src/modules/dashboard/Overview.tsx`      | Overview page for privileged users                      |
| `src/utils/roleUtils.ts`                  | Utilities for role and permission management             |

---

## 🔀 User Flow Paths

### 1. New User Flow

1. User authenticates with Firebase.
2. If profile is incomplete (missing required fields):
   - Redirected to `/complete-profile` page.
   - User selects their type (Employee or Visitor) and completes profile information.
   - Profile is saved with role set to `PENDING`.
3. Redirected to `/role-check`.
4. System checks for assigned role in user profile.
5. If role is `PENDING`:
   - Redirected to the Pending page (`/pending`).
   - Message: "Waiting for admin approval".
   - Real-time Firestore listener detects role assignment.
   - Once assigned, user is automatically redirected to the correct landing page (no manual refresh needed).

### 2. Privileged User Flow

1. User logs in and is checked for profile completion.
2. If profile is complete, redirected to `/role-check`.
3. System confirms assigned role.
4. Privilege level is checked (role category or specific permissions).
5. If privileged:
   - Redirected to `/overview`.
   - Administrative dashboard and controls are shown.

### 3. Standard User Flow

1. User logs in and is checked for profile completion.
2. If profile is complete, redirected to `/role-check`.
3. System confirms assigned role.
4. If standard permissions:
   - Redirected to `/dashboard`.
   - Only relevant features are displayed.

---

## ⚙️ Implementation Details

- **Profile Completion:**
  - Different form fields based on user type (Employee/Visitor).
  - Validates and stores profile information in Firestore.
  - Sets initial role as `PENDING` for admin approval.
- **Redirection Logic:**
  - Managed by `useRedirectLogic` hook.
  - Handles authentication, profile completion checks, role, and privilege checks.
  - Uses `navigate()` for route changes.
- **Privilege Determination:**
  - Checks both role categories (e.g., PRIVILEGED, ADMIN, SUPER_ADMIN) and specific permissions.
  - Uses helpers from `roleUtils.ts`.
- **Real-time Role Assignment:**
  - Firestore listener on user profile document (in `PendingPage`).
  - Automatically redirects user when role changes from `PENDING`.
- **Best Practices:**
  - Show loading indicators during checks.
  - Handle missing/incomplete user data gracefully.
  - Add/remove Firestore listeners to prevent memory leaks.
  - Default to least privilege if unsure.
  - Cache role info in Redux to reduce DB reads.
  - Provide clear feedback for pending/approval states.
  - Handle offline scenarios.

---

## 🔗 Related Documentation

- [Authentication Flow Documentation](./authentication-flow.md)
- [Roles and Permissions Documentation](./roles-and-permissions.md)
- [User Journey Documentation](./user-journey.md)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
