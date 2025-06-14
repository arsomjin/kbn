# 🎯 **HIERARCHICAL USER MANAGEMENT SYSTEM**

## **DESIGN DECISION: Hierarchical Access Implementation**

**Final Decision**: ✅ **Hierarchical Access** (Higher roles can manage lower roles)

### **🏛️ ACCESS HIERARCHY**

```
Level 4: ADMIN     → Can manage: ADMIN, MANAGER, LEAD, STAFF (All users)
Level 3: MANAGER   → Can manage: LEAD, STAFF (in same province)
Level 2: LEAD      → Can manage: STAFF (in same branch)
Level 1: STAFF     → Can manage: None
```

---

## **🔐 PERMISSION MATRIX**

| Current Role | Can Access Page | Can Manage | Geographic Scope |
|--------------|----------------|------------|------------------|
| **ADMIN** | ✅ Yes | All users | Global |
| **MANAGER** | ✅ Yes | LEAD + STAFF | Same Province |
| **LEAD** | ✅ Yes | STAFF only | Same Branch |
| **STAFF** | ❌ No | None | N/A |

---

## **🛠️ TECHNICAL IMPLEMENTATION**

### **1. Page Access Control**
```javascript
// src/Modules/Admin/UserManagement/index.js
<LayoutWithRBAC
  permission={['users.view', 'users.manage', 'team.manage']}
  fallbackPermission='users.view'
/>
```

### **2. Data Filtering Logic**
```javascript
const getManageableUsers = (allUsers) => {
  const currentAuthority = currentUser?.access?.authority || currentUser?.accessLevel;
  
  // ADMIN: See all users
  if (currentAuthority === 'ADMIN') return allUsers;
  
  // MANAGER: See LEAD + STAFF in same province
  if (currentAuthority === 'MANAGER') {
    return allUsers.filter(user => {
      const userAuthority = user.access?.authority || user.accessLevel;
      const userProvince = user.access?.geographic?.homeProvince || user.homeProvince;
      return ['LEAD', 'STAFF'].includes(userAuthority) && 
             userProvince === currentUserProvince;
    });
  }
  
  // LEAD: See STAFF in same branch
  if (currentAuthority === 'LEAD') {
    return allUsers.filter(user => {
      const userAuthority = user.access?.authority || user.accessLevel;
      const userBranch = user.access?.geographic?.homeBranch || user.homeBranch;
      return userAuthority === 'STAFF' && 
             userBranch === currentUserBranch;
    });
  }
  
  // STAFF: See none
  return [];
};
```

### **3. Firebase Security Rules**
```javascript
// firestore.rules
function canManageUsers() {
  return request.auth != null && 
         userExists() && 
         (getUserData().access.authority == 'ADMIN' ||
          getUserData().access.authority == 'MANAGER' ||
          getUserData().access.authority == 'LEAD');
}

function canManageTargetUser(targetUserId) {
  // ADMIN can manage anyone
  // MANAGER can manage LEAD+STAFF in same province
  // LEAD can manage STAFF in same branch
}

match /users/{uid} {
  allow read: if canManageUsers();
  allow write: if canManageTargetUser(uid);
}
```

### **4. Role Assignment Validation**
```javascript
const validateRoleAssignment = (targetRole, currentUserRole, currentUserData) => {
  // ADMIN can assign any role
  if (actualCurrentRole === 'ADMIN') return { valid: true };
  
  // MANAGER can assign MANAGER, LEAD, STAFF (not ADMIN)
  if (actualCurrentRole === 'MANAGER') {
    if (['ADMIN'].includes(targetRole)) return { valid: false };
    return { valid: true };
  }
  
  // LEAD can assign STAFF only
  if (actualCurrentRole === 'LEAD') {
    if (!['STAFF'].includes(targetRole)) return { valid: false };
    return { valid: true };
  }
  
  // STAFF cannot assign roles
  return { valid: false };
};
```

---

## **🎯 USER EXPERIENCE**

### **ADMIN Experience**
- ✅ Sees all users across all provinces and branches
- ✅ Can assign any role to any user
- ✅ Full system administration capabilities

### **MANAGER Experience**
- ✅ Sees LEAD and STAFF users in their province
- ✅ Can assign MANAGER, LEAD, STAFF roles (not ADMIN)
- ✅ Geographic scope limited to their province

### **LEAD Experience**
- ✅ Sees STAFF users in their branch
- ✅ Can assign STAFF role only
- ✅ Geographic scope limited to their branch

### **STAFF Experience**
- ❌ Cannot access User Management page
- ❌ No user management capabilities

---

## **🔍 DEBUG & MONITORING**

### **Access Control Logging**
```javascript
console.log('👥 User Management Access Control:', {
  currentUserAuthority: currentUser?.access?.authority,
  totalUsers: enrichedUsersData.length,
  manageableUsers: manageableUsers.length,
  currentUserScope: {
    province: currentUser?.access?.geographic?.homeProvince,
    branch: currentUser?.access?.geographic?.homeBranch,
  }
});
```

### **Debug Tools Available**
- 🔧 **Debug Button**: Shows current user's RBAC structure
- 📊 **Console Logging**: Detailed access control information
- 🎯 **Role Help Modal**: Interactive guide for understanding permissions

---

## **🚀 BENEFITS OF HIERARCHICAL APPROACH**

### **✅ Advantages**
1. **Delegation**: Managers can handle their team without admin intervention
2. **Scalability**: Reduces admin workload as organization grows
3. **Geographic Control**: Natural alignment with branch/province structure
4. **Security**: Users only see what they need to manage
5. **Realistic**: Matches real-world organizational hierarchy

### **🔒 Security Features**
1. **Geographic Boundaries**: Province/branch-based access control
2. **Role Hierarchy**: Cannot assign roles higher than your own
3. **Firebase Rules**: Server-side validation of all operations
4. **Audit Trail**: Complete logging of all role changes

---

## **📋 TESTING SCENARIOS**

### **Test as ADMIN**
- ✅ Should see all users
- ✅ Should be able to assign any role
- ✅ Should be able to manage users across provinces

### **Test as MANAGER (NSN001)**
- ✅ Should see LEAD and STAFF in Nakhon Sawan province
- ❌ Should NOT see users from Nakhon Ratchasima
- ✅ Should be able to assign MANAGER, LEAD, STAFF roles
- ❌ Should NOT be able to assign ADMIN role

### **Test as LEAD (NSN001)**
- ✅ Should see STAFF in NSN001 branch only
- ❌ Should NOT see users from other branches
- ✅ Should be able to assign STAFF role only
- ❌ Should NOT be able to assign MANAGER, LEAD, or ADMIN roles

### **Test as STAFF**
- ❌ Should NOT be able to access User Management page

---

## **🎯 CONCLUSION**

The hierarchical approach provides:
- **Realistic delegation** of user management responsibilities
- **Geographic-based access control** aligned with business structure
- **Secure role assignment** with proper validation
- **Scalable architecture** that grows with the organization

This implementation perfectly balances **security**, **usability**, and **business requirements**.

---

**Implementation Date**: December 2024  
**Status**: ✅ **COMPLETE** - Ready for testing 