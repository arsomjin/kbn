# Enhanced Authentication System Implementation

## Overview

This document outlines the seamless Sign-in/Log-in integration with RBAC (Role-Based Access Control), Geographic, and Branch data for the KBN system. The implementation handles both new and existing users with proper approval workflows.

## Key Features

### 1. **Dual User Type Support**

- **New Users**: Employees who have never worked with KBN
- **Existing Users**: Current KBN employees registering for system access

### 2. **RBAC Integration**

- Department-based permissions
- Access level hierarchy (STAFF, BRANCH_MANAGER, PROVINCE_MANAGER)
- Geographic restrictions (Province and Branch level)
- Dynamic permission assignment

### 3. **Approval Workflow**

- Automated approval for existing employees (with Employee ID)
- Manual approval for new employees
- Different approval levels based on user type
- Real-time notification system

## Architecture

### Components Structure

```
src/Modules/Auth/
├── index.js                 # Main Auth container
├── NatureLogin.js          # Modern login form
├── EnhancedSignUp.js       # Registration form with RBAC
├── ApprovalStatus.js       # Pending approval status
├── ForgetPassword.js       # Password reset
└── components/
    └── InputField.js       # Reusable form components
```

### Redux Structure

```
src/redux/
├── actions/
│   └── auth.js             # Enhanced auth actions
└── reducers/
    └── auth.js             # Auth state management
```

## Implementation Details

### 1. Registration Flow

#### For New Users:

1. **User Selection**: Choose "พนักงานใหม่" (New Employee)
2. **Form Completion**: Fill personal and work information
3. **Province/Branch Selection**: Required for geographic access
4. **Department Selection**: Determines initial permissions
5. **Approval Queue**: Sent to province manager for approval
6. **Email Notification**: User receives confirmation and status updates

#### For Existing Users:

1. **User Selection**: Choose "พนักงานเดิม" (Existing Employee)
2. **Enhanced Form**: Includes optional Employee ID field
3. **Faster Processing**: Higher priority in approval queue
4. **Auto-Approval**: With valid Employee ID in development mode
5. **Branch Manager Approval**: Typically faster approval process

### 2. Login Flow

#### Authentication Steps:

1. **Credential Validation**: Email and password verification
2. **Account Status Check**: Multiple status validations:
   - Approval status (pending, approved, rejected, suspended)
   - Active status
   - Account suspension checks
3. **RBAC Data Loading**: Merge user permissions and geographic access
4. **Geographic Context**: Load province and branch data
5. **Session Establishment**: Set up authenticated session

#### Enhanced Error Handling:

- **Detailed Status Messages**: Specific reasons for login failures
- **Thai Language Support**: All error messages in Thai
- **Contact Information**: Relevant manager contact details
- **Status Context**: User type, department, and location information

### 3. RBAC System

#### Access Levels:

```javascript
STAFF: Basic department access
BRANCH_MANAGER: Branch-level management + reports
PROVINCE_MANAGER: Full province access
SUPER_ADMIN: System-wide access
```

#### Permission Structure:

```javascript
// Department-based permissions
"accounting.view": View accounting data
"accounting.edit": Edit accounting data
"sales.view": View sales data
"sales.edit": Edit sales data
// ... etc

// Wildcard permissions
"*": Full system access
"accounting.*": Full accounting access
"*.view": View access to all departments
```

#### Geographic Access:

```javascript
{
  homeProvince: "นครราชสีมา",
  homeBranch: "0450",
  allowedProvinces: ["นครราชสีมา", "นครสวรรค์"],
  allowedBranches: ["0450", "0451", "0452"]
}
```

### 4. Database Structure

#### User Document Structure:

