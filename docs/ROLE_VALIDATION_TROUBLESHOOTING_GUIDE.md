# 🔐 KBN Role Validation & Troubleshooting Guide

## Overview

This guide helps administrators understand and troubleshoot role validation issues in the KBN user management system, particularly the "บทบาทไม่ถูกต้อง" (Invalid Role) error.

## 🎯 **Quick Fix for Your Issue**

### **Problem**: "บทบาทไม่ถูกต้อง" when trying to assign Manager role

**Root Cause**: The system is checking your legacy `accessLevel` field instead of the new Clean Slate `access.authority` field.

**Solution**:
1. Run `makeMeAdmin()` in browser console (✅ You already did this)
2. **Refresh the page** to load your new Clean Slate RBAC structure
3. Try assigning the role again

### **Why This Happens**:
- `makeMeAdmin()` creates Clean Slate RBAC structure with `access.authority: 'ADMIN'`
- But the validation function was checking `currentUser.accessLevel` (legacy field)
- **Fixed**: Now checks `currentUser.access.authority` (Clean Slate field)

---

## 🏗️ **Role Hierarchy System**

### **Clean Slate RBAC Structure**

```
Level 4: ADMIN (ผู้ดูแลระบบ)
├── Can assign: ANY role to ANY user
├── Full system access
└── System configuration rights

Level 3: MANAGER (ผู้จัดการ)
├── Can assign: LEAD, STAFF
├── Cannot assign: ADMIN
└── Department management rights

Level 2: LEAD (หัวหน้าแผนก)
├── Can assign: STAFF only
├── Cannot assign: ADMIN, MANAGER
└── Team supervision rights

Level 1: STAFF (เจ้าหน้าที่)
├── Cannot assign any roles
└── Operational access only
```

### **Permission Matrix**

| Current Role | Can Assign To | Cannot Assign To |
|--------------|---------------|------------------|
| ADMIN | ADMIN, MANAGER, LEAD, STAFF | None |
| MANAGER | MANAGER, LEAD, STAFF | ADMIN |
| LEAD | STAFF | ADMIN, MANAGER |
| STAFF | None | All |

---

## 🚨 **Common Error Messages & Solutions**

### **1. "บทบาทไม่ถูกต้อง"**
**Meaning**: Invalid role specified
**Causes**:
- Trying to assign non-existent role
- System cannot identify your current role
**Solution**:
```bash
# Check your role structure
console.log(currentUser.access?.authority);
# Should show: 'ADMIN', 'MANAGER', 'LEAD', or 'STAFF'

# If undefined, you need Clean Slate migration
window.makeMeAdmin(); // Then refresh page
```

### **2. "ไม่มีสิทธิ์มอบหมายบทบาทนี้"**
**Meaning**: You don't have permission to assign this role
**Causes**:
- Trying to assign role equal/higher than yours
- Manager trying to assign ADMIN role
**Solution**:
- Check role hierarchy above
- Only assign roles below your level

### **3. "บัญชีของคุณยังไม่ได้อัปเดตเป็นระบบ RBAC ใหม่"**
**Meaning**: Your account needs Clean Slate RBAC migration
**Causes**:
- Account still using legacy RBAC structure
- Missing `access.authority` field
**Solution**:
```bash
# Migrate to Clean Slate RBAC
window.makeMeAdmin();
# Then refresh the page
```

### **4. "คุณไม่มีสิทธิ์มอบหมายบทบาทให้ผู้ใช้อื่น"**
**Meaning**: Staff users cannot assign roles
**Causes**:
- Your role is STAFF (level 1)
- Only LEAD+ can assign roles
**Solution**:
- Contact your manager to assign roles
- Or get promoted to LEAD/MANAGER

---

## 🔧 **Debugging Tools**

### **1. Check Your Current Role**
```javascript
// In browser console
console.log('Current User Debug Info:', {
  uid: currentUser?.uid,
  email: currentUser?.email,
  accessLevel: currentUser?.accessLevel, // Legacy
  authority: currentUser?.access?.authority, // Clean Slate
  geographic: currentUser?.access?.geographic,
  departments: currentUser?.access?.departments
});
```

### **2. Validate Clean Slate Structure**
```javascript
// Check if user has proper Clean Slate RBAC
const hasCleanSlate = !!(currentUser?.access?.authority);
console.log('Has Clean Slate RBAC:', hasCleanSlate);

if (!hasCleanSlate) {
  console.log('❌ User needs Clean Slate migration');
  console.log('Run: window.makeMeAdmin()');
}
```

### **3. Test Role Assignment**
```javascript
// Test if you can assign a specific role
const targetRole = 'MANAGER';
const yourRole = currentUser?.access?.authority;

console.log(`Can ${yourRole} assign ${targetRole}?`);
// Check against permission matrix above
```

---

## 🛠️ **Admin Commands**

### **Create Different Role Types**
```javascript
// Make yourself Super Admin
window.makeMeAdmin();

// Create test users with different roles
window.makeMeSalesManager();
window.makeMeSalesStaff();
window.makeMeAccountingStaff();
```

### **Role Management Commands**
```javascript
// Check all available roles
console.log('Available Roles:', ['ADMIN', 'MANAGER', 'LEAD', 'STAFF']);

// Validate role assignment
function canAssignRole(currentRole, targetRole) {
  const hierarchy = { ADMIN: 4, MANAGER: 3, LEAD: 2, STAFF: 1 };
  
  if (currentRole === 'ADMIN') return true;
  if (currentRole === 'MANAGER' && targetRole !== 'ADMIN') return true;
  if (currentRole === 'LEAD' && targetRole === 'STAFF') return true;
  
  return false;
}
```

---

## 📋 **Step-by-Step Troubleshooting**

### **When You Get "บทบาทไม่ถูกต้อง" Error:**

1. **Check Your Role Structure**
   ```javascript
   console.log(currentUser?.access?.authority);
   ```

2. **If Undefined - Migrate to Clean Slate**
   ```javascript
   window.makeMeAdmin();
   // Wait for success message
   // Refresh the page
   ```

3. **Verify Migration Success**
   ```javascript
   console.log(currentUser?.access?.authority); // Should show 'ADMIN'
   ```

4. **Try Role Assignment Again**
   - Go to User Management
   - Select user to edit
   - Choose role (should work now)

5. **If Still Failing - Check Target Role**
   - Ensure you're selecting valid role: ADMIN, MANAGER, LEAD, STAFF
   - Check role hierarchy permissions

---

## 🎯 **Best Practices**

### **For Administrators**
1. **Always use Clean Slate RBAC** - Run `makeMeAdmin()` if needed
2. **Understand role hierarchy** - Don't try to assign higher roles
3. **Test in development** - Use test accounts before production
4. **Document changes** - Keep track of role assignments

### **For Developers**
1. **Check Clean Slate structure** before role operations
2. **Use proper validation** - Check `access.authority` not `accessLevel`
3. **Provide clear error messages** - Help users understand issues
4. **Log debugging info** - Make troubleshooting easier

### **For Users**
1. **Contact admin** if you can't assign roles
2. **Don't try to assign higher roles** - Follow hierarchy
3. **Refresh page** after role changes
4. **Report persistent issues** - Help improve the system

---

**Last Updated**: December 2024  
**Version**: 2.0 (Clean Slate RBAC)  
**Status**: ✅ Role validation system enhanced with detailed error messages 