/**
 * Test Navigation Access for Hierarchical RBAC
 * Verifies that ADMIN, MANAGER, and LEAD can see admin menu items
 */

import { NAVIGATION_CONFIG } from '../data/navigationConfig';

// Test function to simulate navigation filtering logic
const testNavigationAccess = () => {
  console.log('🧪 Testing Navigation Access for Hierarchical RBAC...');

  // Test cases for different user authority levels
  const testCases = [
    {
      name: 'ADMIN (Level 4)',
      authority: 'ADMIN',
      expectedAccess: {
        adminSection: true,
        userManagement: true,
        permissionManagement: true,
      },
    },
    {
      name: 'MANAGER (Level 3)',
      authority: 'MANAGER',
      expectedAccess: {
        adminSection: true,
        userManagement: true,
        permissionManagement: true,
      },
    },
    {
      name: 'LEAD (Level 2)',
      authority: 'LEAD',
      expectedAccess: {
        adminSection: true,
        userManagement: true,
        permissionManagement: true,
      },
    },
    {
      name: 'STAFF (Level 1)',
      authority: 'STAFF',
      expectedAccess: {
        adminSection: false,
        userManagement: false,
        permissionManagement: false,
      },
    },
  ];

  // Simulate the filtering logic
  const checkAccess = (item, userAuthority) => {
    // Check authority-based access first
    if (item.authorities && Array.isArray(item.authorities)) {
      return item.authorities.includes(userAuthority);
    }

    // If no authorities specified, assume no access for this test
    return false;
  };

  // Test each case
  testCases.forEach((testCase) => {
    console.log(`\n👤 Testing: ${testCase.name}`);

    const adminSection = NAVIGATION_CONFIG.admin;
    const userManagementItem = adminSection.items.find(
      (item) => item.key === 'user-management'
    );
    const permissionManagementItem = adminSection.items.find(
      (item) => item.key === 'permission-management'
    );

    const results = {
      adminSection: checkAccess(adminSection, testCase.authority),
      userManagement: checkAccess(userManagementItem, testCase.authority),
      permissionManagement: checkAccess(
        permissionManagementItem,
        testCase.authority
      ),
    };

    console.log('📋 Results:', {
      authority: testCase.authority,
      adminSection: {
        expected: testCase.expectedAccess.adminSection,
        actual: results.adminSection,
        passed: results.adminSection === testCase.expectedAccess.adminSection,
      },
      userManagement: {
        expected: testCase.expectedAccess.userManagement,
        actual: results.userManagement,
        passed:
          results.userManagement === testCase.expectedAccess.userManagement,
      },
      permissionManagement: {
        expected: testCase.expectedAccess.permissionManagement,
        actual: results.permissionManagement,
        passed:
          results.permissionManagement ===
          testCase.expectedAccess.permissionManagement,
      },
    });

    const allPassed = Object.values(results).every(
      (result, index) =>
        result === Object.values(testCase.expectedAccess)[index]
    );

    console.log(`✅ Overall Result: ${allPassed ? 'PASSED' : 'FAILED'}`);
  });

  console.log('\n🎯 Navigation Configuration Check:');
  console.log('Admin Section:', {
    authorities: NAVIGATION_CONFIG.admin.authorities,
    permission: NAVIGATION_CONFIG.admin.permission,
  });

  console.log('User Management Item:', {
    authorities: NAVIGATION_CONFIG.admin.items.find(
      (item) => item.key === 'user-management'
    )?.authorities,
    permissions: NAVIGATION_CONFIG.admin.items.find(
      (item) => item.key === 'user-management'
    )?.permission,
  });

  console.log('Permission Management Item:', {
    authorities: NAVIGATION_CONFIG.admin.items.find(
      (item) => item.key === 'permission-management'
    )?.authorities,
    permissions: NAVIGATION_CONFIG.admin.items.find(
      (item) => item.key === 'permission-management'
    )?.permission,
  });
};

// Export for use in console
window.testNavigationAccess = testNavigationAccess;

export default testNavigationAccess;
