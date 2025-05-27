# 📋 Routes and Sidebar Menu Implementation Documentation

## 🎯 Overview

This document describes the implementation of the 4-layer route structure and sidebar menu system as specified in the `routes-sidebar-menu.md` guide. The implementation provides role-based navigation with cross-layer access prevention.

## 🏗️ Architecture

### 4-Layer Route Structure

The system implements the following access layers:

1. **Executive Layer** (`/`)

   - Roles: `EXECUTIVE`, `DEVELOPER`, `SUPER_ADMIN`, `GENERAL_MANAGER`
   - Access: All routes, all provinces, all branches
   - Permissions: Full system access

2. **Province Layer** (`/{provinceId}/`)

   - Roles: `PROVINCE_MANAGER`, `PROVINCE_ADMIN`
   - Access: All branches under their province
   - Permissions: Province-specific permissions

3. **Branch Manager Layer** (`/{provinceId}/{branchCode}/`)

   - Roles: `BRANCH_MANAGER`
   - Access: Their own branch only
   - Permissions: Branch management, review, approve

4. **Branch Staff Layer** (`/{provinceId}/{branchCode}/`)
   - Roles: `LEAD`, `USER`
   - Access: Their own branch only
   - Permissions: View, create, edit (no approve/delete)

## 🔧 Implementation Details

### Core Utility Functions

#### `getUserRoutePrefix(userProfile)`

Computes the appropriate base path for a user's role:

```javascript
// Executive layer → "/"
// Province layer → "/BKK/"
// Branch layer → "/BKK/0011/"
```

#### `getUserAccessLayer(userProfile)`

Returns the user's access layer string:

```javascript
// Returns: 'executive', 'province', 'branch_manager', 'branch_staff', 'guest'
```

#### `shouldAllowRouteAccess(userProfile, routePath)`

Checks if a user should have access to a specific route based on their layer.

#### `getLayerRedirectPath(userProfile, attemptedPath)`

Gets the correct redirect path for users trying to access routes outside their layer.

### MainLayout Component Changes

#### Layer-Aware Navigation

- `navigateWithLayerCheck(targetPath)`: Navigation function that enforces layer restrictions
- `getLayerAwarePath(basePath)`: Helper to compute layer-specific paths for supported modules

#### Cross-Layer Access Prevention

- Real-time route monitoring via `useEffect`
- Automatic redirection when users access routes outside their layer
- Preserves intended module/feature when possible during redirection

#### Menu Items Generation

- Dynamic menu generation based on user's role and layer
- Layer-specific path computation for admin routes
- Conditional rendering based on both permissions and access layer

### Route Selection Logic

The `getSelectedKey` function has been enhanced to handle layer-based routes:

```javascript
// Handles patterns like:
// /about/system-overview (executive)
// /BKK/about/system-overview (province)
// /BKK/0011/about/system-overview (branch)
```

## 🛡️ Security Features

### Access Control

1. **Role-Based Access**: Users can only see menu items they have permissions for
2. **Layer Isolation**: Users cannot access routes outside their designated layer
3. **Automatic Redirection**: Attempts to access restricted routes result in appropriate redirects

### Prevention Mechanisms

1. **Route Monitoring**: Real-time checking of current route against user's allowed access
2. **Navigation Guards**: All navigation goes through layer-aware checks
3. **Menu Filtering**: Dynamic menu generation prevents unauthorized options from appearing

## 🧪 Testing and Debugging

### RouteDebugInfo Component

A development-only debug component that shows:

- Current route path
- User role and access layer
- Route prefix for the user
- Whether access is allowed
- User's province and branch information

**Usage**: Automatically appears in development mode at the bottom-right of the screen.

## 📝 Usage Examples

### Adding a New Layer-Aware Menu Item

```javascript
// In MainLayout navigation items
{
  key: 'new-feature',
  icon: <NewFeatureIcon />,
  label: t('newFeature:title'),
  onClick: () => {
    const path = getLayerAwarePath('/new-feature');
    if (path) {
      navigateWithLayerCheck(path);
    } else {
      navigate(getUserHomePath(userProfile));
    }
  },
}
```

### Supporting a New Module for Layer-Based Access

1. Add the module to `supportedModules` in `getLayerAwarePath`:

```javascript
const supportedModules = ['about', 'account', 'new-module'];
```

2. Update route patterns in `getSelectedKey` if needed
3. Ensure proper route handling in your module's router configuration

### Role and Permission Checking

```javascript
// Check if user has role and is in correct layer
hasRole(ROLES.PROVINCE_ADMIN) &&
  (userAccessLayer === 'executive' || userAccessLayer === 'province') &&
  {
    // Menu item configuration
  };
```

## 🔄 Migration Notes

### Existing Menu Items

- All existing menu items have been updated to use `navigateWithLayerCheck`
- Layer restrictions are now enforced based on user role and access level
- No breaking changes to existing functionality

### New Role Category

Added `BRANCH_STAFF` role category:

```javascript
export const RoleCategory = {
  // ... existing categories
  BRANCH_STAFF: 'branch_staff', // For LEAD and USER roles at branch level
};
```

## 🐛 Troubleshooting

### Common Issues

1. **User sees "Access Denied" or gets redirected unexpectedly**

   - Check user's role and layer assignment
   - Verify route patterns in `shouldAllowRouteAccess`
   - Check if user has proper province/branch information

2. **Menu items not showing**

   - Verify permission checks in navigation items
   - Ensure user's layer allows access to the feature
   - Check role category mappings

3. **Routes not working as expected**
   - Check route patterns in `getSelectedKey`
   - Verify `supportedModules` includes your module
   - Ensure proper route configuration in router

### Debug Steps

1. Enable RouteDebugInfo component (automatic in development)
2. Check browser console for layer-related warnings
3. Verify user profile data includes required province/branch information
4. Test navigation between different layer-specific routes

## 📊 Implementation Status

### ✅ Completed Features

- 4-layer route structure implementation
- Cross-layer access prevention
- Layer-aware navigation system
- Dynamic menu generation
- Role and permission integration
- Debug tooling

### 🔄 Future Enhancements

- Enhanced route caching for performance
- More granular permission checking
- Custom redirect logic per module
- Advanced analytics for route usage

## 📚 Related Documentation

- `routes-sidebar-menu.md` - Original specification
- `src/constants/roles.js` - Role definitions and permissions
- `src/utils/roleUtils.js` - Utility functions
- `src/components/layout/MainLayout.jsx` - Main implementation
