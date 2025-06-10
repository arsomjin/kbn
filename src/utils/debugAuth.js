/**
 * Authentication Debugging Utilities
 * Help debug registration and approval issues
 */

import { app } from '../firebase';

/**
 * Get detailed user information from database
 */
export const getDetailedUserStatus = async (userId = null) => {
  try {
    const currentUser = userId || app.auth().currentUser?.uid;
    if (!currentUser) {
      console.log('❌ No user signed in');
      return null;
    }

    console.log('🔍 Checking detailed status for user:', currentUser);

    // Get user document
    const userDoc = await app.firestore()
      .collection('users')
      .doc(currentUser)
      .get();

    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return null;
    }

    const userData = userDoc.data();
    console.log('📊 Complete user data:', userData);

    // Check auth and status fields
    const authData = userData.auth || {};
    const statusData = userData.status || {};

    console.log('🔐 Auth data:', authData);
    console.log('📈 Status data:', statusData);

    // Check approval requests
    const approvalRequests = await app.firestore()
      .collection('approvalRequests')
      .where('userId', '==', currentUser)
      .get();

    console.log('📋 Approval requests found:', approvalRequests.size);
    approvalRequests.forEach(doc => {
      console.log('  📄 Request:', doc.id, doc.data());
    });

    return {
      userId: currentUser,
      userData,
      authData,
      statusData,
      approvalRequests: approvalRequests.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };

  } catch (error) {
    console.error('❌ Error getting detailed status:', error);
    return { error: error.message };
  }
};

/**
 * Check if employeeCode exists in database
 */
export const checkEmployeeExists = async (employeeCode) => {
  try {
    console.log('🔍 Checking if employee exists:', employeeCode);

    const employeeDoc = await app.firestore()
      .collection('data')
      .doc('company')
      .collection('employees')
      .doc(employeeCode)
      .get();

    if (employeeDoc.exists) {
      const employee = employeeDoc.data();
      console.log('✅ Employee found:', employee);
      return { exists: true, employee };
    } else {
      console.log('❌ Employee not found with code:', employeeCode);
      
      // Try searching by name or other fields
      const employeesQuery = await app.firestore()
        .collection('data')
        .doc('company')
        .collection('employees')
        .get();

      console.log('📊 Total employees in database:', employeesQuery.size);
      
      // Show first few employees as examples
      const sampleEmployees = employeesQuery.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📝 Sample employees (first 5):', sampleEmployees);
      
      return { exists: false, sampleEmployees };
    }

  } catch (error) {
    console.error('❌ Error checking employee:', error);
    return { error: error.message };
  }
};

/**
 * Force refresh authentication state
 */
export const forceAuthRefresh = async () => {
  try {
    console.log('🔄 Force refreshing authentication state...');
    
    const user = app.auth().currentUser;
    if (!user) {
      console.log('❌ No user signed in');
      return false;
    }

    // Force token refresh
    await user.getIdToken(true);
    console.log('✅ Token refreshed');
    
    // Trigger auth state change
    window.dispatchEvent(new CustomEvent('authRefresh', {
      detail: { userId: user.uid }
    }));
    
    // Reload page after short delay
    setTimeout(() => {
      console.log('🔄 Reloading page...');
      window.location.reload();
    }, 2000);
    
    return true;

  } catch (error) {
    console.error('❌ Error refreshing auth:', error);
    return false;
  }
};

/**
 * Comprehensive debug function
 */
export const debugAuthIssue = async () => {
  console.log('🔧 === COMPREHENSIVE AUTH DEBUG ===');
  
  // Step 1: Check current user
  const user = app.auth().currentUser;
  if (!user) {
    console.log('❌ No user currently signed in');
    return;
  }
  
  console.log('👤 Current Firebase user:', user.uid, user.email);
  
  // Step 2: Get detailed status
  const status = await getDetailedUserStatus(user.uid);
  if (status?.error) {
    console.error('❌ Failed to get user status');
    return;
  }
  
  // Step 3: Check employee data if employeeId exists
  const employeeId = status?.authData?.employeeId || status?.userData?.employeeId;
  if (employeeId) {
    console.log('🏢 Checking employee data for ID:', employeeId);
    await checkEmployeeExists(employeeId);
  } else {
    console.log('⚠️ No employeeId found in user data');
  }
  
  // Step 4: Check approval status logic
  const isApproved = status?.authData?.isApproved ?? status?.statusData?.isApproved ?? false;
  const isActive = status?.authData?.isActive ?? status?.statusData?.isActive ?? false;
  const approvalStatus = status?.authData?.approvalStatus || status?.statusData?.approvalStatus || 'pending';
  
  console.log('📊 Final approval check:');
  console.log('  isApproved:', isApproved);
  console.log('  isActive:', isActive);
  console.log('  approvalStatus:', approvalStatus);
  console.log('  Should be approved:', isApproved && isActive && approvalStatus === 'approved');
  
  // Step 5: Suggest fixes
  if (!isApproved || !isActive || approvalStatus !== 'approved') {
    console.log('💡 SUGGESTED FIXES:');
    console.log('  1. Run: fixMyApproval() - to force approval');
    console.log('  2. Check if you used correct employeeCode during registration');
    console.log('  3. Try signing out and back in');
  }
};

