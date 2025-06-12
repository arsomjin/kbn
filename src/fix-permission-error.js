/**
 * 🚨 EMERGENCY FIX - Permission Error Solution
 * 
 * This script migrates your current user from deprecated userRBAC structure 
 * to Clean Slate access structure to fix the "Missing or insufficient permissions" error.
 * 
 * HOW TO USE:
 * 1. Open browser console (F12)
 * 2. Paste this entire script
 * 3. Press Enter
 * 4. Follow the instructions
 */

console.log('🚨 PERMISSION ERROR FIX SCRIPT LOADED');
console.log('');

// Quick migration function
const fixPermissionError = async () => {
  try {
    console.log('🔧 FIXING PERMISSION ERROR...');
    console.log('');
    
    // Step 1: Check current user
    if (!window.store) {
      throw new Error('Redux store not found. Make sure app is loaded.');
    }
    
    const state = window.store.getState();
    const user = state.auth?.user;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    console.log('👤 Current user:', user.displayName, `(${user.uid})`);
    console.log('');
    
    // Step 2: Check user structure
    if (user.access && user.access.authority) {
      console.log('✅ User already has Clean Slate structure - no migration needed');
      console.log('🤔 Permission error might be due to other issues');
      return;
    }
    
    if (!user.userRBAC) {
      throw new Error('User has neither Clean Slate nor userRBAC structure');
    }
    
    console.log('🔍 Found deprecated userRBAC structure:');
    console.log('  Authority:', user.userRBAC.authority);
    console.log('  Departments:', user.userRBAC.departments);
    console.log('  Geographic:', user.userRBAC.geographic);
    console.log('');
    
    // Step 3: Convert to Clean Slate
    console.log('🔄 Converting to Clean Slate structure...');
    
    const cleanSlateAccess = {
      authority: user.userRBAC.authority || 'STAFF',
      geographic: {
        scope: user.userRBAC.geographic?.scope || 'BRANCH',
        allowedProvinces: user.userRBAC.geographic?.allowedProvinces || [],
        allowedBranches: user.userRBAC.geographic?.allowedBranches || [],
        homeProvince: user.userRBAC.geographic?.homeProvince || null,
        homeBranch: user.userRBAC.geographic?.homeBranch || null,
      },
      departments: user.userRBAC.departments || ['GENERAL'],
      permissions: {
        departments: {},
        features: {
          reports: { view: true, export: false },
          admin: { userManagement: false, systemConfig: false },
          developer: { tools: false, migration: false },
        },
      },
      createdAt: Date.now(),
      version: '2.0',
    };
    
    // Generate department permissions
    const allDepartments = ['accounting', 'sales', 'service', 'inventory', 'hr'];
    const departmentPermissions = {};
    
    allDepartments.forEach(dept => {
      const isUserDepartment = cleanSlateAccess.departments.includes(dept.toUpperCase());
      const isManager = ['ADMIN', 'MANAGER'].includes(cleanSlateAccess.authority);
      
      departmentPermissions[dept] = {
        view: isUserDepartment || isManager,
        edit: isUserDepartment || isManager,
        approve: isManager,
      };
    });
    
    cleanSlateAccess.permissions.departments = departmentPermissions;
    
    // Create clean user object
    const cleanUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      firstName: user.firstName,
      lastName: user.lastName,
      
      // Clean Slate RBAC structure (PRIMARY)
      access: cleanSlateAccess,
      
      // Essential metadata
      isActive: user.isActive !== false,
      isDev: user.isDev || false,
      createdAt: user.createdAt,
      updatedAt: Date.now(),
    };
    
    console.log('✅ Clean Slate structure created');
    console.log('');
    
    // Step 4: Update in Firestore
    console.log('💾 Updating user in Firestore...');
    
    const app = window.firebase;
    if (!app) {
      throw new Error('Firebase not found');
    }
    
    const firestore = app.firestore();
    await firestore.collection('users').doc(cleanUser.uid).set(cleanUser, { merge: false });
    
    console.log('✅ User updated in Firestore');
    console.log('');
    
    // Step 5: Update Redux
    console.log('🔄 Updating Redux store...');
    
    window.store.dispatch({
      type: 'USER_UPDATE',
      payload: cleanUser
    });
    
    console.log('✅ Redux store updated');
    console.log('');
    
    // Step 6: Success
    console.log('🎉 PERMISSION ERROR FIXED!');
    console.log('');
    console.log('📋 New user structure:');
    console.log('  Authority:', cleanUser.access.authority);
    console.log('  Geographic Scope:', cleanUser.access.geographic.scope);
    console.log('  Departments:', cleanUser.access.departments);
    console.log('  Home Province:', cleanUser.access.geographic.homeProvince);
    console.log('  Home Branch:', cleanUser.access.geographic.homeBranch);
    console.log('');
    console.log('🔄 Please refresh the page to apply changes');
    
  } catch (error) {
    console.error('❌ FAILED TO FIX PERMISSION ERROR:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure you are logged in');
    console.log('2. Make sure the app is fully loaded');
    console.log('3. Check browser network tab for errors');
    console.log('4. Try refreshing the page and running again');
  }
};

// Make function available globally
window.fixPermissionError = fixPermissionError;

console.log('📋 INSTRUCTIONS:');
console.log('1. Run: fixPermissionError()');
console.log('2. Wait for completion');
console.log('3. Refresh the page');
console.log('');
console.log('💡 Quick fix: window.fixPermissionError()');

// Auto-run if in development mode
if (process?.env?.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected - auto-checking...');
  setTimeout(() => {
    try {
      const state = window.store?.getState();
      const user = state?.auth?.user;
      
      if (user && user.userRBAC && !user.access) {
        console.log('⚠️ User needs migration - run fixPermissionError() to fix');
      }
    } catch (e) {
      // Silent fail
    }
  }, 2000);
} 