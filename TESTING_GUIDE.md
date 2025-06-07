# KBN RBAC Integration Testing Guide

## 🧪 **Test the Overview Module Integration**

We just implemented RBAC in the Overview module. Let's test it step by step!

---

## 📋 **Quick Test Checklist**

### **Test 1: Check if Code Compiles**

1. **Start your development server**:

   ```bash
   npm start
   # or
   yarn start
   ```

2. **Check browser console** for any errors
3. **Navigate to** `/overview` page
4. **Verify** page loads without breaking

### **Test 2: Test RBAC Demo**

1. **Navigate to**: `/developer/test-multi-province`
2. **Switch user roles** using the demo dashboard
3. **Navigate back to** `/overview`
4. **Observe** different behavior for different roles

### **Test 3: Manual Role Testing**

#### **Expected Behavior:**

| User Role            | Should See                                      | Should NOT See                           |
| -------------------- | ----------------------------------------------- | ---------------------------------------- |
| **SUPER_ADMIN**      | Dashboard                                       | Landing Page (unless fallback triggered) |
| **PROVINCE_MANAGER** | Dashboard                                       | Landing Page (unless fallback triggered) |
| **BRANCH_MANAGER**   | Dashboard                                       | Landing Page (unless fallback triggered) |
| **SALES_STAFF**      | Dashboard (if has reports.view) OR Landing Page | -                                        |
| **No Permissions**   | Landing Page                                    | Dashboard                                |

---

## 🔧 **Testing Methods**

### **Method 1: Using RBAC Demo Dashboard**

1. **Go to**: `http://localhost:3000/developer/test-multi-province`
2. **Use Role Switcher** in the demo
3. **Navigate to Overview**: `http://localhost:3000/overview`
4. **Check behavior** for each role

### **Method 2: Browser Console Testing**

```javascript
// Open browser console and run:

// Check current user permissions
console.log("Current User:", window.store.getState().auth.user);
console.log("RBAC State:", window.store.getState().rbac);

// Test permission functions
const { usePermissions } = window.KBNComponents;
// Note: This won't work directly in console, use RBAC Demo instead
```

### **Method 3: Code-level Testing**

Add temporary logging to see what's happening:

```javascript
// In src/Modules/Overview/index.js, add these console.logs:

console.log("🧪 RBAC Test - User:", user?.displayName);
console.log("🧪 RBAC Test - isSuperAdmin:", isSuperAdmin);
console.log(
  "🧪 RBAC Test - hasPermission(reports.view):",
  hasPermission("reports.view")
);
console.log(
  "🧪 RBAC Test - hasDepartmentAccess(reports):",
  hasDepartmentAccess("reports")
);
console.log("🧪 RBAC Test - canAccessDashboard:", canAccessDashboard);
```

---

## 🐛 **Troubleshooting Common Issues**

### **Issue 1: Import Errors**

```
Error: Cannot resolve 'components' or 'hooks/usePermissions'
```

**Solution**: Check that exports are correct in:

- `src/components/index.js`
- `src/hooks/usePermissions.js`

### **Issue 2: Permission Always False**

```
All users see Landing Page instead of Dashboard
```

**Solution**:

1. Check if RBAC migration has been run
2. Verify user has proper permissions in Firebase
3. Use RBAC Demo to set test permissions

### **Issue 3: Component Not Rendering**

```
Blank page or React error
```

**Solution**:

1. Check browser console for errors
2. Verify all imports are correct
3. Check Redux state in browser dev tools

---

## ✅ **Expected Test Results**

### **When Working Correctly:**

1. **Developer/Super Admin**:

   - Always sees Dashboard
   - No permission gate restrictions

2. **Province Manager**:

   - Sees Dashboard (has reports.view permission)
   - Permission gate allows access

3. **Branch Manager**:

   - Sees Dashboard (has reports.view permission)
   - Permission gate allows access

4. **Staff Users**:

   - May see Dashboard OR Landing Page
   - Depends on their specific permissions

5. **No Permission Users**:
   - Always sees Landing Page
   - Permission gate blocks Dashboard access

---

## 🚀 **Next Steps After Testing**

### **If Tests Pass ✅:**

1. **Document findings**: What works well?
2. **Ready for Step 2**: Dashboard component enhancement
3. **Plan next module**: Sales or Account module

### **If Tests Fail ❌:**

1. **Check error messages** in browser console
2. **Verify RBAC system** is properly initialized
3. **Test with RBAC Demo** first
4. **Report specific issues** for debugging

---

## 📝 **Test Report Template**

```markdown
## Overview Module RBAC Test Results

### Environment:

- Browser: Chrome/Firefox/Safari
- Node Version:
- React Version:

### Test Results:

- [ ] Code compiles without errors
- [ ] Page loads successfully
- [ ] SUPER_ADMIN sees Dashboard
- [ ] PROVINCE_MANAGER sees Dashboard
- [ ] BRANCH_MANAGER sees Dashboard
- [ ] STAFF sees appropriate content
- [ ] No permission user sees Landing Page

### Issues Found:

1. [Describe any issues]

### Next Steps:

1. [What to do next]
```

---

**Ready to test?** Start with Test 1 and let me know the results!
