/**
 * Test utility to verify notification page access for different user types
 * This helps validate that the RBAC fix works correctly
 */

// Test the updated customCheck logic from notifications page
const testNotificationAccess = (userRBAC) => {
  // This is the NEW fixed logic from notifications page
  const hasCleanSlateRBAC = !!userRBAC?.access?.authority;
  const hasLegacyRBAC = !!(userRBAC?.isActive || userRBAC?.isDev);
  const hasValidAuthority = !!(
    userRBAC?.authority || userRBAC?.access?.authority
  );

  const result =
    userRBAC && (hasCleanSlateRBAC || hasLegacyRBAC || hasValidAuthority);

  console.log('🔍 Notification Access Test:', {
    userRBAC,
    hasCleanSlateRBAC,
    hasLegacyRBAC,
    hasValidAuthority,
    authority: userRBAC?.authority || userRBAC?.access?.authority,
    accessGranted: result,
  });

  return result;
};

// Test cases for different user types
const testCases = {
  // Clean Slate Staff User (the main issue)
  staffUser: {
    uid: 'staff123',
    email: 'staff@test.com',
    displayName: 'Staff User',
    access: {
      authority: 'STAFF',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['nakhon-sawan'],
        allowedBranches: ['NSN001'],
        homeProvince: 'nakhon-sawan',
        homeBranch: 'NSN001',
      },
      departments: ['SALES'],
      permissions: {
        departments: {
          sales: { view: true, edit: true, approve: false },
        },
      },
    },
    isActive: true,
  },

  // Clean Slate Manager User
  managerUser: {
    uid: 'manager123',
    email: 'manager@test.com',
    displayName: 'Manager User',
    access: {
      authority: 'MANAGER',
      geographic: {
        scope: 'PROVINCE',
        allowedProvinces: ['nakhon-sawan'],
        allowedBranches: ['NSN001', 'NSN002'],
        homeProvince: 'nakhon-sawan',
        homeBranch: 'NSN001',
      },
      departments: ['SALES', 'SERVICE'],
      permissions: {
        departments: {
          sales: { view: true, edit: true, approve: true },
          service: { view: true, edit: true, approve: true },
        },
      },
    },
    isActive: true,
  },

  // Legacy Staff User (old structure)
  legacyStaffUser: {
    uid: 'legacy123',
    email: 'legacy@test.com',
    displayName: 'Legacy Staff User',
    accessLevel: 'SALES_STAFF',
    isActive: true,
    homeProvince: 'nakhon-ratchasima',
    homeBranch: '0450',
    permissions: ['sales.view', 'sales.edit'],
  },

  // Inactive User (should not have access)
  inactiveUser: {
    uid: 'inactive123',
    email: 'inactive@test.com',
    displayName: 'Inactive User',
    access: {
      authority: 'STAFF',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['nakhon-sawan'],
        allowedBranches: ['NSN001'],
      },
      departments: ['SALES'],
    },
    isActive: false,
  },

  // Developer User (should always have access)
  devUser: {
    uid: 'dev123',
    email: 'dev@test.com',
    displayName: 'Developer User',
    isDev: true,
    isActive: true,
  },
};

// Run tests
console.log('🧪 Testing Notification Page Access...\n');

Object.entries(testCases).forEach(([userType, userData]) => {
  console.log(`\n📋 Testing ${userType}:`);
  const hasAccess = testNotificationAccess(userData);
  console.log(`✅ Access: ${hasAccess ? 'GRANTED' : 'DENIED'}\n`);

  // Expected results
  const expectedAccess = {
    staffUser: true, // ✅ Should have access (main fix)
    managerUser: true, // ✅ Should have access
    legacyStaffUser: true, // ✅ Should have access (legacy support)
    inactiveUser: false, // ❌ Should not have access
    devUser: true, // ✅ Should have access (dev override)
  };

  if (hasAccess === expectedAccess[userType]) {
    console.log(`✅ ${userType}: PASS - Access result matches expectation`);
  } else {
    console.log(
      `❌ ${userType}: FAIL - Expected ${expectedAccess[userType]}, got ${hasAccess}`
    );
  }
});

console.log(
  '\n🎯 Summary: The updated RBAC check should now allow Staff users to access their personal notifications!'
);

// Export for use in development
if (typeof window !== 'undefined') {
  window.testNotificationAccess = testNotificationAccess;
  window.notificationTestCases = testCases;
}

export { testNotificationAccess, testCases };
