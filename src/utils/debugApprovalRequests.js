/**
 * Debug Utility for Approval Requests
 * Use this to check if approval requests are being created properly
 */

import { app } from '../firebase';

/**
 * Check all approval requests in the database
 */
export const debugApprovalRequests = async () => {
  try {
    console.log('🔍 Debugging approval requests...');
    
    // Get all approval requests
    const snapshot = await app.firestore()
      .collection('approvalRequests')
      .orderBy('createdAt', 'desc')
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No approval requests found in database');
      return [];
    }
    
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt),
    }));
    
    console.log(`✅ Found ${requests.length} approval requests:`);
    console.table(requests.map(r => ({
      id: r.id,
      userId: r.userId,
      status: r.status,
      requestType: r.requestType,
      targetProvince: r.targetProvince,
      targetBranch: r.targetBranch,
      createdAt: r.createdAt.toLocaleString(),
      userData: r.userData ? `${r.userData.firstName} ${r.userData.lastName}` : 'N/A'
    })));
    
    return requests;
  } catch (error) {
    console.error('❌ Error debugging approval requests:', error);
    return [];
  }
};

/**
 * Check approval requests for specific user
 */
export const debugUserApprovalRequests = async (userId) => {
  try {
    console.log('🔍 Debugging approval requests for user:', userId);
    
    const snapshot = await app.firestore()
      .collection('approvalRequests')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No approval requests found for user:', userId);
      return [];
    }
    
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt),
    }));
    
    console.log(`✅ Found ${requests.length} approval requests for user ${userId}:`);
    console.table(requests);
    
    return requests;
  } catch (error) {
    console.error('❌ Error debugging user approval requests:', error);
    return [];
  }
};

/**
 * Check current user's approval status and requests
 */
export const debugCurrentUserApproval = async () => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.log('❌ No user currently signed in');
      return null;
    }
    
    console.log('🔍 Debugging current user approval status:', currentUser.uid);
    
    // Get user document
    const userDoc = await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();
    
    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return null;
    }
    
    const userData = userDoc.data();
    
    // Get approval requests
    const approvalRequests = await debugUserApprovalRequests(currentUser.uid);
    
    const debugInfo = {
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        isApproved: userData.isApproved,
        isActive: userData.isActive,
        approvalStatus: userData.approvalStatus,
        isPendingApproval: userData.isPendingApproval,
        hasCleanSlateRBAC: !!userData.access?.authority,
        userType: userData.userType
      },
      approvalRequests: approvalRequests.length,
      latestRequest: approvalRequests[0] || null
    };
    
    console.log('📊 Current user approval debug info:');
    console.table(debugInfo.user);
    
    if (debugInfo.latestRequest) {
      console.log('📄 Latest approval request:');
      console.table(debugInfo.latestRequest);
    }
    
    return debugInfo;
  } catch (error) {
    console.error('❌ Error debugging current user approval:', error);
    return null;
  }
};

/**
 * Test approval request creation (for debugging)
 */
export const testCreateApprovalRequest = async (testUserData) => {
  try {
    console.log('🧪 Testing approval request creation...');
    
    const testRequest = {
      userId: 'test-user-id',
      requestType: 'new_employee_registration',
      userData: testUserData || {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        displayName: 'Test User'
      },
      status: 'pending',
      priority: 'normal',
      department: 'GENERAL',
      approvalLevel: 'province_manager',
      targetProvince: 'นครสวรรค์',
      targetBranch: 'NSN001',
      createdAt: new Date().toISOString(),
      registrationSource: 'web-debug'
    };
    
    const docRef = await app.firestore()
      .collection('approvalRequests')
      .add(testRequest);
    
    console.log('✅ Test approval request created with ID:', docRef.id);
    
    // Clean up test data
    await docRef.delete();
    console.log('🧹 Test approval request cleaned up');
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error testing approval request creation:', error);
    return null;
  }
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.debugApproval = {
    debugApprovalRequests,
    debugUserApprovalRequests, 
    debugCurrentUserApproval,
    testCreateApprovalRequest
  };
  
  console.log('🔧 Debug utilities available:');
  console.log('- window.debugApproval.debugApprovalRequests()');
  console.log('- window.debugApproval.debugCurrentUserApproval()');
  console.log('- window.debugApproval.testCreateApprovalRequest()');
} 