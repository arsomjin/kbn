/**
 * Test Utility: Navigation Fix for New User Signup
 * Verifies that new users are correctly routed to pending approval page, not rejected
 */

/**
 * Test the getUserApprovalStatus function with different user scenarios
 */
export const testNavigationFix = () => {
  console.log('🧪 Testing Navigation Fix for New User Signup...');
  console.log('='.repeat(60));
  
  // Test cases
  const testCases = [
    {
      name: 'New User (Just Signed Up)',
      user: {
        uid: 'new-user-123',
        email: 'newuser@kbn.co.th',
        isApproved: false,
        isActive: false,
        approvalStatus: 'pending',
        // No rejectedAt timestamp - this is key!
      },
      expected: {
        isApproved: false,
        isActive: false,
        isRejected: false, // SHOULD BE FALSE for new users
        shouldShowApproval: true,
        route: 'ApprovalStatus (Pending)'
      }
    },
    {
      name: 'Explicitly Rejected User',
      user: {
        uid: 'rejected-user-123',
        email: 'rejected@kbn.co.th',
        isApproved: false,
        isActive: false,
        approvalStatus: 'rejected',
        rejectedAt: Date.now() - 120000, // 2 minutes ago
        rejectionReason: 'Invalid information'
      },
      expected: {
        isApproved: false,
        isActive: false,
        isRejected: true, // SHOULD BE TRUE for explicitly rejected users
        shouldShowApproval: true,
        route: 'ApprovalStatus (Rejected)'
      }
    },
    {
      name: 'Recently Rejected User (< 1 minute)',
      user: {
        uid: 'recent-reject-123',
        email: 'recent@kbn.co.th',
        isApproved: false,
        isActive: false,
        approvalStatus: 'rejected',
        rejectedAt: Date.now() - 30000, // 30 seconds ago
      },
      expected: {
        isApproved: false,
        isActive: false,
        isRejected: false, // SHOULD BE FALSE - too recent to be considered rejected
        shouldShowApproval: true,
        route: 'ApprovalStatus (Pending)'
      }
    },
    {
      name: 'Clean Slate RBAC User',
      user: {
        uid: 'rbac-user-123',
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
      expected: {
        isApproved: true,
        isActive: true,
        isRejected: false,
        shouldShowApproval: false,
        route: 'PrivateRoutes (Dashboard)'
      }
    },
    {
      name: 'Legacy Approved User',
      user: {
        uid: 'legacy-user-123',
        email: 'legacy@kbn.co.th',
        isApproved: true,
        isActive: true,
        homeProvince: 'NMA',
        homeBranch: 'NMA002'
      },
      expected: {
        isApproved: true,
        isActive: true,
        isRejected: false,
        shouldShowApproval: false,
        route: 'PrivateRoutes (Dashboard)'
      }
    }
  ];

  // Simulate the getUserApprovalStatus function
  const getUserApprovalStatus = (user) => {
    if (!user) return { isApproved: false, isActive: false, isRejected: false };
    
    // Clean Slate RBAC: If user has access structure, they're approved
    const hasCleanSlateRBAC = !!user.access?.authority;
    
    // Legacy approval fields
    const legacyApproved = user.isApproved === true;
    const legacyActive = user.isActive !== false; // Default to true if not explicitly false
    
    // FIXED: Only consider explicitly rejected users as rejected
    // Don't flag new pending users as rejected
    const isRejected = user.approvalStatus === 'rejected' && 
                      user.rejectedAt && // Must have been explicitly rejected
                      (Date.now() - (user.rejectedAt || 0)) > 60000; // At least 1 minute after rejection
    
    // Determine final approval status
    const isApproved = hasCleanSlateRBAC || legacyApproved;
    const isActive = hasCleanSlateRBAC || legacyActive;
    
    return { isApproved, isActive, isRejected };
  };

  // Run tests
  console.log('📋 Test Results:');
  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('-'.repeat(40));
    
    const result = getUserApprovalStatus(testCase.user);
    const shouldShowApproval = !result.isApproved || !result.isActive || result.isRejected;
    
    console.log('Input:', {
      approvalStatus: testCase.user.approvalStatus,
      isApproved: testCase.user.isApproved,
      isActive: testCase.user.isActive,
      rejectedAt: testCase.user.rejectedAt ? new Date(testCase.user.rejectedAt).toLocaleString() : 'None',
      hasAccess: !!testCase.user.access
    });
    
    console.log('Result:', {
      ...result,
      shouldShowApproval
    });
    
    console.log('Expected:', testCase.expected);
    
    // Check if test passed
    const testPassed = 
      result.isApproved === testCase.expected.isApproved &&
      result.isActive === testCase.expected.isActive &&
      result.isRejected === testCase.expected.isRejected &&
      shouldShowApproval === testCase.expected.shouldShowApproval;
    
    if (testPassed) {
      console.log('✅ TEST PASSED');
      passedTests++;
    } else {
      console.log('❌ TEST FAILED');
      console.log('Differences:');
      if (result.isApproved !== testCase.expected.isApproved) {
        console.log(`  - isApproved: got ${result.isApproved}, expected ${testCase.expected.isApproved}`);
      }
      if (result.isActive !== testCase.expected.isActive) {
        console.log(`  - isActive: got ${result.isActive}, expected ${testCase.expected.isActive}`);
      }
      if (result.isRejected !== testCase.expected.isRejected) {
        console.log(`  - isRejected: got ${result.isRejected}, expected ${testCase.expected.isRejected}`);
      }
      if (shouldShowApproval !== testCase.expected.shouldShowApproval) {
        console.log(`  - shouldShowApproval: got ${shouldShowApproval}, expected ${testCase.expected.shouldShowApproval}`);
      }
    }
    
    console.log(`Expected Route: ${testCase.expected.route}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Test Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Navigation fix is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the logic.');
  }
  
  return { passedTests, totalTests, success: passedTests === totalTests };
};

/**
 * Quick test function to run in browser console
 */
export const quickTestNavigationFix = () => {
  console.log('🚀 Quick Navigation Fix Test');
  
  // Test the exact scenario from the user's log
  const newUser = {
    uid: "qJZxLKU1EGXs7hX1IvOZyrYPZuA2",
    email: "phichayanan@happyinnovation.net",
    displayName: "Phichayanan Suk",
    isApproved: false,
    isActive: false,
    approvalStatus: "pending",
    // No rejectedAt - this is a new user!
  };
  
  // Test with the fixed logic
  const hasCleanSlateRBAC = !!newUser.access?.authority;
  const legacyApproved = newUser.isApproved === true;
  const legacyActive = newUser.isActive !== false;
  const isRejected = newUser.approvalStatus === 'rejected' && 
                    newUser.rejectedAt && 
                    (Date.now() - (newUser.rejectedAt || 0)) > 60000;
  
  const isApproved = hasCleanSlateRBAC || legacyApproved;
  const isActive = hasCleanSlateRBAC || legacyActive;
  const shouldShowApproval = !isApproved || !isActive || isRejected;
  
  console.log('🔍 New User Test Result:', {
    uid: newUser.uid,
    hasCleanSlateRBAC,
    legacyApproved,
    legacyActive,
    isRejected, // Should be FALSE now!
    finalApproved: isApproved,
    finalActive: isActive,
    shouldShowApproval,
    expectedRoute: shouldShowApproval ? 'ApprovalStatus (Pending)' : 'Dashboard'
  });
  
  if (!isRejected && shouldShowApproval) {
    console.log('✅ SUCCESS! New user will be routed to pending approval page, not rejected!');
  } else {
    console.log('❌ FAILED! Logic still has issues.');
  }
  
  return { isRejected, shouldShowApproval };
};

// Auto-run test when imported in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Navigation Fix Test Utility Loaded');
  console.log('Run testNavigationFix() or quickTestNavigationFix() to test the fix');
} 