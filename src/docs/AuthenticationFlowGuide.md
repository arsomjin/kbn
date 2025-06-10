# KBN Authentication Flow & Employee Data Integration Guide

## Overview

The KBN authentication system integrates with existing employee data to provide seamless user registration and role-based access control. This guide explains how the system checks existing employee data and maps it to user accounts.

## Employee Data Structure

### Location: `data/company/employees/{employeeCode}`

```javascript
{
  employeeCode: "KBN50007",           // Primary key for employee lookup
  firstName: "เด็มใจ",                // Employee first name (Thai)
  lastName: "ทองคำนก",                // Employee last name (Thai)
  nickName: "ปิก",                   // Employee nickname
  affiliate: "ศรี",                   // Branch name (important for branch mapping)
  provinceId: "nakhon-ratchasima",   // Province ID (added by migration script)
  startDate: "2013-09-03",           // Employment start date
  endDate: null,                     // Employment end date (null = active)
  status: "ปกติ",                    // Employee status ("ปกติ" = normal/active)
  position: "บมน้าน",                 // Job position
  workBegin: "08:00",                // Work start time
  workEnd: "17:00",                  // Work end time
  prefix: "นาง",                     // Title prefix
  importBy: "unique_import_id",      // Import tracking
  importTime: 1622175972065,         // Import timestamp
  uid: null                          // Firebase UID (linked after registration)
}
```

## Authentication Flow Process

### 1. User Registration

When a user registers:

1. **Firebase Authentication** creates a new user with `uid`
2. **User Profile** is created in `users/{uid}` collection
3. **User Type** determines the verification process

### 2. Employee Verification Process

#### For Existing Employees (`userType: "existing"`)

```javascript
// User provides employeeCode during registration
const registrationData = {
  userType: "existing",
  employeeId: "KBN50007", // This is the employeeCode
  firstName: "เด็มใจ",
  lastName: "ทองคำนก",
  email: "user@example.com",
  // ... other fields
};
```

#### Employee Lookup Logic

```javascript
// From src/Modules/Utils/index.js
export const getNameFromEmployeeCode = ({ employeeCode, employees }) => {
  let employeesArr = Object.keys(employees).map((k) => employees[k]);
  let eIndex = employeesArr.findIndex(
    (l) => l.employeeCode && l.employeeCode === employeeCode
  );

  if (eIndex > -1) {
    return {
      firstName: employeesArr[eIndex]?.firstName,
      nickName: employeesArr[eIndex]?.nickName || null,
      lastName: employeesArr[eIndex]?.lastName,
    };
  }
  return null;
};
```

#### Employee Status Verification

```javascript
// From src/utils/index.js
export const getEmployeeStatus = async (record) => {
  try {
    let wheres = [["firstName", "==", record.firstName]];
    if (record?.lastName) {
      wheres = wheres.concat([["lastName", "==", record.lastName]]);
    }

    const userData = await getCollection("data/company/employees", wheres);
    if (userData) {
      let arr = Object.keys(userData || {}).map((k) => userData[k]);
      return arr[0]?.status || "ปกติ";
    }
    return undefined;
  } catch (e) {
    throw e;
  }
};
```

### 3. User-Employee Mapping

#### After Successful Verification

1. **Link UID to Employee Record**:

   ```javascript
   // Update employee record with Firebase UID
   await firestore
     .collection("data/company/employees")
     .doc(employeeCode)
     .update({ uid: user.uid });
   ```

2. **Inherit Employee Data**:

   ```javascript
   const userProfile = {
     uid: user.uid,
     employeeCode: employee.employeeCode,
     firstName: employee.firstName,
     lastName: employee.lastName,
     nickName: employee.nickName,
     position: employee.position,

     // Geographic data from employee record
     homeProvince: employee.provinceId,
     homeBranch: employee.affiliate, // Branch name

     // RBAC fields based on employee data
     accessLevel: determineAccessLevel(employee.position),
     department: mapPositionToDepartment(employee.position),

     // Status fields
     isActive: employee.status === "ปกติ",
     approvalStatus: "pending", // Requires manager approval
   };
   ```

3. **Branch and Province Mapping**:

   ```javascript
   // Map affiliate (branch name) to branch code
   const branchMapping = {
     ศรี: "0450",
     NMA002: "NMA002",
     NMA003: "NMA003",
     // ... other mappings
   };

   // Map provinceId to province name
   const provinceMapping = {
     "nakhon-ratchasima": "นครราชสีมา",
     "nakhon-sawan": "นครสวรรค์",
   };
   ```

