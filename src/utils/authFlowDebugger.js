/**
 * Authentication Flow Debugger
 * Helps diagnose permission issues during app initialization
 */

import { app } from '../firebase';
import { store } from '../App';

/**
 * Monitor authentication flow events
 */
export const debugAuthFlow = () => {
  console.log('🔍 AUTHENTICATION FLOW DEBUGGER ACTIVE');
  
  // Track Redux state changes
  let lastAuthState = null;
  
  const unsubscribeStore = store.subscribe(() => {
    const currentState = store.getState();
    const authState = currentState.auth;
    
    // Only log when auth state actually changes
    if (JSON.stringify(authState) !== JSON.stringify(lastAuthState)) {
      console.log('🔄 Auth State Change:', {
        timestamp: new Date().toISOString(),
        isAuthenticated: authState.isAuthenticated,
        isVerifying: authState.isVerifying,
        hasUser: !!authState.user,
        userUID: authState.user?.uid,
        hasAccess: !!authState.user?.access,
        isPending: !!authState.user?.isPendingApproval,
        error: authState.error
      });
      
      lastAuthState = authState;
    }
  });
  
  // Track Firebase auth state changes
  const unsubscribeFirebase = app.auth().onAuthStateChanged((user) => {
    console.log('🔥 Firebase Auth State Change:', {
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      userUID: user?.uid,
      emailVerified: user?.emailVerified
    });
  });
  
  // Return cleanup function
  return () => {
    console.log('🔍 Stopping authentication flow debugger');
    unsubscribeStore();
    unsubscribeFirebase();
  };
};

/**
 * Test Firebase permissions for current user
 */
export const testFirebasePermissions = async () => {
  console.log('🔒 TESTING FIREBASE PERMISSIONS...');
  
  const currentUser = app.auth().currentUser;
  if (!currentUser) {
    console.log('❌ No user signed in');
    return { success: false, error: 'No user signed in' };
  }
  
  const testCollections = [
    'data/company/provinces',
    'data/company/branches', 
    'data/company/departments',
    'data/company/banks',
    'data/company/permissions',
    'users'
  ];
  
  const results = {};
  
  for (const collectionPath of testCollections) {
    try {
      console.log(`📚 Testing collection: ${collectionPath}`);
      
      const query = app.firestore().collection(collectionPath).limit(1);
      const snapshot = await query.get();
      
      results[collectionPath] = {
        success: true,
        docCount: snapshot.size,
        message: `✅ Access granted (${snapshot.size} docs)`
      };
      
      console.log(`✅ ${collectionPath}: Access granted (${snapshot.size} docs)`);
      
    } catch (error) {
      results[collectionPath] = {
        success: false,
        error: error.code,
        message: `❌ ${error.code}: ${error.message}`
      };
      
      console.log(`❌ ${collectionPath}: ${error.code}`);
    }
  }
  
  console.log('🔒 PERMISSION TEST COMPLETE:', results);
  return results;
};

/**
 * Check user document structure
 */
export const checkUserDocument = async () => {
  console.log('👤 CHECKING USER DOCUMENT STRUCTURE...');
  
  const currentUser = app.auth().currentUser;
  if (!currentUser) {
    console.log('❌ No user signed in');
    return null;
  }
  
  try {
    const userDoc = await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();
    
    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return { exists: false };
    }
    
    const userData = userDoc.data();
    
    const analysis = {
      exists: true,
      hasAccess: !!userData.access,
      hasAuthority: !!userData.access?.authority,
      authority: userData.access?.authority,
      isApproved: userData.isApproved,
      isActive: userData.isActive,
      isPendingApproval: userData.isPendingApproval,
      approvalStatus: userData.approvalStatus,
      isDev: userData.isDev,
      structure: {
        rootLevel: Object.keys(userData),
        accessLevel: userData.access ? Object.keys(userData.access) : null
      }
    };
    
    console.log('👤 User Document Analysis:', analysis);
    return analysis;
    
  } catch (error) {
    console.error('❌ Error checking user document:', error);
    return { error: error.message };
  }
};

/**
 * Monitor and fix permission issues automatically
 */