/**
 * Force fix approval status
 */
export const fixMyApproval = async () => {
  const user = app.auth().currentUser;
  if (!user) {
    console.log('❌ No user signed in');
    return false;
  }
  
  console.log('🔧 Force fixing approval status...');
  
  try {
    const timestamp = Date.now();
    const updates = {
      'auth.isActive': true,
      'auth.isApproved': true,
      'auth.approvalStatus': 'approved',
      'auth.approvedBy': 'debug-fix',
      'auth.approvedAt': timestamp,
      'status.isActive': true,
      'status.isApproved': true,
      'status.approvalStatus': 'approved',
      'status.lastStatusUpdate': timestamp,
      
      // Also update top-level fields
      'isActive': true,
      'isApproved': true,
      'approvalStatus': 'approved'
    };

    await app.firestore()
      .collection('users')
      .doc(user.uid)
      .update(updates);

    console.log('✅ Approval status fixed!');
    
    // Force auth refresh
    await forceAuthRefresh();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix approval:', error);
    return false;
  }
};

/**
 * Update isDev flag for current user
 */
export const updateIsDevFlag = async (isDevValue = true) => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }

    console.log(`🔧 Setting isDev to ${isDevValue} for user:`, currentUser.uid);

    // Update user document with isDev flag at root level
    await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update({
        isDev: isDevValue,
        'auth.isDev': isDevValue, // Also update in auth nested object for compatibility
        updatedAt: new Date().toISOString()
      });

    console.log('✅ isDev flag updated successfully');
    console.log('🔄 Please log out and log back in to see changes');
    
    return { 
      success: true, 
      message: `isDev set to ${isDevValue}. Please log out and log back in to see changes.` 
    };

  } catch (error) {
    console.error('❌ Error updating isDev flag:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check current isDev flag in Firestore vs Redux
 */
export const checkIsDevSync = async () => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.log('❌ No user signed in');
      return null;
    }

    // Get fresh data from Firestore
    const userDoc = await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();

    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return null;
    }

    const userData = userDoc.data();
    const firestoreIsDev = userData.isDev || userData.auth?.isDev || false;
    
    console.log('🔍 isDev Flag Comparison:');
    console.log('  Firestore (root):', userData.isDev);
    console.log('  Firestore (auth):', userData.auth?.isDev);
    console.log('  Effective value:', firestoreIsDev);
    
    return {
      firestoreRoot: userData.isDev,
      firestoreAuth: userData.auth?.isDev,
      effective: firestoreIsDev,
      userData
    };

  } catch (error) {
    console.error('❌ Error checking isDev sync:', error);
    return { error: error.message };
  }
};

/**
 * Force refresh user data from Firestore (no logout required)
 */
export const forceUserRefresh = async () => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }

    console.log('🔄 Force refreshing user data...');

    // Get latest user data from Firestore
    const userDoc = await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();

    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return { success: false, error: 'User document does not exist' };
    }

    const userData = userDoc.data();
    
    // Create the same user object that hooks would create
    let mUser = { ...userData.auth, ...userData };
    delete mUser.auth;
    
    // Ensure isDev is preserved
    if (userData.isDev !== undefined) {
      mUser.isDev = userData.isDev;
    } else if (userData.auth?.isDev !== undefined) {
      mUser.isDev = userData.auth.isDev;
    }

    console.log('✅ User data refreshed:', {
      uid: mUser.uid,
      email: mUser.email,
      isDev: mUser.isDev
    });

    // Trigger a custom event to notify components to refresh
    window.dispatchEvent(new CustomEvent('userDataRefreshed', {
      detail: { userData: mUser }
    }));

    // Also dispatch to Redux manually
    const { store } = await import('../App');
    store.dispatch({
      type: 'LOGIN_SUCCESS',
      user: mUser
    });

    return { 
      success: true, 
      userData: mUser,
      message: 'User data refreshed successfully!' 
    };

  } catch (error) {
    console.error('❌ Error refreshing user data:', error);
    return { success: false, error: error.message };
  }
};

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  window.getDetailedUserStatus = getDetailedUserStatus;
  window.forceAuthRefresh = forceAuthRefresh;
  window.updateIsDevFlag = updateIsDevFlag;
  window.checkIsDevSync = checkIsDevSync;
  window.forceUserRefresh = forceUserRefresh;

  console.log('🔧 Auth debugging utilities loaded!');
  console.log('Available commands:');
  console.log('  - getDetailedUserStatus() - get detailed user info');
  console.log('  - debugAuthIssue() - comprehensive auth debugging');
  console.log('  - fixMyApproval() - fix approval issues');  
  console.log('  - checkEmployeeExists("EMPLOYEE_CODE") - check if employee exists');
  console.log('  - forceAuthRefresh() - refresh auth state');
  console.log('  - updateIsDevFlag(true/false) - update isDev flag');
  console.log('  - checkIsDevSync() - check isDev flag sync');
  console.log('  - forceUserRefresh() - refresh user data without logout');
} 