## Prompt for Enhancing Navigation, Routing, and Authorization

**Objective:**

Refine and enhance the existing React application's navigation, routing, and authorization system based on the specifications outlined in the `docs/app-flow.md` document. The primary goals are to ensure users are correctly routed based on their status (authentication, profile completion, role, privilege) and to implement robust protection against unauthorized access, including direct URL navigation.

**Context:**

Refer to the attached `docs/app-flow.md` file, which details:
*   The post-authentication user flow diagram.
*   Key components involved (`AppRouter.tsx`, `useRedirectLogic.ts`, `RoleCheck.tsx`, `CompleteProfilePage.tsx`, `PendingPage.tsx`, `Overview.tsx`, `Dashboard.tsx`, `UserReviews.tsx`, `roleUtils.ts`).
*   Specific user flow paths (New User, Privileged User, Standard User).
*   Implementation details and best practices.

**Requirements:**

1.  **Implement Robust Route Guarding:**
  *   Create or enhance a mechanism (e.g., a `<ProtectedRoute>` component, HOC, or logic within `AppRouter.tsx` / `useRedirectLogic.ts`) to protect routes.
  *   This guard should check:
    *   Authentication status.
    *   Profile completion status.
    *   Assigned role (`PENDING`, standard roles, privilege roles).
    *   Privilege level (derived from role or specific permissions via `roleUtils.ts`).
  *   Ensure users attempting to access unauthorized routes via direct URL entry are redirected appropriately (e.g., to login, complete profile, pending page, or a generic "Not Authorized" page).

2.  **Refine Redirection Logic (`useRedirectLogic.ts` / `AppRouter.tsx`):**
  *   Ensure the redirection logic accurately reflects the flow diagram and user paths described in `app-flow.md`.
  *   Handle the transition from `PENDING` role smoothly, integrating the real-time listener update from `PendingPage.tsx` to trigger redirection without manual intervention.
  *   Manage loading states effectively while performing checks (auth, profile, role).

3.  **Route Configuration:**
  *   Demonstrate how to configure routes within `AppRouter.tsx` to specify the required authorization level (e.g., `requiresAuth: true`, `requiresProfileComplete: true`, `allowedRoles: ['ADMIN', 'PRIVILEGE']`, `minPrivilegeLevel: 'EDITOR'`).

4.  **Address Specific Scenarios:**
  *   **Unauthenticated User:** Accessing any protected route redirects to Login.
  *   **Authenticated, Profile Incomplete:** Accessing routes requiring a complete profile redirects to `/complete-profile`.
  *   **Authenticated, Profile Complete, Role `PENDING`:** Accessing routes requiring an assigned role redirects to `/pending`.
  *   **Authenticated, Profile Complete, Assigned Role (Standard/Privileged):** Accessing routes redirects based on role/privilege checks. Unauthorized access attempts lead to redirection (e.g., back to their dashboard or an "Unauthorized" page).

5.  **Incorporate Best Practices:**
  *   Apply relevant best practices mentioned in `app-flow.md` (loading indicators, error handling, listener cleanup, default to least privilege, potential caching).

**Request:**

Provide code examples and implementation strategies for:
*   The proposed route guarding mechanism (`<ProtectedRoute>` or similar).
*   Updates to `AppRouter.tsx` showing route configuration with authorization requirements.
*   Potential modifications or enhancements to `useRedirectLogic.ts` to centralize and handle the complex redirection and authorization checks based on the user's state.
*   How to integrate the real-time role update from the `PendingPage` listener with the central routing/redirect logic.