```javascript
{
  auth: {
    // Basic auth info
    uid: "user-id",
    email: "user@example.com",
    displayName: "John Doe",

    // Status fields
    isApproved: true,
    isActive: true,
    approvalStatus: "approved",

    // User metadata
    userType: "existing", // or "new"
    department: "sales",
    employeeId: "EMP001",

    // Geographic data
    homeProvince: "นครราชสีมา",
    homeBranch: "0450"
  },

  rbac: {
    accessLevel: "STAFF",
    permissions: {
      "sales.view": true,
      "sales.edit": true
    },
    geographic: {
      homeProvince: "นครราชสีมา",
      homeBranch: "0450",
      allowedProvinces: ["นครราชสีมา"],
      allowedBranches: ["0450"]
    }
  },

  profile: {
    firstName: "John",
    lastName: "Doe",
    department: "sales",
    userType: "existing",
    employeeId: "EMP001"
  },

  status: {
    isActive: true,
    isApproved: true,
    approvalStatus: "approved",
    registrationComplete: true
  }
}
```

#### Approval Request Structure:

```javascript
{
  userId: "user-id",
  requestType: "existing_employee_registration",
  status: "pending",
  priority: "high", // high for existing, normal for new
  targetProvince: "นครราชสีมา",
  targetBranch: "0450",
  department: "sales",
  accessLevel: "STAFF",
  userType: "existing",
  employeeId: "EMP001",
  approvalLevel: "branch_manager",

  context: {
    isExistingEmployee: true,
    hasEmployeeId: true,
    requestedPermissions: {...},
    geographicScope: {...}
  }
}
```

## Usage Examples

### 1. Checking Permissions

```javascript
import { checkPermission } from "../utils/rbac";

// Check if user can edit sales data
const canEditSales = checkPermission(user.permissions, "sales.edit");

// Check with geographic context
const canAccessBranch = hasAccess(user, "sales.view", {
  province: "นครราชสีมา",
  branch: "0450",
});
```

### 2. Component-Level Access Control

```javascript
import { useSelector } from "react-redux";
import { checkPermission } from "../utils/rbac";

const SalesComponent = () => {
  const { user } = useSelector((state) => state.auth);
  const canEdit = checkPermission(user.permissions, "sales.edit");

  return (
    <div>
      {canEdit && <EditButton />}
      <ViewOnlyData />
    </div>
  );
};
```

### 3. Route Protection

```javascript
import { hasAccess } from "../utils/rbac";

const ProtectedRoute = ({ children, permission, user }) => {
  if (!hasAccess(user, permission)) {
    return <AccessDenied />;
  }
  return children;
};
```

## Security Features

### 1. **Multi-Layer Validation**

- Firebase Authentication
- Firestore approval status
- RBAC permission checks
- Geographic access validation

### 2. **Auto-Logout Triggers**

- Account suspension detection
- Approval revocation
- Token expiration
- Suspicious activity

### 3. **Audit Trail**

- Registration timestamps
- Approval history
- Login tracking
- Permission changes

## Deployment Considerations

### 1. **Environment Configuration**

```javascript
// Development mode features
if (process.env.NODE_ENV === "development") {
  // Auto-approve existing users with Employee ID
  // Extended logging
  // Test data fallbacks
}
```

### 2. **Firebase Security Rules**

```javascript
// Users can only read their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Approval requests require manager access
match /approvalRequests/{requestId} {
  allow read, write: if request.auth != null &&
    resource.data.approvalLevel in ['branch_manager', 'province_manager'];
}
```

### 3. **Performance Optimization**

- Cached province/branch data
- Minimal user data loading
- Efficient permission checking
- Background data updates

## Troubleshooting

### Common Issues:

1. **Registration Stuck in Pending**

   - Check approval request creation
   - Verify notification system
   - Confirm manager permissions

2. **Login Failures**

   - Verify account approval status
   - Check geographic access data
   - Validate RBAC configuration

3. **Permission Errors**
   - Review permission structure
   - Check access level assignment
   - Verify geographic scope

## Future Enhancements

1. **Mobile App Support**
2. **SSO Integration**
3. **Advanced Audit Logging**
4. **Automated Employee Verification**
5. **Multi-Factor Authentication**
6. **Role Template Management**

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/reset-password` - Password reset

### User Management

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/permissions` - Get user permissions
- `GET /users/approval-status` - Check approval status

### Administration

- `GET /admin/approval-requests` - List pending approvals
- `PUT /admin/approval-requests/:id` - Approve/reject user
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/permissions` - Update permissions

This implementation provides a robust, secure, and user-friendly authentication system that seamlessly integrates with the existing KBN infrastructure while supporting both new and existing user onboarding workflows.
