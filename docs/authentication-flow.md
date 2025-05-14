# 🔐 Authentication Flow – KBN

This document outlines the authentication architecture and flow in the KBN platform, helping developers understand how authentication works and how to implement authentication-related features.

---

## 📋 Overview

The KBN platform uses Firebase Authentication for managing user authentication, with Redux Toolkit for state management. Authentication is tightly integrated with real-time role assignment and privilege checks, ensuring users are routed appropriately after login. Multiple sign-in methods are supported.

---

## 🔄 Authentication Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌────────────────────┐
│                 │     │                 │     │                    │
│  Login Screen   │────▶│  Firebase Auth  │────▶│  Auth Success      │
│                 │     │                 │     │  (onAuthStateChanged)
└─────────────────┘     └─────────────────┘     └────────┬───────────┘
                               ▲                         │
                               │                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                    │     │                 │
│    Sign Out     │◀────│ User Dashboard  │◀────│  Load Profile      │◀────│Complete Profile │
│                 │     │                 │     │  + Role Listener   │     │(if incomplete)  │
└─────────────────┘     └─────────────────┘     └────────────────────┘     └─────────────────┘
```

---

## 🗂️ Key Authentication Components

| Component                                 | Purpose                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| `src/modules/auth/`                       | Authentication-related components and logic          |
| `src/modules/auth/CompleteProfilePage.tsx`| Component for users to complete their profile        |
| `src/services/authService.ts`             | Firebase authentication service integration          |
| `src/store/slices/authSlice.ts`           | Redux slice for managing authentication state        |
| `src/hooks/useAuth.ts`                    | Custom hook for accessing current auth state         |
| `src/hooks/useRedirectLogic.ts`           | Handles post-auth redirection and role checks        |
| `src/contexts/PermissionContext.tsx`      | Provides permissions and role context                |
| `src/navigation/AppRouter.tsx`            | Route configuration and protected routes             |

---

## 🔑 Authentication Methods

KBN supports the following authentication methods:

1. **Email/Password Authentication** – Traditional login with email and password
2. **Google Sign-In** – OAuth authentication using Google accounts
3. **Phone Number Authentication** – SMS-based verification (if enabled)

---

## 👤 User Authentication States

The application manages several authentication states:

- **Unauthenticated**: User is not logged in
- **Authenticating**: Authentication process is in progress
- **Authenticated**: User is successfully logged in
- **Authentication Error**: Authentication attempt failed
- **Profile Incomplete**: User is authenticated but needs to complete profile
- **Pending Approval**: User has completed profile but awaits role assignment

---

## 🛡️ Protected Routes & Role Integration

Protected routes require authentication and, in many cases, specific roles or privileges. The implementation uses:

- Route guards in `AppRouter.tsx`
- Real-time role and privilege checks via `useRedirectLogic`
- Conditional UI rendering based on auth and role state

```tsx
// Example of protected route implementation (simplified)
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, userPermissions } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !userPermissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

---

## 🔄 Authentication & Role Assignment Process

### Login Flow

1. User enters credentials on the login screen
2. Credentials are submitted to Firebase Authentication
3. On successful authentication:
   - User record is retrieved from Firestore
   - Profile completeness is checked
   - If profile is incomplete, user is redirected to `/complete-profile`
   - User selects type (Employee/Visitor) and completes required information
   - Profile is saved with role set to `PENDING`
   - Real-time listener is set up for role/privilege changes
   - Auth and role state are updated in Redux store
   - User is redirected based on role/privilege (see [App Flow](./app-flow.md))
4. On failed authentication:
   - Error message is displayed
   - User remains on the login screen

### Profile Completion

The profile completion step captures essential user information and categorizes users:

1. **Employee Profile**:
   - Personal information (First name, Last name)
   - Professional information (Branch, Department, Employee ID)
   - Location information (Province)

2. **Visitor Profile**:
   - Personal information (First name, Last name)
   - Contact information (Phone number)
   - Visit information (Purpose of visit)

### Persistent Authentication

- Auth state persists across reloads using:
  - Firebase Auth's persistence
  - Redux-persist for state
  - Local storage for tokens (if applicable)

### Logout Flow

1. User initiates logout
2. Firebase Auth signOut() is called
3. Redux auth state is cleared
4. User is redirected to the login screen

---

## ⚙️ Implementation Details

### Auth State & Role Listener

```tsx
// Example auth state and role listener setup
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async user => {
    if (user) {
      const userDoc = await getFirestoreUser(user.uid);
      dispatch(setUser({ ...user, ...userDoc }));
      // Set up real-time listener for role/privilege changes
      const roleUnsub = listenToUserRole(user.uid, updatedRole => {
        dispatch(updateUserRole(updatedRole));
      });
      return () => roleUnsub();
    } else {
      dispatch(clearUser());
    }
    dispatch(setAuthLoaded(true));
  });
  return unsubscribe;
}, [dispatch]);
```

### Profile Completion Component

The CompleteProfilePage component:
- Detects user type (Employee or Visitor)
- Presents appropriate form fields based on selection
- Personalizes the experience if displayName or photoURL are available
- Validates inputs including pattern validation for phone numbers
- Animates form transitions for better UX
- Sets the initial role to PENDING and saves the chosen user type
- Redirects to the pending approval page upon completion

### Custom Authentication Hooks

```tsx
// Example of useAuth hook usage
const ProfileComponent = () => {
  const { user, isLoading, error, userProfile } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <Navigate to="/login" />;
  if (!userProfile || !userProfile.firstName) return <Navigate to="/complete-profile" />;

  return (
    <div>
      <h1>Welcome, {userProfile.firstName} {userProfile.lastName}</h1>
      {/* Profile content */}
    </div>
  );
};
```

---

## 📝 Best Practices

1. **Always verify authentication server-side**: Don't rely solely on client-side checks
2. **Use secure token storage**: Store tokens securely and handle expiration
3. **Implement robust error handling**: Provide clear feedback for errors
4. **Follow least privilege principle**: Grant minimum required permissions
5. **Audit authentication code regularly**: Check for vulnerabilities
6. **Use environment variables for config**: Never hardcode secrets
7. **Test authentication and role flows thoroughly**: Cover all edge cases
8. **Clean up listeners**: Prevent memory leaks by unsubscribing
9. **Progressive form validation**: Validate user inputs as they type
10. **Clear user feedback**: Show loading states and success/error messages
11. **Handle different authentication methods consistently**: Ensure same flow regardless of auth provider

---

## 🔗 Related Documentation

- [App Flow Documentation](./app-flow.md)
- [Roles and Permissions Documentation](./roles-and-permissions.md)
- [User Journey Documentation](./user-journey.md)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
