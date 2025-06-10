/**
 * Self-Approval Utilities for Development/Testing
 * Use these functions to approve your own account during development
 */

import { app } from '../firebase';

/**
 * Approve yourself (for development/testing only)
 * @param {string} userId - Your Firebase UID
 * @returns {Promise<boolean>} - Success status
 */
export const approveSelf = async (userId) => {
  try {
    console.log('🔓 Self-approving user:', userId);
    
    const timestamp = Date.now();
    const updates = {
      'auth.isActive': true,
      'auth.isApproved': true,
      'auth.approvalStatus': 'approved',
      'auth.approvedBy': 'self-dev',
      'auth.approvedAt': timestamp,
      'status.isActive': true,
      'status.isApproved': true,
      'status.approvalStatus': 'approved',
      'status.lastStatusUpdate': timestamp
    };

    // Update user document
    await app.firestore()
      .collection('users')
      .doc(userId)
      .update(updates);

    // Update approval request if exists
    const approvalRequests = await app.firestore()
      .collection('approvalRequests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get();

    if (!approvalRequests.empty) {
      const promises = approvalRequests.docs.map(doc => 
        doc.ref.update({
          status: 'approved',
          approvedBy: 'self-dev',
          approvedAt: timestamp,
          approvalNotes: 'Self-approved for development/testing'
        })
      );
      await Promise.all(promises);
    }

    console.log('✅ Self-approval successful!');
    return true;
  } catch (error) {
    console.error('❌ Self-approval failed:', error);
    return false;
  }
};

/**
 * Get current user ID from authentication
 * @returns {string|null} Current user UID
 */
export const getCurrentUserId = () => {
  const user = app.auth().currentUser;
  return user ? user.uid : null;
};

/**
 * Check current user approval status
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} User status
 */
export const checkUserStatus = async (userId) => {
  try {
    const userDoc = await app.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return { exists: false };
    }

    const userData = userDoc.data();
    const authStatus = userData.auth || {};
    const statusData = userData.status || {};

    return {
      exists: true,
      isApproved: authStatus.isApproved ?? statusData.isApproved ?? false,
      isActive: authStatus.isActive ?? statusData.isActive ?? false,
      approvalStatus: authStatus.approvalStatus || statusData.approvalStatus || 'pending',
      approvedBy: authStatus.approvedBy || statusData.approvedBy,
      approvedAt: authStatus.approvedAt || statusData.approvedAt,
      userType: authStatus.userType || 'new',
      employeeId: authStatus.employeeId,
      department: authStatus.department,
      homeProvince: authStatus.homeProvince,
      homeBranch: authStatus.homeBranch
    };
  } catch (error) {
    console.error('Error checking user status:', error);
    return { error: error.message };
  }
};

/**
 * Approve yourself with guided steps
 */
export const guidedSelfApproval = async () => {
  console.log('🔍 Starting guided self-approval process...');
  
  // Step 1: Get current user
  const userId = getCurrentUserId();
  if (!userId) {
    console.error('❌ No user is currently signed in');
    return false;
  }

  console.log('👤 Current user ID:', userId);

  // Step 2: Check current status
  const status = await checkUserStatus(userId);
  console.log('📊 Current status:', status);

  if (!status.exists) {
    console.error('❌ User document does not exist');
    return false;
  }

  if (status.isApproved && status.isActive) {
    console.log('✅ User is already approved and active!');
    return true;
  }

  // Step 3: Perform approval
  console.log('🔄 Approving user...');
  const success = await approveSelf(userId);

  if (success) {
    console.log('🎉 Self-approval completed! Please refresh the page.');
    return true;
  } else {
    console.error('❌ Self-approval failed');
    return false;
  }
};

/**
 * Quick approval function for console use
 */
window.approveMySelf = guidedSelfApproval;
window.checkMyStatus = async () => {
  const userId = getCurrentUserId();
  if (userId) {
    const status = await checkUserStatus(userId);
    console.log('📊 Your current status:', status);
    return status;
  } else {
    console.log('❌ No user signed in');
    return null;
  }
};

// Only log in development
const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
if (isDev) {
  console.log('🔧 Self-approval utilities loaded! Use:');
  console.log('  - approveMySelf() to approve yourself');
  console.log('  - checkMyStatus() to check your current status');
} 