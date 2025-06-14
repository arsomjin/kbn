/**
 * Test Utility: Approval Status & Dashboard Routing Fixes
 * Tests both Issue 1 (Rejected User UI) and Issue 2 (Approved User 404)
 */

// Test utility to simulate different user states and verify routing behavior
export const testApprovalFixes = () => {
  console.log('🧪 Testing Approval Status & Dashboard Routing Fixes...');
  
  // Test cases for different user states
  const testCases = [
    {
      name: 'Approved Clean Slate RBAC User',
      user: {
        uid: 'test-user-1',
        email: 'staff@kbn.co.th',
        access: {
          authority: 'STAFF',
          departments: ['sales'],
          geographic: {
            homeProvince: 'NMA',
            homeBranch: 'NMA002'
          }
        }
      },
      expectedRoute: 'PrivateRoutes (Dashboard)',
      expectedApprovalStatus: false
    },
    {
      name: 'Approved Legacy User',
      user: {
        uid: 'test-user-2',
        email: 'manager@kbn.co.th',
        isApproved: true,
        isActive: true,
        homeProvince: 'NMA',
        homeBranch: 'NMA002'
      },
      expectedRoute: 'PrivateRoutes (Dashboard)',
      expectedApprovalStatus: false
    },
    {
      name: 'Pending Approval User',
      user: {
        uid: 'test-user-3',
        email: 'newuser@kbn.co.th',
        isApproved: false,
        isActive: true,
        isPendingApproval: true
      },
      expectedRoute: 'ApprovalStatus (Pending)',
      expectedApprovalStatus: true
    },
    {
      name: 'Rejected User',
      user: {
        uid: 'test-user-4',
        email: 'rejected@kbn.co.th',
        isApproved: false,
        isActive: false,
        approvalStatus: 'rejected',
        rejectionReason: 'ข้อมูลไม่ถูกต้อง',
        rejectedBy: 'admin@kbn.co.th',
        rejectedAt: Date.now()
      },
      expectedRoute: 'ApprovalStatus (Rejected UI)',
      expectedApprovalStatus: true
    },
    {
      name: 'Explicit Rejection Status',
      user: {
        uid: 'test-user-5',
        email: 'explicitreject@kbn.co.th',
        approvalStatus: 'rejected',
        rejectionReason: 'ไม่ผ่านการตรวจสอบ'
      },
      expectedRoute: 'ApprovalStatus (Rejected UI)',
      expectedApprovalStatus: true
    }
  ];

  // Import the functions we need to test
  const { getUserApprovalStatus } = require('../navigation/index');
  
  console.log('📋 Test Results:');
  console.log('='.repeat(80));
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      // Test the navigation logic
      const { isApproved, isActive, isRejected } = getUserApprovalStatus(testCase.user);
      const shouldShowApprovalStatus = !isApproved || !isActive || isRejected;
      
      console.log('User Data:', JSON.stringify(testCase.user, null, 2));
      console.log('Test Results:', {
        isApproved,
        isActive,
        isRejected,
        shouldShowApprovalStatus,
        expectedApprovalStatus: testCase.expectedApprovalStatus
      });
      
      // Verify the results
      const testPassed = shouldShowApprovalStatus === testCase.expectedApprovalStatus;
      
      if (testPassed) {
        console.log('✅ TEST PASSED');
      } else {
        console.log('❌ TEST FAILED');
        console.log(`Expected: ${testCase.expectedApprovalStatus}, Got: ${shouldShowApprovalStatus}`);
      }
      
      console.log(`Expected Route: ${testCase.expectedRoute}`);
      
    } catch (error) {
      console.log('❌ TEST ERROR:', error.message);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 Manual Testing Instructions:');
  console.log('1. Test Rejected User UI: Reject a user in UserApproval and check UI');
  console.log('2. Test Approved User Dashboard: Approve a user and verify dashboard access');
  console.log('3. Check console logs for detailed routing decisions');
  console.log('4. Verify no 404 errors for approved users');
  console.log('5. Confirm rejected users see proper rejection message');
};

// Function to test ApprovalStatus component rejection UI
export const testRejectedUserUI = (user) => {
  console.log('🎨 Testing Rejected User UI Component...');
  
  const rejectedUser = {
    ...user,
    approvalStatus: 'rejected',
    isApproved: false,
    isActive: false,
    rejectionReason: 'ข้อมูลไม่ครบถ้วน',
    rejectedBy: 'ผู้จัดการสาขา',
    rejectedAt: Date.now()
  };
  
  console.log('Rejected User Data:', rejectedUser);
  console.log('✅ UI should show:');
  console.log('- Red warning icon');
  console.log('- "คำขอถูกปฏิเสธ" message');
  console.log('- Rejection reason and details');
  console.log('- Contact information');
  console.log('- Retry and Logout buttons');
  
  return rejectedUser;
};

// Function to test approved user dashboard routing
export const testApprovedUserRouting = (user) => {
  console.log('🗺️ Testing Approved User Dashboard Routing...');
  
  const approvedUser = {
    ...user,
    access: {
      authority: 'STAFF',
      departments: ['sales'],
      geographic: {
        homeProvince: 'NMA',
        homeBranch: 'NMA002'
      }
    }
  };
  
  console.log('Approved User Data:', approvedUser);
  console.log('✅ Expected behavior:');
  console.log('- User should be routed to PrivateRoutes');
  console.log('- Should see role-based dashboard');
  console.log('- No 404 errors');
  console.log('- Navigation menu should be visible');
  
  return approvedUser;
};

// Quick test function for development
export const quickTestApprovalFixes = () => {
  console.log('⚡ Quick Test: Approval Status & Dashboard Routing');
  
  // Test the core logic functions
  if (typeof window !== 'undefined') {
    // In browser environment
    console.log('🌐 Browser Environment - Check network tab for routing');
    console.log('1. Navigate to /overview - should work for approved users');
    console.log('2. Check console for "Navigation - User Approval Check" logs');
  } else {
    // In Node environment
    console.log('🔧 Node Environment - Running logic tests');
    testApprovalFixes();
  }
};

// Export for global access
if (typeof window !== 'undefined') {
  window.testApprovalFixes = testApprovalFixes;
  window.testRejectedUserUI = testRejectedUserUI;
  window.testApprovedUserRouting = testApprovedUserRouting;
  window.quickTestApprovalFixes = quickTestApprovalFixes;
  
  console.log('🧪 Approval Testing Utilities Available:');
  console.log('- window.testApprovalFixes()');
  console.log('- window.testRejectedUserUI(user)');
  console.log('- window.testApprovedUserRouting(user)');
  console.log('- window.quickTestApprovalFixes()');
}

export default {
  testApprovalFixes,
  testRejectedUserUI,
  testApprovedUserRouting,
  quickTestApprovalFixes
}; 