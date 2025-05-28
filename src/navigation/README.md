# Navigation System Documentation

## Overview

The KBN navigation system has been refactored for better maintainability, readability, and scalability. The router is now organized into modular components that separate concerns and make it easier to manage the complex multi-province routing structure.

## Architecture

### File Structure

```
src/navigation/
├── AppRouter.jsx                 # Main router component
├── routes/
│   ├── routeConfig.js           # Route configurations and component imports
│   ├── RouteBuilders.jsx        # Utility functions for building routes
│   ├── AuthRoutes.jsx           # Authentication-related routes
│   └── ProtectedRoutes.jsx      # Protected application routes
├── router/
│   ├── PendingGuard.jsx         # Guards for pending users
│   ├── ProfileGuard.jsx         # Guards for incomplete profiles
│   ├── ProvinceGuard.jsx        # Province-level access guards
│   ├── BranchGuard.jsx          # Branch-level access guards
│   └── PublicOnlyRoute.jsx      # Public-only route guards
└── README.md                    # This documentation
```

### Main Components

#### 1. AppRouter.jsx

The main router component that orchestrates all routes. It's now much cleaner and focuses only on:

- Loading states
- Authentication checking
- Delegating to specialized route components

#### 2. routes/routeConfig.js

Centralized configuration for all routes, including:

- Route definitions with components and permissions
- Role-based access configurations
- Account route patterns for different hierarchical levels
- Auth redirects and legacy route handling

#### 3. routes/RouteBuilders.jsx

Utility functions to reduce boilerplate and create consistent route patterns:

- `createProtectedRoute()` - Creates permission-protected routes
- `createAccountRoutes()` - Generates account routes for different levels
- `createAdminRoute()` - Creates admin routes with proper permissions
- `createRoutesFromConfig()` - Batch creates routes from configuration

#### 4. routes/AuthRoutes.jsx

Handles all authentication-related routing:

- Login, signup, password reset routes
- Pending approval and profile completion flows
- Legacy auth route redirects
- Auth layout wrapper

#### 5. routes/ProtectedRoutes.jsx

Manages all authenticated user routes:

- Executive, province, and branch level routes
- Hierarchical route nesting
- Account management routes for all levels
- Admin routes with proper RBAC

## Route Hierarchy

### 1. Authentication Routes

```
/auth/
├── login
├── signup
├── reset-password
└── verification

/pending                    # Approval pending
/complete-profile          # Profile completion required
```

### 2. Executive Level Routes

```
/
├── overview               # System overview (Executive)
├── dashboard             # General manager dashboard
├── special-settings/*    # Executive settings
├── personal-profile      # User profile
├── landing              # Landing page
└── about/system-overview # System information
```

### 3. Account Routes (All Levels)

```
/account/                 # Executive level
├── overview
├── income
├── expense
└── input-price

:provinceId/account/      # Province level
├── overview
├── income
├── expense
└── input-price

:provinceId/:branchCode/account/  # Branch level
├── overview
├── income
├── expense
└── input-price
```

### 4. Admin Routes (All Levels)

```
/admin/*                           # Executive admin
:provinceId/admin/*               # Province admin
:provinceId/:branchCode/admin/*   # Branch admin
```

### 5. Province Routes

```
/:provinceId/
└── dashboard             # Province dashboard
```

### 6. Branch Routes

```
/:provinceId/:branchCode/
├── dashboard            # Branch dashboard
└── landing             # Branch landing
```

## Benefits of Refactoring

### 1. **Improved Maintainability**

- Separated concerns into focused components
- Centralized route configurations
- Eliminated repetitive code patterns

### 2. **Better Readability**

- Clear separation between auth and protected routes
- Logical grouping of related functionality
- Comprehensive documentation and comments

### 3. **Enhanced Scalability**

- Easy to add new route patterns
- Configurable route builders for common patterns
- Hierarchical structure supports multi-province growth

### 4. **Reduced Boilerplate**

- Route builder functions eliminate repetitive JSX
- Configuration-driven route generation
- Consistent permission handling

### 5. **Better Testing**

- Smaller, focused components are easier to test
- Clear separation of concerns
- Isolated route logic

## Adding New Routes

### Adding a New Protected Route

1. Add the route configuration to `routeConfig.js`:

```javascript
export const newFeatureRoutes = [
  {
    path: '/new-feature',
    component: NewFeatureComponent,
    roles: getAllowedRolesByCategory(RoleCategory.EXECUTIVE),
    permission: PERMISSIONS.NEW_FEATURE_ACCESS,
    fallbackPath: '/dashboard',
  },
];
```

2. Import and use in `ProtectedRoutes.jsx`:

```javascript
{
  createRoutesFromConfig(newFeatureRoutes);
}
```

### Adding Account-Style Routes for All Levels

1. Add to account routes in `routeConfig.js`:

```javascript
export const accountRoutes = [
  // ... existing routes
  {
    path: 'new-account-feature',
    component: NewAccountFeature,
    permission: PERMISSIONS.NEW_ACCOUNT_PERMISSION,
  },
];
```

The route will automatically be available at all hierarchical levels.

## Role-Based Access Control (RBAC)

The router integrates seamlessly with the KBN RBAC system:

- Routes are protected by role categories and specific permissions
- Hierarchical access control (Executive > Province > Branch)
- Automatic fallback to appropriate dashboard levels
- Province and branch guards ensure proper access scope

## Performance Considerations

- Lazy loading for all route components to reduce initial bundle size
- Suspense boundaries for graceful loading states
- Efficient route matching with React Router v6
- Minimal re-renders through proper component separation

## Migration Notes

The refactoring maintains backward compatibility while providing a much cleaner structure. All existing routes continue to work, but the codebase is now much more maintainable and easier to extend.

## Future Improvements

1. **Route-based Code Splitting**: Further optimize loading with route-specific chunks
2. **Dynamic Route Loading**: Load routes based on user permissions at runtime
3. **Route Analytics**: Add tracking for route usage and performance
4. **Type Safety**: Consider migrating to TypeScript for better type safety
