# 🚀 SUPER ADMIN SETUP GUIDE

## Quick Setup (2 Minutes)

### Step 1: Login to the System
1. Open your browser and go to `http://localhost:3030` or `http://localhost:3031`
2. Login with any email/password (Firebase Auth will create the user)
3. You'll see "Access Denied" - this is expected for new users

### Step 2: Open Browser Console
1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Go to the **Console** tab
3. You should see the message: "🎭 Super Admin Creation Script Loaded!"

### Step 3: Create Super Admin
Run this command in the console:
```javascript
window.createSuperAdmin()
```

You should see:
```
🚀 Creating Super Admin...
👤 Current user: your-email@example.com
🔧 Setting up Super Admin access...
✅ Super Admin created successfully!
🎯 User now has:
   - Full system access (ADMIN authority)
   - All provinces and branches
   - All permissions (*)
   - Dev access enabled

🔄 Please refresh the page to see changes.
```

### Step 4: Refresh and Enjoy
1. Refresh the page (`Ctrl+R` or `Cmd+R`)
2. You now have **FULL SYSTEM ACCESS** 🎉

---

## Alternative Quick Commands

### Super Admin (Full Access)
```javascript
window.makeMeSuperAdmin()
```

### Sales Manager (NSN001)
```javascript
window.makeMeSalesManager()
```

### Sales Staff (NSN001)
```javascript
window.makeMeSalesStaff()
```

### Accounting Staff (NSN001)
```javascript
window.makeMeAccountingStaff()
```

---

## Custom Role Creation

### Create Custom Test User
```javascript
window.createTestUser('SALES_STAFF', 'nakhon-sawan', 'NSN001')
```

**Parameters:**
- `role`: 'SALES_MANAGER', 'SALES_STAFF', 'ACCOUNTING_STAFF'
- `province`: 'nakhon-ratchasima', 'nakhon-sawan'
- `branch`: '0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'

---

## What Super Admin Gets

### 🔐 **Full Permissions**
- All department access (sales, accounting, service, inventory, hr)
- All document actions (view, edit, approve, manage)
- System administration capabilities
- User management access

### 🌍 **Geographic Access**
- **All Provinces**: Nakhon Ratchasima, Nakhon Sawan
- **All Branches**: 0450, NMA002, NMA003, NSN001, NSN002, NSN003
- **Home Base**: Nakhon Ratchasima (0450)

### 🎯 **Special Privileges**
- Developer access (`isDev: true`)
- Bypass all permission checks
- Access to admin tools and settings
- Complete system visibility

---

## Troubleshooting

### ❌ "No user logged in"
**Solution**: Make sure you're logged in first
1. Go to the login page
2. Enter any email/password
3. Firebase will create the account automatically
4. Then run the super admin command

### ❌ "Access Denied" after creating Super Admin
**Solution**: Refresh the page
- The browser cache needs to reload user data
- Press `Ctrl+R` or `Cmd+R` to refresh

### ❌ Console commands not available
**Solution**: Check if script is loaded
1. Look for "🎭 Super Admin Creation Script Loaded!" in console
2. If not visible, refresh the page
3. The script auto-loads with the application

### ❌ Firestore permission errors
**Solution**: Check Firebase configuration
- Ensure Firestore rules allow user document updates
- Development mode should have permissive rules

---

## Security Notes

### 🔒 **Production Safety**
- This script is for **DEVELOPMENT ONLY**
- Never use in production environment
- Super Admin creation should be done through secure admin panel

### 🛡️ **Best Practices**
- Create Super Admin only when needed
- Use test users for regular development
- Don't share Super Admin credentials
- Regularly audit admin access

---

## Advanced Usage

### Multiple Test Users
Create different users for comprehensive testing:

```javascript
// Create Sales Manager
window.createTestUser('SALES_MANAGER', 'nakhon-sawan', 'NSN001')

// Create Sales Staff  
window.createTestUser('SALES_STAFF', 'nakhon-ratchasima', '0450')

// Create Accounting Staff
window.createTestUser('ACCOUNTING_STAFF', 'nakhon-sawan', 'NSN002')
```

### Testing Different Scenarios
1. **Multi-Province Access**: Create users in different provinces
2. **Department Isolation**: Test department-specific permissions
3. **Branch Restrictions**: Verify branch-level access controls
4. **Permission Boundaries**: Test edge cases and restrictions

---

## Quick Reference

| Command | Result | Access Level |
|---------|--------|--------------|
| `window.createSuperAdmin()` | Full system admin | ALL |
| `window.makeMeSalesManager()` | Sales manager NSN001 | PROVINCE |
| `window.makeMeSalesStaff()` | Sales staff NSN001 | BRANCH |
| `window.makeMeAccountingStaff()` | Accounting staff NSN001 | BRANCH |

---

**🎯 Ready to become Super Admin? Run `window.createSuperAdmin()` in your browser console!**

---

_Last Updated: December 2024_  
_KBN Multi-Province RBAC System_ 