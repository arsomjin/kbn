// Test utility for reapplication functionality
import { app } from '../firebase';

/**
 * Test the complete reapplication workflow
 */
export const testReapplicationWorkflow = async () => {
  console.log('🧪 Testing Re-application Workflow...');
  
  try {
    // 1. Create a test rejected user
    const testUserId = 'test-rejected-user-' + Date.now();
    const testUserData = {
      uid: testUserId,
      email: 'test.rejected@example.com',
      firstName: 'Test',
      lastName: 'Rejected',
      displayName: 'Test Rejected User',
      
      // Rejection data
      approvalStatus: 'rejected',
      rejectedAt: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
      rejectionReason: 'ข้อมูลไม่ครบถ้วน: แผนกไม่ถูกต้อง',
      rejectedBy: 'ผู้จัดการจังหวัด',
      rejectorName: 'Admin Test',
      
      isApproved: false,
      isActive: false,
      
      // User data
      userType: 'new',
      access: {
        authority: 'STAFF',
        departments: ['SALES'],
        geographic: {
          scope: 'BRANCH',
          homeProvince: 'nakhon-sawan',
          homeBranch: 'NSN001'
        },
        status: 'rejected',
        rejectionDetails: {
          reason: 'ข้อมูลไม่ครบถ้วน: แผนกไม่ถูกต้อง',
          rejectedBy: 'ผู้จัดการจังหวัด',
          canReapply: true,
          reapplyAfter: Date.now() - (12 * 60 * 60 * 1000) // 12 hours ago (eligible to reapply)
        }
      }
    };
    
    console.log('📝 Creating test rejected user:', testUserData);
    
    // Create user in Firestore
    await app.firestore()
      .collection('users')
      .doc(testUserId)
      .set(testUserData);
    
    console.log('✅ Test rejected user created successfully');
    
    // 2. Simulate reapplication
    const reapplicationData = {
      firstName: 'Test',
      lastName: 'Reapplied',
      email: 'test.rejected@example.com',
      phoneNumber: '0812345678',
      userType: 'new',
      department: 'ACCOUNTING', // Changed from SALES to ACCOUNTING
      province: 'nakhon-sawan',
      branch: 'NSN002', // Changed branch
      improvementNote: 'แก้ไขแผนกจาก "ฝ่ายขาย" เป็น "ฝ่ายบัญชี" ตามคำแนะนำ และเปลี่ยนสาขาเป็นสาขาที่ถูกต้องตามที่ปฏิบัติงานจริง'
    };
    
    console.log('🔄 Creating reapplication request:', reapplicationData);
    
    // Enhanced RBAC structure for reapplication
    const enhancedAccess = {
      authority: 'STAFF',
      departments: [reapplicationData.department],
      geographic: {
        scope: 'BRANCH',
        homeProvince: reapplicationData.province,
        homeBranch: reapplicationData.branch,
        allowedProvinces: [reapplicationData.province],
        allowedBranches: [reapplicationData.branch]
      },
      status: 'reapplied',
      reappliedAt: Date.now(),
      previousRejection: {
        reason: testUserData.rejectionReason,
        rejectedAt: testUserData.rejectedAt,
        improvements: reapplicationData.improvementNote
      }
    };
    
    // Updated user data for reapplication
    const userReapplicationUpdates = {
      firstName: reapplicationData.firstName,
      lastName: reapplicationData.lastName,
      displayName: `${reapplicationData.firstName} ${reapplicationData.lastName}`,
      phoneNumber: reapplicationData.phoneNumber,
      userType: reapplicationData.userType,
      
      // Enhanced RBAC structure
      access: enhancedAccess,
      
      // Legacy compatibility
      department: reapplicationData.department,
      homeProvince: reapplicationData.province,
      homeBranch: reapplicationData.branch,
      
      // Application status
      approvalStatus: 'pending',
      isPendingApproval: true,
      isApproved: false,
      isActive: false,
      
      // Reapplication metadata
      isReapplication: true,
      reappliedAt: Date.now(),
      previousRejectionData: {
        reason: testUserData.rejectionReason,
        rejectedAt: testUserData.rejectedAt,
        rejectedBy: testUserData.rejectedBy
      },
      improvementNote: reapplicationData.improvementNote,
      
      // Clear rejection flags
      rejectedAt: null,
      rejectionReason: null,
      rejectedBy: null,
      
      // Update timestamps
      updatedAt: Date.now(),
      lastModified: Date.now()
    };
    
    // Create approval request
    const approvalRequestData = {
      userId: testUserId,
      userData: userReapplicationUpdates,
      requestType: 'reapplication',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      
      // Geographic data for admin filtering
      targetProvince: reapplicationData.province,
      targetBranch: reapplicationData.branch,
      targetDepartment: reapplicationData.department,
      
      // Reapplication specific data
      previousRejection: {
        reason: testUserData.rejectionReason,
        rejectedAt: testUserData.rejectedAt,
        rejectedBy: testUserData.rejectedBy
      },
      improvementNote: reapplicationData.improvementNote,
      
      // Request metadata
      requestSource: 'test_utility',
      browserInfo: {
        userAgent: 'Test Utility',
        timestamp: Date.now()
      }
    };
    
    // Batch update: User document + Approval request
    const batch = app.firestore().batch();
    
    // Update user document
    const userRef = app.firestore().collection('users').doc(testUserId);
    batch.update(userRef, userReapplicationUpdates);
    
    // Create new approval request
    const approvalRef = app.firestore().collection('approvalRequests').doc();
    batch.set(approvalRef, approvalRequestData);
    
    // Execute batch
    await batch.commit();
    
    console.log('✅ Reapplication submitted successfully!');
    console.log('📊 Test Summary:');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Original Department: SALES → New Department: ${reapplicationData.department}`);
    console.log(`   Original Branch: NSN001 → New Branch: ${reapplicationData.branch}`);
    console.log(`   Status: rejected → pending`);
    console.log(`   Improvement Note: ${reapplicationData.improvementNote.substring(0, 100)}...`);
    
    return {
      success: true,
      testUserId,
      approvalRequestId: approvalRef.id,
      message: 'Reapplication workflow test completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Reapplication workflow test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Reapplication workflow test failed'
    };
  }
};

/**
 * Clean up test data
 */
export const cleanupReapplicationTest = async (testUserId, approvalRequestId) => {
  try {
    console.log('🧹 Cleaning up reapplication test data...');
    
    const batch = app.firestore().batch();
    
    if (testUserId) {
      const userRef = app.firestore().collection('users').doc(testUserId);
      batch.delete(userRef);
    }
    
    if (approvalRequestId) {
      const approvalRef = app.firestore().collection('approvalRequests').doc(approvalRequestId);
      batch.delete(approvalRef);
    }
    
    await batch.commit();
    console.log('✅ Test data cleaned up successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test reapplication eligibility check
 */
export const testReapplicationEligibility = (user) => {
  console.log('🔍 Testing reapplication eligibility for user:', user?.uid);
  
  if (!user) {
    return { eligible: false, reason: 'No user provided' };
  }
  
  // Check if user is rejected
  const isRejected = user.approvalStatus === 'rejected' && user.rejectedAt;
  
  if (!isRejected) {
    return { eligible: false, reason: 'User is not rejected' };
  }
  
  // Check reapply time limit (24 hours)
  const reapplyAfter = user.access?.rejectionDetails?.reapplyAfter || (user.rejectedAt + (24 * 60 * 60 * 1000));
  const canReapplyTime = Date.now() >= reapplyAfter;
  
  if (!canReapplyTime) {
    const waitTime = Math.ceil((reapplyAfter - Date.now()) / (60 * 60 * 1000));
    return { 
      eligible: false, 
      reason: `Must wait ${waitTime} more hours before reapplying` 
    };
  }
  
  // Check if reapplication is allowed
  const canReapply = user.access?.rejectionDetails?.canReapply !== false;
  
  if (!canReapply) {
    return { eligible: false, reason: 'Reapplication not allowed for this rejection' };
  }
  
  console.log('✅ User is eligible for reapplication');
  return { 
    eligible: true, 
    rejectionReason: user.rejectionReason,
    rejectedAt: user.rejectedAt,
    rejectedBy: user.rejectedBy || user.rejectorName
  };
};

// Export test utilities for development console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.testReapplication = testReapplicationWorkflow;
  window.cleanupReapplicationTest = cleanupReapplicationTest;
  window.testReapplicationEligibility = testReapplicationEligibility;
  
  console.log('🧪 Reapplication test utilities loaded:');
  console.log('  - window.testReapplication() - Test complete workflow');
  console.log('  - window.cleanupReapplicationTest(userId, requestId) - Clean up test data');
  console.log('  - window.testReapplicationEligibility(user) - Check eligibility');
} 