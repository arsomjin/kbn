# Branch Manager Geographic Display Fix

## Issue

Branch Manager users were seeing "จังหวัด ทั้งหมด" (All Provinces) and "สาขา ทั้งหมด" (All Branches) in the user context display, instead of their specific assigned province and branch.

## Root Cause

The UserContext component was using incorrect logic to determine geographic display for different user roles:

1. **Incorrect fallback logic**: Defaulted to "ทั้งหมด" when `currentProvince` and `currentBranch` from RBAC state were undefined
2. **Missing role-specific logic**: Didn't properly handle different access levels (SUPER_ADMIN, PROVINCE_MANAGER, BRANCH_MANAGER)
3. **Not using allowedBranches/allowedProvinces**: Didn't read from the user's actual geographic restrictions

## Solution

### Updated UserContext Logic

Created role-specific display functions that properly handle each access level:

```javascript
const getProvinceDisplay = () => {
  if (user?.accessLevel === "SUPER_ADMIN") {
    return "ทั้งหมด"; // Super admin sees all
  }

  if (user?.accessLevel === "PROVINCE_MANAGER") {
    if (user?.allowedProvinces && user.allowedProvinces.length === 1) {
      return provinces[user.allowedProvinces[0]]?.provinceName || "ไม่ระบุ";
    } else if (user?.allowedProvinces && user.allowedProvinces.length > 1) {
      return `${user.allowedProvinces.length} จังหวัด`;
    }
  }

  if (user?.accessLevel === "BRANCH_MANAGER") {
    if (user?.allowedBranches && user.allowedBranches.length > 0) {
      const firstBranch = branches[user.allowedBranches[0]];
      if (firstBranch) {
        return provinces[firstBranch.provinceId]?.provinceName || "ไม่ระบุ";
      }
    }
  }

  // Fallback to home province
  return (
    (user?.homeProvince && provinces[user.homeProvince]?.provinceName) ||
    "ไม่ระบุ"
  );
};

const getBranchDisplay = () => {
  if (user?.accessLevel === "SUPER_ADMIN") {
    return "ทั้งหมด"; // Super admin sees all
  }

  if (user?.accessLevel === "PROVINCE_MANAGER") {
    return "ทั้งหมดในจังหวัด"; // Province manager sees all branches in their province(s)
  }

  if (user?.accessLevel === "BRANCH_MANAGER") {
    if (user?.allowedBranches && user.allowedBranches.length === 1) {
      return branches[user.allowedBranches[0]]?.branchName || "ไม่ระบุ";
    } else if (user?.allowedBranches && user.allowedBranches.length > 1) {
      return `${user.allowedBranches.length} สาขา`;
    }
  }

  // Fallback to home branch
  return (
    (user?.homeBranch && branches[user.homeBranch]?.branchName) || "ไม่ระบุ"
  );
};
```

### Expected User Data Structure

For a BRANCH_MANAGER user, the user object should contain:

```javascript
{
  uid: "user123",
  accessLevel: "BRANCH_MANAGER",
  allowedBranches: ["NSN001"], // Array of branch codes they can access
  // The province will be derived from the branch data
}
```

## Result

- ✅ **SUPER_ADMIN**: Shows "ทั้งหมด" for both province and branch
- ✅ **PROVINCE_MANAGER**: Shows specific province name and "ทั้งหมดในจังหวัด" for branches
- ✅ **BRANCH_MANAGER**: Shows specific province and branch names based on their allowedBranches
- ✅ **Fallback handling**: Graceful fallback to "ไม่ระบุ" instead of "ทั้งหมด" when data is missing

## Testing

To verify the fix:

1. Login as BRANCH_MANAGER user
2. Check the user context card in the sidebar
3. Should show the specific province and branch name, not "ทั้งหมด"

## User Data Requirements

Ensure BRANCH_MANAGER users have:

- `accessLevel: "BRANCH_MANAGER"`
- `allowedBranches: ["branch_code"]` array with their assigned branches
- The system will automatically determine the province from the branch data

## Files Modified

- `src/components/layout/MainSidebar/UserContext.js`
