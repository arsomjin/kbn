/**
 * Fix Authentication Instability
 * This utility resolves flashing between pending and overview pages
 * by stabilizing the user's authentication and approval state
 */

import { app } from './firebase';
import { store } from './App';

/**
 * Analyze current authentication instability
 */
export const diagnoseAuthInstability = async () => {
  try {
    console.log('🔍 DIAGNOSING AUTHENTICATION INSTABILITY...');
    
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.log('❌ No user signed in');
      return { stable: false, issue: 'no_user' };
    }

    // Get user document
    const userDoc = await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();

    if (!userDoc.exists) {
      console.log('❌ User document not found');
      return { stable: false, issue: 'no_document' };
    }

    const userData = userDoc.data();
    
    // Check Redux state
    const reduxState = store.getState();
    const authUser = reduxState.auth.user;
    
    console.log('📊 AUTHENTICATION STATE ANALYSIS:');
    
    // Firestore approval indicators
    const firestoreApproval = {
      isActive: userData.isActive,
      isApproved: userData.isApproved,
      approvalStatus: userData.approvalStatus,
      authIsActive: userData.auth?.isActive,
      authIsApproved: userData.auth?.isApproved,
      authApprovalStatus: userData.auth?.approvalStatus,
      statusIsActive: userData.status?.isActive,
      statusIsApproved: userData.status?.isApproved,
      statusApprovalStatus: userData.status?.approvalStatus
    };
    
    // Redux approval indicators
    const reduxApproval = {
      isActive: authUser?.isActive,
      isApproved: authUser?.isApproved,
      isPendingApproval: authUser?.isPendingApproval,
      approvalStatus: authUser?.approvalStatus
    };
    
    // Check for conflicts
    const conflicts = [];
    
    // Conflict 1: Multiple approval sources disagreeing
    const approvalSources = [
      userData.isApproved,
      userData.auth?.isApproved,
      userData.status?.isApproved
    ].filter(val => val !== undefined);
    
    if (approvalSources.length > 1 && !approvalSources.every(val => val === approvalSources[0])) {
      conflicts.push('Multiple approval sources disagree');
    }
    
    // Conflict 2: Active status disagreement
    const activeSources = [
      userData.isActive,
      userData.auth?.isActive,
      userData.status?.isActive
    ].filter(val => val !== undefined);
    
    if (activeSources.length > 1 && !activeSources.every(val => val === activeSources[0])) {
      conflicts.push('Multiple active status sources disagree');
    }
    
    // Conflict 3: Redux vs Firestore mismatch
    if (authUser?.isPendingApproval === true && userData.isApproved === true) {
      conflicts.push('Redux shows pending but Firestore shows approved');
    }
    
    // Conflict 4: Missing Clean Slate RBAC
    if (!userData.access?.authority) {
      conflicts.push('Missing Clean Slate RBAC structure');
    }
    
    console.log('📋 Firestore Approval Data:', firestoreApproval);
    console.log('📋 Redux Approval Data:', reduxApproval);
    console.log('⚠️ Conflicts Found:', conflicts);
    
    const isStable = conflicts.length === 0;
    
    return {
      stable: isStable,
      conflicts,
      firestoreData: firestoreApproval,
      reduxData: reduxApproval,
      userData,
      recommendations: isStable ? [] : generateRecommendations(conflicts, userData)
    };
    
  } catch (error) {
    console.error('❌ Error diagnosing auth instability:', error);
    return { stable: false, issue: 'error', error: error.message };
  }
};

/**
 * Generate recommendations based on conflicts
 */
const generateRecommendations = (conflicts, userData) => {
  const recommendations = [];
  
  if (conflicts.includes('Multiple approval sources disagree')) {
    recommendations.push('Consolidate approval status to single source');
  }
  
  if (conflicts.includes('Multiple active status sources disagree')) {
    recommendations.push('Consolidate active status to single source');
  }
  
  if (conflicts.includes('Redux shows pending but Firestore shows approved')) {
    recommendations.push('Force auth refresh to sync Redux with Firestore');
  }
  
  if (conflicts.includes('Missing Clean Slate RBAC structure')) {
    recommendations.push('Add Clean Slate RBAC structure');
  }
  
  return recommendations;
};

/**
 * Fix authentication instability automatically
 */
