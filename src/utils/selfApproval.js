/**
 * Self-Approval Utilities for Development/Testing
 * Use these functions to approve your own account during development
 */

import { app } from '../firebase';
import { createUserAccess } from './orthogonal-rbac';

/**
 * Approve yourself (for development/testing only)
 * @param {string} userId - Your Firebase UID
 * @returns {Promise<boolean>} - Success status
 */
export const approveSelf = async (userId) => {
  try {
    console.log('🔓 Self-approving user:', userId);
    
    const timestamp = Date.now();
    
    // Get current user data to preserve existing info
    const userDoc = await app.firestore()
      .collection('users')
      .doc(userId)
      .get();
      
    if (!userDoc.exists) {
      console.error('❌ User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    
    // Get user data from Clean Slate structure (primary) or legacy fallback
    const userProvince = userData.access?.geographic?.homeProvince || 
                        userData.province || 
                        userData.auth?.province || 
                        'nakhon-ratchasima';
    const userBranch = userData.access?.geographic?.homeBranch || 
                      userData.branch || 
                      userData.auth?.branch || 
                      '0450';
    const userDepartment = userData.access?.departments?.[0] || 
                          userData.department || 
                          userData.auth?.department || 
                          'GENERAL';
    
    console.log('📋 Self-approval using user data:', {
      province: userProvince,
      branch: userBranch,
      department: userDepartment,
      hasCleanSlate: !!userData.access?.authority
    });
    
    // Create proper Clean Slate RBAC structure using unified helper
    const cleanSlateAccess = createUserAccess(
      'STAFF', // Authority level for self-approval
      'BRANCH', // Geographic scope
      [userDepartment.toUpperCase()], // Departments array
      {
        provinces: [userProvince],
        branches: [userBranch],
        homeBranch: userBranch
      }
    );
    
    // Create the Clean Slate user structure
    const updates = {
      // Core user data
      isActive: true,
      isApproved: true,
      approvalStatus: 'approved',
      
      // Clean Slate RBAC structure (ONLY structure)
      access: cleanSlateAccess,
      
      // Essential metadata
      updatedAt: Date.now(),
      approvedAt: timestamp,
      approvedBy: 'self-dev'
    };

    console.log('📝 Updating user with Clean Slate structure:', {
      userId,
      authority: cleanSlateAccess.authority,
      geographic: cleanSlateAccess.geographic.scope,
      departments: cleanSlateAccess.departments,
      permissions: Object.keys(cleanSlateAccess.permissions.departments).filter(
        dept => cleanSlateAccess.permissions.departments[dept].view
      )
    });

    // Update user document with Clean Slate structure
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
          approvalNotes: 'Self-approved for development/testing with Clean Slate RBAC'
        })
      );
      await Promise.all(promises);
      console.log('✅ Updated approval requests');
    }

    console.log('✅ Self-approval successful with Clean Slate structure!');
    console.log('🎯 Created access structure:', {
      authority: cleanSlateAccess.authority,
      geographic: cleanSlateAccess.geographic,
      departments: cleanSlateAccess.departments
    });
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
    const accessData = userData.access || {}; // Clean Slate RBAC structure

    return {
      exists: true,
      
      // Core status fields (Clean Slate structure)
      isApproved: userData.isApproved ?? false,
      isActive: userData.isActive ?? false,
      approvalStatus: userData.approvalStatus || 'pending',
      approvedBy: userData.approvedBy,
      approvedAt: userData.approvedAt,
      
      // User identification
      userType: userData.userType || 'new',
      employeeId: userData.employeeId,
      
      // Clean Slate RBAC information
      hasCleanSlateRBAC: !!accessData.authority,
      authority: accessData.authority,
      geographicScope: accessData.geographic?.scope,
      allowedProvinces: accessData.geographic?.allowedProvinces || [],
      allowedBranches: accessData.geographic?.allowedBranches || [],
      departments: accessData.departments || [],
      homeProvince: accessData.geographic?.homeProvince,
      homeBranch: accessData.geographic?.homeBranch,
      
      // Department permissions summary
      departmentPermissions: accessData.permissions?.departments || {},
      featurePermissions: accessData.permissions?.features || {},
      
      // Full access structure for debugging
      fullAccessStructure: accessData
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