### 4. Approval Process

#### For Existing Employees with Valid Employee Data

1. **Branch Manager Approval** (faster track)
2. **Automatic Data Population** from employee record
3. **Permission Assignment** based on position/department

#### For New Employees or Invalid Employee Data

1. **Province Manager Approval** (standard track)
2. **Manual Data Entry** verification
3. **Full RBAC Setup** required

### 5. Authentication Verification (`verifyAuth`)

```javascript
// From src/redux/actions/auth.js
export const verifyAuth = () => (dispatch) => {
  app.auth().onAuthStateChanged(async (user) => {
    if (user !== null) {
      // Load user RBAC data from Firestore
      const userDoc = await app
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        // Check approval status
        const isApproved = userData.auth?.isApproved ?? false;
        const approvalStatus = userData.auth?.approvalStatus || "pending";

        if (!isApproved || approvalStatus === "pending") {
          // Keep user signed in but show pending status
          // Set up real-time approval listener
          setupApprovalListener(user.uid, dispatch);
        }

        // Merge employee data if available
        const mUser = {
          ...userData.auth,
          // Employee-specific fields populated during registration
          employeeCode: userData.auth?.employeeId,
          // ... other merged data
        };

        dispatch(receiveLogin(mUser));
      }
    }
  });
};
```

## Key Integration Points

### 1. Employee Code Validation

- **Primary Key**: `employeeCode` is the main identifier
- **Cross-Reference**: Used to link Firebase `uid` with employee record
- **Validation**: Checks against existing employee database

### 2. Name Matching

- **First Name**: Must match employee record exactly
- **Last Name**: Must match employee record (if provided)
- **Nickname**: Optional but used for display purposes

### 3. Geographic Inheritance

- **Province**: Inherited from `employee.provinceId`
- **Branch**: Inherited from `employee.affiliate` (mapped to branch code)
- **Permissions**: Scoped to inherited geographic boundaries

### 4. Status Synchronization

- **Employee Status**: `"ปกติ"` = active, other values may require review
- **User Status**: Mirrors employee status with additional approval layers
- **Real-time Updates**: Changes in employee status can affect user access

## Data Flow Example

### Complete Registration Flow for Existing Employee

```javascript
// 1. User Registration
const registrationData = {
  userType: "existing",
  employeeId: "KBN50007", // employeeCode
  firstName: "เด็มใจ",
  lastName: "ทองคำนก",
  email: "user@example.com",
  province: "นครราชสีมา",
  branch: "ศรี",
};

// 2. Employee Lookup
const employee = employees["KBN50007"];
// Returns: { employeeCode: "KBN50007", firstName: "เด็มใจ", ... }

// 3. Validation
const isValidEmployee =
  employee.firstName === registrationData.firstName &&
  employee.lastName === registrationData.lastName &&
  employee.status === "ปกติ";

// 4. User Profile Creation (if valid)
const userProfile = {
  uid: "firebase_generated_uid",
  employeeCode: "KBN50007",
  firstName: "เด็มใจ",
  lastName: "ทองคำนก",
  homeProvince: "nakhon-ratchasima", // from employee.provinceId
  homeBranch: "ศรี", // from employee.affiliate
  accessLevel: "STAFF", // determined from employee.position
  isApproved: false, // requires approval
  approvalStatus: "pending",
  approvalLevel: "branch_manager", // faster track for existing employees
};

// 5. Link UID to Employee
await updateEmployee("KBN50007", { uid: "firebase_generated_uid" });

// 6. Create Approval Request
await createApprovalRequest({
  userId: "firebase_generated_uid",
  requestType: "existing_employee_verification",
  employeeCode: "KBN50007",
  approvalLevel: "branch_manager",
});
```

### Authentication Check

```javascript
// During login or app initialization
const user = await getCurrentUser();
if (user) {
  // Load user profile
  const userDoc = await getUserDocument(user.uid);

  // Check if linked to employee
  if (userDoc.auth.employeeCode) {
    const employee = await getEmployee(userDoc.auth.employeeCode);

    // Verify employee is still active
    if (employee.status !== "ปกติ") {
      // Handle inactive employee
      signOut();
      return;
    }

    // Merge current employee data
    const mergedUser = {
      ...userDoc.auth,
      ...employee, // Current employee data
      uid: user.uid, // Preserve Firebase UID
    };

    setCurrentUser(mergedUser);
  }
}
```

## Security Considerations

### 1. Employee Data Protection

- Employee data is sensitive and requires proper access controls
- Only authorized personnel can view/modify employee records
- Audit trails track all employee data access

