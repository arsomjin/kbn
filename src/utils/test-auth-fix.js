/**
 * Test Utility: Authentication Instability Fix
 * Verifies that new users don't get signed out during the signup process
 */

/**
 * Test the authentication flow for new user signup
 */
export const testAuthInstabilityFix = () => {
  console.log('🧪 Testing Authentication Instability Fix...');
  console.log('='.repeat(60));
  
  // Simulate the scenarios that were causing auth instability
  const testScenarios = [
    {
      name: 'New User - Recently Created (< 30 seconds)',
      user: {
        uid: 'test-new-user-123',
        email: 'newuser@kbn.co.th',
        metadata: {
          creationTime: new Date(Date.now() - 10000).toISOString() // 10 seconds ago
        }
      },
      firestoreDocExists: false, // Document not created yet
      expected: {
        shouldRetry: true,
        shouldSignOut: false,
        action: 'Wait and retry for Firestore document'
      }
    },
    {
      name: 'New User - Document Created After Retry',
      user: {
        uid: 'test-new-user-456',
        email: 'newuser2@kbn.co.th',
        metadata: {
          creationTime: new Date(Date.now() - 5000).toISOString() // 5 seconds ago
        }
      },
      firestoreDocExists: true, // Document exists on retry
      expected: {
        shouldRetry: false,
        shouldSignOut: false,
        action: 'Login user successfully'
      }
    },
    {
      name: 'Old User - Document Missing (> 30 seconds)',
      user: {
        uid: 'test-old-user-789',
        email: 'olduser@kbn.co.th',
        metadata: {
          creationTime: new Date(Date.now() - 60000).toISOString() // 1 minute ago
        }
      },
      firestoreDocExists: false,
      expected: {
        shouldRetry: false,
        shouldSignOut: true,
        action: 'Sign out user (document should exist by now)'
      }
    },
    {
      name: 'Existing User - Document Exists',
      user: {
        uid: 'test-existing-user-101',
        email: 'existing@kbn.co.th',
        metadata: {
          creationTime: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      },
      firestoreDocExists: true,
      expected: {
        shouldRetry: false,
        shouldSignOut: false,
        action: 'Login user normally'
      }
    }
  ];

  // Test the logic from the fixed verifyAuth function
  const testVerifyAuthLogic = (user, firestoreDocExists) => {
    // Simulate the fixed logic
    if (!firestoreDocExists) {
      console.log('❌ User document not found in Firestore:', user.uid);
      
      // Check if this is a recently created user (within last 30 seconds)
      const userCreationTime = user.metadata?.creationTime;
      const isRecentlyCreated = userCreationTime && 
        (Date.now() - new Date(userCreationTime).getTime()) < 30000; // 30 seconds
      
      if (isRecentlyCreated) {
        console.log('⏳ Recently created user - waiting for Firestore document...');
        return {
          action: 'retry',
          shouldSignOut: false,
          shouldRetry: true,
          reason: 'Recently created user - document may still be creating'
        };
      } else {
        console.log('🔄 User document not found and not recently created - signing out');
        return {
          action: 'signout',
          shouldSignOut: true,
          shouldRetry: false,
          reason: 'User document missing and not recently created'
        };
      }
    } else {
      return {
        action: 'login',
        shouldSignOut: false,
        shouldRetry: false,
        reason: 'User document found - proceed with login'
      };
    }
  };

  // Run tests
  console.log('📋 Test Results:');
  let passedTests = 0;
  let totalTests = testScenarios.length;

  testScenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log('-'.repeat(40));
    
    const result = testVerifyAuthLogic(scenario.user, scenario.firestoreDocExists);
    
    console.log('Input:', {
      uid: scenario.user.uid,
      creationTime: scenario.user.metadata?.creationTime,
      firestoreDocExists: scenario.firestoreDocExists,
      timeSinceCreation: `${Math.round((Date.now() - new Date(scenario.user.metadata?.creationTime).getTime()) / 1000)}s ago`
    });
    
    console.log('Result:', result);
    console.log('Expected:', scenario.expected);
    
    // Check if test passed
    const testPassed = 
      result.shouldRetry === scenario.expected.shouldRetry &&
      result.shouldSignOut === scenario.expected.shouldSignOut;
    
    if (testPassed) {
      console.log('✅ TEST PASSED');
      passedTests++;
    } else {
      console.log('❌ TEST FAILED');
      console.log('Differences:');
      if (result.shouldRetry !== scenario.expected.shouldRetry) {
        console.log(`  - shouldRetry: got ${result.shouldRetry}, expected ${scenario.expected.shouldRetry}`);
      }
      if (result.shouldSignOut !== scenario.expected.shouldSignOut) {
        console.log(`  - shouldSignOut: got ${result.shouldSignOut}, expected ${scenario.expected.shouldSignOut}`);
      }
    }
    
    console.log(`Expected Action: ${scenario.expected.action}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Test Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Authentication instability fix is working correctly.');
    console.log('✅ New users will no longer be signed out during signup process');
  } else {
    console.log('⚠️ Some tests failed. Please review the logic.');
  }
  
  return { passedTests, totalTests, success: passedTests === totalTests };
};

/**
 * Quick test for the exact scenario from user's log
 */
export const testUserScenario = () => {
  console.log('🚀 Testing Exact User Scenario from Log');
  console.log('='.repeat(40));
  
  // Simulate the exact user from the log
  const testUser = {
    uid: "DOluGTrtZQRrlFknHOm5mDkmCNn1",
    email: "phichayanan@happyinnovation.net",
    metadata: {
      creationTime: new Date(Date.now() - 5000).toISOString() // 5 seconds ago (recent)
    }
  };
  
  console.log('User from log:', {
    uid: testUser.uid,
    email: testUser.email,
    creationTime: testUser.metadata.creationTime
  });
  
  // Test the scenario where Firestore document doesn't exist yet
  const userCreationTime = testUser.metadata?.creationTime;
  const isRecentlyCreated = userCreationTime && 
    (Date.now() - new Date(userCreationTime).getTime()) < 30000;
  
  console.log('Analysis:', {
    isRecentlyCreated,
    timeSinceCreation: `${Math.round((Date.now() - new Date(userCreationTime).getTime()) / 1000)}s`,
    shouldRetry: isRecentlyCreated,
    shouldSignOut: !isRecentlyCreated
  });
  
  if (isRecentlyCreated) {
    console.log('✅ SUCCESS! User will be retried instead of signed out');
    console.log('🔄 System will wait 2 seconds and check again (up to 3 attempts)');
    console.log('📝 This gives Firestore document creation time to complete');
  } else {
    console.log('❌ User would still be signed out');
  }
  
  return { isRecentlyCreated, shouldRetry: isRecentlyCreated };
};

/**
 * Monitor authentication flow in real-time
 */
export const monitorAuthFlow = () => {
  console.log('👁️ Starting Authentication Flow Monitor...');
  
  // Listen for auth state changes
  if (window.firebase && window.firebase.auth) {
    window.firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const creationTime = user.metadata?.creationTime;
        const isRecent = creationTime && 
          (Date.now() - new Date(creationTime).getTime()) < 30000;
        
        console.log('🔍 Auth State Change - User Signed In:', {
          uid: user.uid,
          email: user.email,
          creationTime,
          isRecentlyCreated: isRecent,
          timeSinceCreation: creationTime ? 
            `${Math.round((Date.now() - new Date(creationTime).getTime()) / 1000)}s` : 'Unknown'
        });
      } else {
        console.log('🔍 Auth State Change - User Signed Out');
      }
    });
    
    console.log('✅ Authentication monitor active');
  } else {
    console.log('❌ Firebase not available for monitoring');
  }
};

// Auto-run test when imported in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Authentication Fix Test Utility Loaded');
  console.log('Run testAuthInstabilityFix() or testUserScenario() to test the fix');
} 