export const fixAuthInstability = async () => {
  try {
    console.log('🔧 FIXING AUTHENTICATION INSTABILITY...');
    
    const diagnosis = await diagnoseAuthInstability();
    
    if (diagnosis.stable) {
      console.log('✅ Authentication is already stable');
      return true;
    }
    
    console.log('🔧 Applying fixes...');
    
    const currentUser = app.auth().currentUser;
    const userData = diagnosis.userData;
    
    // Fix 1: Consolidate approval status
    const finalApprovalStatus = userData.isApproved ?? userData.auth?.isApproved ?? userData.status?.isApproved ?? false;
    const finalActiveStatus = userData.isActive ?? userData.auth?.isActive ?? userData.status?.isActive ?? false;
    
    // Fix 2: Ensure Clean Slate RBAC exists
    let cleanSlateAccess = userData.access;
    if (!cleanSlateAccess?.authority) {
      console.log('🔧 Creating missing Clean Slate RBAC structure...');
      
      const userProvince = userData.province || userData.auth?.province || 'nakhon-ratchasima';
      const userBranch = userData.branch || userData.auth?.branch || '0450';
      const userDepartment = userData.department || userData.auth?.department || 'GENERAL';
      
      cleanSlateAccess = {
        authority: 'STAFF',
        geographic: {
          scope: 'BRANCH',
          allowedProvinces: [userProvince],
          allowedBranches: [userBranch],
          homeProvince: userProvince,
          homeBranch: userBranch
        },
        departments: [userDepartment.toUpperCase()],
        permissions: {
          [`${userDepartment.toLowerCase()}.view`]: true,
          [`${userDepartment.toLowerCase()}.edit`]: true
        },
        createdAt: new Date().toISOString(),
      };
    }
    
    // Fix 3: Update user document with consolidated data
    const updates = {
      // Consolidated approval status (Clean Slate structure)
      isActive: finalActiveStatus,
      isApproved: finalApprovalStatus,
      approvalStatus: finalApprovalStatus ? 'approved' : 'pending',
      
      // Clean Slate RBAC
      access: cleanSlateAccess,
      
      // Metadata
      updatedAt: Date.now(),
      stabilizedAt: Date.now(),
      stabilizedBy: 'auth-instability-fix'
    };
    
    console.log('📝 Applying stabilization updates:', updates);
    
    await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update(updates);
    
    console.log('✅ Firestore updated successfully');
    
    // Fix 4: Force Redux auth refresh
    console.log('🔄 Forcing Redux auth refresh...');
    
    // Clear any existing approval listeners
    if (window.approvalListener) {
      window.approvalListener();
      window.approvalListener = null;
    }
    
    // Dispatch auth refresh
    if (store.dispatch) {
      const { verifyAuth } = await import('./redux/actions/auth');
      store.dispatch(verifyAuth());
    }
    
    console.log('🎉 Authentication instability fixed!');
    console.log('🔄 Page will refresh automatically in 2 seconds...');
    
    // Automatic page refresh to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing auth instability:', error);
    return false;
  }
};

/**
 * Quick stability check
 */
export const quickStabilityCheck = async () => {
  const diagnosis = await diagnoseAuthInstability();
  
  if (diagnosis.stable) {
    console.log('✅ Authentication is stable');
  } else {
    console.log('⚠️ Authentication is unstable');
    console.log('💡 Run: fixAuthInstability() to fix automatically');
  }
  
  return diagnosis.stable;
};

/**
 * Force clear all authentication listeners and reset
 */
export const emergencyAuthReset = () => {
  console.log('🚨 EMERGENCY AUTH RESET...');
  
  // Clear all listeners
  if (window.approvalListener) {
    window.approvalListener();
    window.approvalListener = null;
  }
  
  // Clear Redux state
  if (store.dispatch) {
    store.dispatch({ type: 'CLEAR_AUTH_STATE' });
  }
  
  // Force page refresh
  console.log('🔄 Force refreshing page...');
  window.location.reload();
};

// Make functions available in console
window.diagnoseAuthInstability = diagnoseAuthInstability;
window.fixAuthInstability = fixAuthInstability;
window.quickStabilityCheck = quickStabilityCheck;
window.emergencyAuthReset = emergencyAuthReset;

// Auto-check for instability on load
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Auth Instability Fix Utility Loaded!');
  console.log('Available commands:');
  console.log('  - diagnoseAuthInstability() - Analyze current auth state');
  console.log('  - fixAuthInstability() - Fix instability automatically');
  console.log('  - quickStabilityCheck() - Quick stability check');
  console.log('  - emergencyAuthReset() - Emergency reset if stuck');
  
  // Auto-check after a delay
  setTimeout(async () => {
    try {
      const stable = await quickStabilityCheck();
      if (!stable) {
        console.log('🚨 AUTHENTICATION INSTABILITY DETECTED!');
        console.log('💡 This may cause flashing between pages');
        console.log('🔧 Run: fixAuthInstability() to fix automatically');
      }
    } catch (error) {
      // Silent fail for auto-check
    }
  }, 3000);
} 