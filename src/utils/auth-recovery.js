/**
 * Authentication Recovery Utility
 * Helps users who get stuck in auth limbo state
 */

import { app } from '../firebase';

/**
 * Detect and fix auth limbo state
 * When user is signed in to Firebase but not properly authenticated in app
 */
export const detectAuthLimbo = () => {
  const firebaseUser = app.auth().currentUser;
  const reduxState = window.store?.getState?.()?.auth;
  
  const isInLimbo = !!(
    firebaseUser && 
    firebaseUser.uid && 
    (!reduxState?.isAuthenticated || !reduxState?.user?.uid)
  );
  
  if (isInLimbo) {
    console.warn('🚨 AUTH LIMBO DETECTED:', {
      firebaseUser: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified
      },
      reduxState: {
        isAuthenticated: reduxState?.isAuthenticated,
        hasUser: !!reduxState?.user?.uid,
        userUid: reduxState?.user?.uid
      }
    });
  }
  
  return isInLimbo;
};

/**
 * Force recovery from auth limbo state
 */
export const recoverFromAuthLimbo = async () => {
  console.log('🔧 Attempting auth limbo recovery...');
  
  try {
    const firebaseUser = app.auth().currentUser;
    
    if (!firebaseUser) {
      console.log('❌ No Firebase user found - cannot recover');
      return false;
    }
    
    console.log('🔍 Checking user document in Firestore...');
    
    // Check if user document exists
    const userDoc = await app.firestore()
      .collection('users')
      .doc(firebaseUser.uid)
      .get();
    
    if (!userDoc.exists) {
      console.error('❌ User document not found in Firestore');
      console.log('🔄 Signing out Firebase user...');
      await app.auth().signOut();
      return false;
    }
    
    const userData = userDoc.data();
    console.log('✅ User document found:', {
      uid: userData.uid,
      email: userData.email,
      hasAccess: !!userData.access,
      approvalStatus: userData.approvalStatus
    });
    
    // Check if user has valid Clean Slate structure
    const hasValidStructure = !!(
      userData.access?.authority && 
      userData.access?.geographic && 
      Array.isArray(userData.access?.departments)
    );
    
    if (!hasValidStructure) {
      console.warn('⚠️ User missing Clean Slate structure - needs migration');
      
      // Try auto-migration
      try {
        const { migrateToOrthogonalSystem } = await import('./orthogonal-rbac');
        const cleanSlateUser = migrateToOrthogonalSystem(userData);
        
        if (cleanSlateUser?.access) {
          console.log('🔄 Auto-migrating user...');
          
          const updatedUserData = {
            uid: firebaseUser.uid,
            email: userData.email || firebaseUser.email,
            displayName: userData.displayName || firebaseUser.displayName,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            access: cleanSlateUser.access,
            isActive: userData.isActive !== false,
            isApproved: userData.isApproved !== false,
            approvalStatus: userData.approvalStatus || 'approved',
            isDev: userData.isDev || false,
            created: userData.created || Date.now(),
            updatedAt: Date.now(),
            migratedAt: Date.now(),
          };

          await app.firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .set(updatedUserData, { merge: false });
          
          console.log('✅ User auto-migrated successfully');
        } else {
          console.error('❌ Auto-migration failed');
          await app.auth().signOut();
          return false;
        }
      } catch (migrationError) {
        console.error('❌ Migration error:', migrationError);
        await app.auth().signOut();
        return false;
      }
    }
    
    // Force re-verification
    console.log('🔄 Forcing auth re-verification...');
    
    if (window.store?.dispatch) {
      const { verifyAuth } = await import('../redux/actions/auth');
      window.store.dispatch(verifyAuth());
      
      console.log('✅ Auth recovery initiated - page will reload');
      
      // Give it a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return true;
    } else {
      console.error('❌ Redux store not available');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Auth recovery failed:', error);
    
    // Last resort - sign out
    try {
      await app.auth().signOut();
      console.log('🔄 Signed out user as last resort');
    } catch (signOutError) {
      console.error('❌ Failed to sign out:', signOutError);
    }
    
    return false;
  }
};

/**
 * Comprehensive auth state debugging
 */
export const debugAuthState = () => {
  console.log('🔍 AUTH STATE DEBUG REPORT');
  console.log('='.repeat(50));
  
  // Firebase Auth State
  const firebaseUser = app.auth().currentUser;
  console.log('Firebase Auth User:', firebaseUser ? {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    isAnonymous: firebaseUser.isAnonymous,
    displayName: firebaseUser.displayName
  } : 'Not signed in');
  
  // Redux Auth State
  const reduxState = window.store?.getState?.()?.auth;
  console.log('Redux Auth State:', reduxState ? {
    isAuthenticated: reduxState.isAuthenticated,
    isLoggingIn: reduxState.isLoggingIn,
    isVerifying: reduxState.isVerifying,
    userUid: reduxState.user?.uid,
    userEmail: reduxState.user?.email,
    hasAccess: !!reduxState.user?.access,
    authority: reduxState.user?.access?.authority
  } : 'Redux not available');
  
  // Auth Limbo Detection
  const isInLimbo = detectAuthLimbo();
  console.log('Auth Limbo Status:', isInLimbo ? '🚨 DETECTED' : '✅ Normal');
  
  // Navigation State
  const currentPath = window.location.pathname;
  console.log('Current Path:', currentPath);
  
  console.log('='.repeat(50));
  
  if (isInLimbo) {
    console.log('🔧 RECOVERY OPTIONS:');
    console.log('1. Run: window.recoverFromAuthLimbo()');
    console.log('2. Manual: Sign out and sign in again');
    console.log('3. Clear browser data and try again');
  }
  
  return {
    firebaseUser: !!firebaseUser,
    reduxAuthenticated: reduxState?.isAuthenticated,
    isInLimbo,
    currentPath
  };
};

/**
 * Auto-detect and recover from auth limbo on page load
 */
export const autoRecoverAuthLimbo = () => {
  // Wait for app to initialize
  setTimeout(() => {
    if (detectAuthLimbo()) {
      console.warn('🚨 Auth limbo detected on page load - attempting auto-recovery...');
      recoverFromAuthLimbo();
    }
  }, 3000);
};

// Export for global access
if (typeof window !== 'undefined') {
  window.detectAuthLimbo = detectAuthLimbo;
  window.recoverFromAuthLimbo = recoverFromAuthLimbo;
  window.debugAuthState = debugAuthState;
  window.autoRecoverAuthLimbo = autoRecoverAuthLimbo;
  
  console.log('🔧 Auth Recovery Utilities Available:');
  console.log('- window.detectAuthLimbo()');
  console.log('- window.recoverFromAuthLimbo()');
  console.log('- window.debugAuthState()');
  console.log('- window.autoRecoverAuthLimbo()');
}

export default {
  detectAuthLimbo,
  recoverFromAuthLimbo,
  debugAuthState,
  autoRecoverAuthLimbo
}; 