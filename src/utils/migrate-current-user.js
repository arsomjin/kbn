/**
 * MIGRATE CURRENT USER - Emergency migration utility
 * Converts current user from deprecated userRBAC structure to Clean Slate access structure
 */

import { store } from '../App';

/**
 * Get current user from Redux store
 */
const getCurrentUser = () => {
  const state = store.getState();
  return state.auth?.user;
};

/**
 * Convert deprecated userRBAC structure to Clean Slate access structure
 * @param {Object} user - User with userRBAC structure
 * @returns {Object} User with Clean Slate access structure
 */
const convertUserRBACToCleanSlate = (user) => {
  if (!user || !user.userRBAC) {
    console.error('❌ User does not have userRBAC structure to convert');
    return null;
  }

  console.log('🔄 Converting userRBAC to Clean Slate structure...');

  // Extract from userRBAC structure
  const { userRBAC } = user;
  
  // Create Clean Slate access structure
  const cleanSlateAccess = {
    authority: userRBAC.authority || 'STAFF',
    geographic: {
      scope: userRBAC.geographic?.scope || 'BRANCH',
      allowedProvinces: userRBAC.geographic?.allowedProvinces || [],
      allowedBranches: userRBAC.geographic?.allowedBranches || [],
      homeProvince: userRBAC.geographic?.homeProvince || null,
      homeBranch: userRBAC.geographic?.homeBranch || null,
    },
    departments: userRBAC.departments || ['GENERAL'],
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

  // Generate department permissions based on authority and departments
  const departmentPermissions = {};
  const allDepartments = ['accounting', 'sales', 'service', 'inventory', 'hr'];
  
  allDepartments.forEach(dept => {
    const isUserDepartment = cleanSlateAccess.departments.includes(dept.toUpperCase());
    const isAdmin = cleanSlateAccess.authority === 'ADMIN';
    const isManager = ['ADMIN', 'MANAGER'].includes(cleanSlateAccess.authority);
    
    if (isUserDepartment || isManager) {
      departmentPermissions[dept] = {
        view: true,
        edit: true,
        approve: isManager,
      };
    } else {
      departmentPermissions[dept] = {
        view: false,
        edit: false,
        approve: false,
      };
    }
  });

  cleanSlateAccess.permissions.departments = departmentPermissions;

  // Create clean user object with ONLY Clean Slate structure
  const cleanUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    
    // Clean Slate RBAC structure (PRIMARY)
    access: cleanSlateAccess,
    
    // Essential metadata
    isActive: user.isActive !== false,
    isDev: user.isDev || false,
    createdAt: user.createdAt,
    updatedAt: Date.now(),
    
    // Remove ALL legacy fields - no fallbacks
    // userRBAC: removed
    // accessLevel: removed
    // allowedProvinces: removed
    // allowedBranches: removed
    // etc.
  };

  console.log('✅ Successfully converted to Clean Slate structure');
  return cleanUser;
};

/**
 * Update user in Firestore with Clean Slate structure
 * @param {Object} cleanUser - User with Clean Slate structure
 */
const updateUserInFirestore = async (cleanUser) => {
  try {
    console.log('🔄 Updating user in Firestore...');
    
    // Get Firebase instance
    const firebase = window.firebase || require('firebase/app').default;
    const firestore = firebase.firestore();
    
    // Update user document
    await firestore.collection('users').doc(cleanUser.uid).set(cleanUser, { merge: false });
    
    console.log('✅ User updated in Firestore successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to update user in Firestore:', error);
    return false;
  }
};

/**
 * Update user in Redux store
 * @param {Object} cleanUser - User with Clean Slate structure
 */
const updateUserInRedux = (cleanUser) => {
  try {
    console.log('🔄 Updating user in Redux store...');
    
    // Dispatch USER_UPDATE action
    store.dispatch({
      type: 'USER_UPDATE',
      payload: cleanUser
    });
    
    console.log('✅ User updated in Redux successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to update user in Redux:', error);
    return false;
  }
};

/**
 * MAIN MIGRATION FUNCTION
 * Migrates current user from userRBAC to Clean Slate structure
 */
export const migrateCurrentUser = async () => {
  try {
    console.log('🚀 Starting current user migration to Clean Slate...');
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }
    
    console.log('👤 Current user:', currentUser.displayName, currentUser.uid);
    
    // Check if already Clean Slate
    if (currentUser.access && currentUser.access.authority) {
      console.log('✅ User already has Clean Slate structure');
      return currentUser;
    }
    
    // Check if has userRBAC structure
    if (!currentUser.userRBAC) {
      throw new Error('User does not have userRBAC structure to migrate');
    }
    
    // Convert to Clean Slate
    const cleanUser = convertUserRBACToCleanSlate(currentUser);
    if (!cleanUser) {
      throw new Error('Failed to convert user to Clean Slate structure');
    }
    
    // Update in Firestore
    const firestoreSuccess = await updateUserInFirestore(cleanUser);
    if (!firestoreSuccess) {
      throw new Error('Failed to update user in Firestore');
    }
    
    // Update in Redux
    const reduxSuccess = updateUserInRedux(cleanUser);
    if (!reduxSuccess) {
      throw new Error('Failed to update user in Redux');
    }
    
    console.log('🎉 MIGRATION COMPLETE! User successfully migrated to Clean Slate structure');
    console.log('📋 New user structure:', cleanUser);
    
    return cleanUser;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

/**
 * Check current user structure and migration status
 */
export const checkUserStructure = () => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    console.log('❌ No current user found');
    return;
  }
  
  console.log('🔍 Current User Structure Analysis:');
  console.log('User ID:', currentUser.uid);
  console.log('Display Name:', currentUser.displayName);
  console.log('');
  
  // Check for Clean Slate structure
  if (currentUser.access && currentUser.access.authority) {
    console.log('✅ HAS Clean Slate structure (user.access.*)');
    console.log('Authority:', currentUser.access.authority);
    console.log('Geographic Scope:', currentUser.access.geographic?.scope);
    console.log('Departments:', currentUser.access.departments);
  } else {
    console.log('❌ MISSING Clean Slate structure (user.access.*)');
  }
  
  // Check for deprecated structures
  if (currentUser.userRBAC) {
    console.log('⚠️ HAS deprecated userRBAC structure');
    console.log('Authority:', currentUser.userRBAC.authority);
    console.log('Geographic:', currentUser.userRBAC.geographic);
  }
  
  if (currentUser.accessLevel) {
    console.log('⚠️ HAS legacy accessLevel:', currentUser.accessLevel);
  }
  
  // Recommendation
  if (!currentUser.access) {
    console.log('');
    console.log('🔧 RECOMMENDATION: Run migrateCurrentUser() to fix structure');
  } else {
    console.log('');
    console.log('✅ User structure is correct - no migration needed');
  }
};

// Make functions available globally for easy console access
if (typeof window !== 'undefined') {
  window.migrateCurrentUser = migrateCurrentUser;
  window.checkUserStructure = checkUserStructure;
}

console.log('🔧 Migration utilities loaded:');
console.log('- window.checkUserStructure() - Check current user structure');
console.log('- window.migrateCurrentUser() - Migrate current user to Clean Slate'); 