### 2. UID Linking Security

- UID linking is irreversible and permanent
- Prevents multiple accounts per employee
- Maintains data integrity across systems

### 3. Status Synchronization

- Real-time monitoring of employee status changes
- Immediate access revocation when employee status changes
- Prevents access by terminated employees

## Troubleshooting Common Issues

### 1. Employee Not Found

- **Cause**: `employeeCode` doesn't exist in database
- **Solution**: Verify employee code spelling, check if employee exists
- **Action**: Route to manual approval process

### 2. Name Mismatch

- **Cause**: Registration name doesn't match employee record
- **Solution**: Check for typos, nickname usage, name changes
- **Action**: Allow manual verification by manager

### 3. Multiple Matches

- **Cause**: Multiple employees with same first/last name
- **Solution**: Use additional fields (position, branch, etc.)
- **Action**: Require manager verification with additional context

### 4. Inactive Employee

- **Cause**: Employee status is not `"ปกติ"`
- **Solution**: Check employee status, verify employment
- **Action**: May require HR review before account activation

## Enhanced Employee Verification System

### New Features Implemented ✅

The authentication system now includes enhanced employee verification with multiple lookup methods:

#### 1. **Dual Lookup Strategy**

```javascript
// Primary: employeeCode lookup
const codeResult = await verifyByEmployeeCode({
  employeeCode: "KBN50007",
  firstName: "เด็มใจ",
  lastName: "ทองคำนก",
});

// Fallback: Name-based lookup
const nameResult = await verifyByName({
  firstName: "เด็มใจ",
  lastName: "ทองคำนก",
  providedEmployeeCode: "KBN50007", // for cross-validation
});
```

#### 2. **Confidence Scoring System**

- **`EXACT_MATCH`**: employeeCode + name both match (highest confidence)
- **`CODE_MATCH`**: employeeCode matches, name validation passed
- **`NAME_MATCH`**: Name matches, may need employeeCode verification
- **`MULTIPLE_MATCHES`**: Multiple employees found with same name
- **`NO_MATCH`**: No matching employee found

#### 3. **Cross-Validation Features**

- Validates employeeCode against provided names
- Detects mismatched information
- Provides specific error messages and suggestions
- Handles multiple employees with same names

#### 4. **Enhanced Error Handling**

```javascript
// Example verification results
{
  success: false,
  confidence: "multiple_matches",
  employees: [...], // Array of matching employees
  message: "พบพนักงานหลายคนที่มีชื่อ เด็มใจ",
  suggestions: [
    "กรุณาระบุรหัสพนักงานเพื่อระบุตัวตน",
    "- เด็มใจ ทองคำนก (KBN50007) - บมน้าน",
    "- เด็มใจ สมใจ (KBN50012) - พนักงานขาย"
  ]
}
```

### Usage in Registration Process

The enhanced verification is automatically integrated into the registration flow:

```javascript
// In EnhancedSignUp component
if (values.userType === "existing") {
  const verificationResult = await verifyEmployee({
    employeeCode: values.employeeId,
    firstName: values.firstName,
    lastName: values.lastName,
    employees: employees, // Redux store data
  });

  if (verificationResult.success) {
    // Auto-populate employee data
    values = {
      ...values,
      employeeId: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      province: employee.provinceId,
      branch: employee.affiliate,
      // ... other enhanced data
    };
  }
}
```

### Testing Tools Available

- **Test Dashboard**: `/dev/test-authentication` - Complete testing environment
- **Employee Verification Test**: Interactive testing for all lookup scenarios
- **Sample Data**: Uses real employee data for accurate testing
- **Confidence Visualization**: Visual feedback for verification results

### Error Scenarios Handled

1. **No Employee Code Provided**: Falls back to name lookup
2. **Invalid Employee Code**: Suggests name-based verification
3. **Name Mismatch**: Shows expected vs provided names
4. **Multiple Name Matches**: Lists all matching employees with details
5. **Inactive Employee**: Shows status and required actions
6. **Cross-Validation Failures**: Detailed mismatch explanations

## Next Steps for Development

1. ✅ **Enhanced Employee Matching**: Implemented dual lookup with confidence scoring
2. **Automated Status Sync**: Real-time employee status monitoring
3. **Position-Based RBAC**: Automatic permission assignment from job roles
4. **Employee Data Updates**: Sync changes from HR systems
5. **Audit Integration**: Track all employee-user linking activities
6. **Fuzzy Name Matching**: Implement similar name suggestions
7. **Bulk Employee Import**: Tools for HR data synchronization