export const autoFixPermissionIssues = async () => {
  console.log('🔧 AUTO-FIXING PERMISSION ISSUES...');
  
  try {
    // 1. Check current user
    const userAnalysis = await checkUserDocument();
    if (!userAnalysis || !userAnalysis.exists) {
      console.log('❌ Cannot auto-fix: User document missing');
      return { success: false, error: 'User document missing' };
    }
    
    // 2. Test permissions
    const permissionTest = await testFirebasePermissions();
    const failedCollections = Object.entries(permissionTest)
      .filter(([_, result]) => !result.success)
      .map(([collection, _]) => collection);
    
    if (failedCollections.length === 0) {
      console.log('✅ All permissions working correctly');
      return { success: true, message: 'All permissions working' };
    }
    
    console.log('⚠️ Failed collections:', failedCollections);
    
    // 3. For development environment, try self-approval
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Attempting self-approval...');
      
      const { approveSelf } = await import('./selfApproval');
      const approvalResult = await approveSelf();
      
      if (approvalResult.success) {
        console.log('✅ Self-approval successful!');
        
        // Wait for changes to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Re-test permissions
        const retestResults = await testFirebasePermissions();
        const stillFailing = Object.entries(retestResults)
          .filter(([_, result]) => !result.success)
          .map(([collection, _]) => collection);
        
        if (stillFailing.length === 0) {
          return { 
            success: true, 
            message: 'Auto-fix successful via self-approval',
            actions: ['self-approval']
          };
        } else {
          return { 
            success: false, 
            message: 'Self-approval completed but some permissions still failing',
            stillFailing
          };
        }
      }
    }
    
    // 4. If auto-fix fails, provide instructions
    return {
      success: false,
      message: 'Auto-fix not available for this environment',
      instructions: [
        'Check Firebase security rules',
        'Verify user approval status',
        'Contact system administrator'
      ]
    };
    
  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Comprehensive authentication flow diagnosis
 */
export const diagnoseAuthenticationFlow = async () => {
  console.log('🩺 COMPREHENSIVE AUTHENTICATION DIAGNOSIS...');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    firebase: {},
    redux: {},
    permissions: {},
    user: {},
    recommendations: []
  };
  
  try {
    // 1. Firebase auth state
    const currentUser = app.auth().currentUser;
    diagnosis.firebase = {
      isSignedIn: !!currentUser,
      uid: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified
    };
    
    // 2. Redux auth state
    const reduxState = store.getState();
    diagnosis.redux = {
      isAuthenticated: reduxState.auth.isAuthenticated,
      isVerifying: reduxState.auth.isVerifying,
      hasUser: !!reduxState.auth.user,
      userUID: reduxState.auth.user?.uid,
      error: reduxState.auth.error
    };
    
    // 3. User document analysis
    if (currentUser) {
      diagnosis.user = await checkUserDocument();
    }
    
    // 4. Permission test
    if (currentUser) {
      diagnosis.permissions = await testFirebasePermissions();
    }
    
    // 5. Generate recommendations
    if (!diagnosis.firebase.isSignedIn) {
      diagnosis.recommendations.push('User needs to sign in');
    } else if (!diagnosis.user.hasAccess) {
      diagnosis.recommendations.push('User missing Clean Slate RBAC structure');
    } else if (diagnosis.user.isApproved === false) {
      diagnosis.recommendations.push('User pending approval');
    } else {
      const failedPermissions = Object.entries(diagnosis.permissions)
        .filter(([_, result]) => !result.success)
        .map(([collection, _]) => collection);
      
      if (failedPermissions.length > 0) {
        diagnosis.recommendations.push(
          `Permission issues with: ${failedPermissions.join(', ')}`
        );
      } else {
        diagnosis.recommendations.push('Authentication flow appears healthy');
      }
    }
    
    console.log('🩺 DIAGNOSIS COMPLETE:', diagnosis);
    return diagnosis;
    
  } catch (error) {
    diagnosis.error = error.message;
    console.error('❌ Diagnosis failed:', error);
    return diagnosis;
  }
};

// Make utilities available globally for debugging
if (typeof window !== 'undefined') {
  window.debugAuthFlow = debugAuthFlow;
  window.testFirebasePermissions = testFirebasePermissions;
  window.checkUserDocument = checkUserDocument;
  window.autoFixPermissionIssues = autoFixPermissionIssues;
  window.diagnoseAuthenticationFlow = diagnoseAuthenticationFlow;
  
  console.log('🔍 Authentication debugging utilities loaded:');
  console.log('  window.debugAuthFlow() - Monitor auth state changes');
  console.log('  window.testFirebasePermissions() - Test collection access');
  console.log('  window.checkUserDocument() - Analyze user structure');
  console.log('  window.autoFixPermissionIssues() - Attempt automatic fixes');
  console.log('  window.diagnoseAuthenticationFlow() - Full diagnosis');
} 