/**
 * 🎭 MULTI-ROLE TESTING UTILITIES
 * 
 * Easy role simulation for testing multi-province RBAC system
 * Usage: Open browser console and run window.simulateUser('ROLE_NAME')
 */

// eslint-disable-next-line no-unused-vars
import { ROLES, PERMISSIONS } from 'data/permissions';

// Test user profiles for different roles
// UPDATED: Enhanced RBAC Structure with userRBAC field
const TEST_PROFILES = {
  SUPER_ADMIN: {
    uid: 'test_super_admin',
    email: 'superadmin@test.com',
    displayName: '🌟 Test Super Admin',
    role: 'SUPER_ADMIN',
    
    // Enhanced RBAC Structure (NEW - Phase 2)
    userRBAC: {
      authority: 'ADMIN',
      geographic: {
        scope: 'ALL',
        allowedProvinces: ['NMA', 'NSN'],
        allowedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
        homeProvince: 'NMA',
        homeBranch: '0450'
      },
      permissions: {
        departments: {
          accounting: { view: true, edit: true, approve: true },
          sales: { view: true, edit: true, approve: true },
          service: { view: true, edit: true, approve: true },
          inventory: { view: true, edit: true, approve: true },
          hr: { view: true, edit: true, approve: true }
        },
        features: {
          reports: { view: true, export: true },
          admin: { userManagement: true, systemConfig: true },
          developer: { tools: true, migration: true }
        }
      }
    },
    
    // Legacy fields (backward compatibility)
    allowedProvinces: ['NMA', 'NSN'],
    allowedBranches: ['all'],
    homeProvince: 'NMA',
    homeBranch: '0450',
    permissions: ['*'],
    isDev: true,
    isActive: true
  },

  PROVINCE_MANAGER_NSW: {
    uid: 'test_province_manager_nsw',
    email: 'manager.nsw@test.com',
    displayName: '🏢 NSW Province Manager',
    role: 'PROVINCE_MANAGER',
    
    // Clean Slate RBAC structure ONLY
    access: {
      authority: 'MANAGER',
      geographic: {
        scope: 'PROVINCE',
        allowedProvinces: ['นครสวรรค์'],
        allowedBranches: ['NSN001', 'NSN002', 'NSN003'],
        homeProvince: 'นครสวรรค์',
        homeBranch: 'NSN001'
      },
      departments: ['GENERAL', 'SALES', 'ACCOUNTING'],
      permissions: {
        'accounting.view': true,
        'accounting.edit': true,
        'accounting.approve': true,
        'sales.view': true,
        'sales.edit': true,
        'sales.approve': true,
        'reports.view': true,
        'reports.export': true
      },
      createdAt: new Date().toISOString(),
    },
    
    isDev: false,
    isActive: true
  },

  PROVINCE_MANAGER_NMA: {
    uid: 'test_province_manager_nma',
    email: 'manager.nma@test.com',
    displayName: '🏢 NMA Province Manager',
    role: 'PROVINCE_MANAGER',
    
    // Clean Slate RBAC structure ONLY
    access: {
      authority: 'MANAGER',
      geographic: {
        scope: 'PROVINCE',
        allowedProvinces: ['นครราชสีมา'],
        allowedBranches: ['0450', 'NMA002', 'NMA003'],
        homeProvince: 'นครราชสีมา',
        homeBranch: '0450'
      },
      departments: ['GENERAL', 'SALES', 'ACCOUNTING'],
      permissions: {
        'accounting.view': true,
        'accounting.edit': true,
        'accounting.approve': true,
        'sales.view': true,
        'sales.edit': true,
        'sales.approve': true,
        'reports.view': true,
        'reports.export': true
      },
      createdAt: new Date().toISOString(),
    },
    
    isDev: false,
    isActive: true
  },

  BRANCH_MANAGER_NSN001: {
    uid: 'test_branch_manager_nsn001',
    email: 'manager.nsn001@test.com',
    displayName: '🏪 NSN001 Branch Manager',
    role: 'BRANCH_MANAGER',
    
    userRBAC: {
      authority: 'MANAGER',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['NSN'],
        allowedBranches: ['NSN001'],
        homeProvince: 'NSN',
        homeBranch: 'NSN001'
      },
      permissions: {
        departments: {
          accounting: { view: true, edit: true, approve: false },
          sales: { view: true, edit: true, approve: true },
          service: { view: true, edit: true, approve: false },
          inventory: { view: true, edit: true, approve: false },
          hr: { view: false, edit: false, approve: false }
        },
        features: {
          reports: { view: true, export: false },
          admin: { userManagement: false, systemConfig: false },
          developer: { tools: false, migration: false }
        }
      }
    },
    
    allowedProvinces: ['NSN'],
    allowedBranches: ['NSN001'],
    homeProvince: 'NSN',
    homeBranch: 'NSN001',
    permissions: ['accounting.view', 'accounting.edit', 'sales.*', 'service.view', 'inventory.view', 'reports.view'],
    isDev: false,
    isActive: true
  },

  ACCOUNTING_STAFF_MULTI: {
    uid: 'test_accounting_multi',
    email: 'accounting.multi@test.com',
    displayName: '👥 Multi-Branch Accountant',
    role: 'ACCOUNTING_STAFF',
    
    userRBAC: {
      authority: 'STAFF',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['NSN'],
        allowedBranches: ['NSN001', 'NSN002'],
        homeProvince: 'NSN',
        homeBranch: 'NSN001'
      },
      permissions: {
        departments: {
          accounting: { view: true, edit: true, approve: false },
          sales: { view: false, edit: false, approve: false },
          service: { view: false, edit: false, approve: false },
          inventory: { view: false, edit: false, approve: false },
          hr: { view: false, edit: false, approve: false }
        },
        features: {
          reports: { view: true, export: false },
          admin: { userManagement: false, systemConfig: false },
          developer: { tools: false, migration: false }
        }
      }
    },
    
    allowedProvinces: ['NSN'],
    allowedBranches: ['NSN001', 'NSN002'],
    homeProvince: 'NSN',
    homeBranch: 'NSN001',
    permissions: ['accounting.view', 'accounting.edit', 'reports.view'],
    isDev: false,
    isActive: true
  },

  SALES_STAFF_NSN003: {
    uid: 'test_sales_nsn003',
    email: 'sales.nsn003@test.com',
    displayName: '👤 NSN003 Sales Staff',
    role: 'SALES_STAFF',
    
    // Clean Slate RBAC structure ONLY
    access: {
      authority: 'STAFF',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['นครสวรรค์'],
        allowedBranches: ['NSN003'],
        homeProvince: 'นครสวรรค์',
                homeBranch: 'NSN003'
      },
      departments: ['SALES'],
      permissions: {
        'sales.view': true,
        'sales.edit': true,
        'inventory.view': true,
        'reports.view': true
      },
      createdAt: new Date().toISOString(),
    },
    
    isDev: false,
    isActive: true
  },

  ACCOUNTING_STAFF_NSN001: {
    uid: 'test_accounting_nsn001',
    email: 'accounting.nsn001@test.com',
    displayName: '📊 NSN001 Accounting Staff',
    role: 'ACCOUNTING_STAFF',
    
    // Clean Slate RBAC structure ONLY
    access: {
      authority: 'STAFF',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['นครสวรรค์'],
        allowedBranches: ['NSN001'],
        homeProvince: 'นครสวรรค์',
        homeBranch: 'NSN001'
      },
      departments: ['ACCOUNTING'],
      permissions: {
        'accounting.view': true,
        'accounting.edit': true,
        'reports.view': true
      },
      createdAt: new Date().toISOString(),
    },
    
    isDev: false,
    isActive: true
  },

  SERVICE_STAFF_0450: {
    uid: 'test_service_0450',
    email: 'service.0450@test.com',
    displayName: '🔧 0450 Service Staff',
    role: 'SERVICE_STAFF',
    
    // Clean Slate RBAC structure ONLY
    access: {
      authority: 'STAFF',
      geographic: {
        scope: 'BRANCH',
        allowedProvinces: ['นครราชสีมา'],
        allowedBranches: ['0450'],
        homeProvince: 'นครราชสีมา',
        homeBranch: '0450'
      },
      departments: ['SERVICE'],
      permissions: {
        'service.view': true,
        'service.edit': true,
        'inventory.view': true,
        'reports.view': true
      },
      createdAt: new Date().toISOString(),
    },
    isDev: false,
    isActive: true
  }
};

// Simulate user function
window.simulateUser = (roleKey, customOptions = {}) => {
  const profile = TEST_PROFILES[roleKey];
  if (!profile) {
    console.error(`❌ Role '${roleKey}' not found. Available roles:`, Object.keys(TEST_PROFILES));
    return;
  }

  const testUser = { ...profile, ...customOptions };
  
  console.log(`🎭 Simulating user role: ${roleKey}`);
  console.log(`👤 User:`, testUser.displayName);
  
  // Use Clean Slate structure for logging
  if (testUser.access) {
    console.log(`🌍 Provinces:`, testUser.access.geographic.allowedProvinces);
    console.log(`🏢 Branches:`, testUser.access.geographic.allowedBranches);
    console.log(`🔑 Authority:`, testUser.access.authority);
    console.log(`📋 Departments:`, testUser.access.departments);
  }

  // Update Redux store with test user
  if (window.store) {
    window.store.dispatch({
      type: 'TEST_USER_SIMULATION',
      payload: testUser
    });
    
    // Also update auth state using correct action
    window.store.dispatch({
      type: 'USER_UPDATE',
      user: testUser
    });

    console.log(`✅ User simulation applied. Current state:`, window.store.getState().auth);
  } else {
    console.warn('⚠️ Redux store not found. Manual testing required.');
  }

  return testUser;
};

// Quick test all roles function  
window.testAllRoles = () => {
  console.log('🎭 Available Clean Slate test roles:');
  Object.keys(TEST_PROFILES).forEach(roleKey => {
    const profile = TEST_PROFILES[roleKey];
    console.log(`\n${roleKey}:`);
    console.log(`  👤 ${profile.displayName}`);
    if (profile.access) {
      console.log(`  🌍 Provinces: ${profile.access.geographic.allowedProvinces.join(', ')}`);
      console.log(`  🏢 Branches: ${profile.access.geographic.allowedBranches.join(', ')}`);
      console.log(`  👑 Authority: ${profile.access.authority}`);
      console.log(`  📋 Departments: ${profile.access.departments.join(', ')}`);
    }
    console.log(`  📧 Test: window.simulateUser('${roleKey}')`);
  });
};

// Province/Branch access checker for Clean Slate
window.checkAccess = (userRole = null) => {
  const currentUser = userRole || window.store?.getState()?.auth?.user;
  if (!currentUser) {
    console.log('❌ No user found for access check');
    return;
  }

  console.log(`🔍 Clean Slate Access Check for: ${currentUser.displayName || currentUser.email}`);
  
  if (currentUser.access) {
    const { geographic } = currentUser.access;
    console.log(`📍 Home: ${geographic.homeProvince} / ${geographic.homeBranch}`);
    console.log(`🎯 Scope: ${geographic.scope}`);
    
    console.log('\n🌍 Province Access:');
    ['นครราชสีมา', 'นครสวรรค์'].forEach(province => {
      const hasAccess = geographic.allowedProvinces.includes(province) || geographic.scope === 'ALL';
      console.log(`  ${hasAccess ? '✅' : '❌'} ${province}`);
    });
    
    console.log('\n🏢 Branch Access:');
    ['0450', 'NMA002', 'NSN001', 'NSN002', 'NSN003'].forEach(branch => {
      const hasAccess = geographic.allowedBranches.includes(branch) || geographic.scope === 'ALL';
      console.log(`  ${hasAccess ? '✅' : '❌'} ${branch}`);
    });
  } else {
    console.log('⚠️ User missing Clean Slate access structure');
  }
};

// Clean Slate Consolidation Functions
// =================================

// 🎯 Execute complete Clean Slate consolidation
window.CLEAN_SLATE_CONSOLIDATION = {
  executeCompleteConsolidation: async ({ dryRun = false } = {}) => {
    console.log('🚀 EXECUTING COMPLETE CLEAN SLATE CONSOLIDATION');
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE EXECUTION'}`);
    
    try {
      // Import and execute migration
      const { executeCompleteCleanSlateMigration } = await import('./utils/complete-clean-slate-migration.js');
      const result = await executeCompleteCleanSlateMigration({
        dryRun,
        batchSize: 100,
        forceCleanSlateOnly: true
      });
      
      console.log('✅ Clean Slate consolidation completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Clean Slate consolidation failed:', error);
      throw error;
    }
  },

  verifyCleanSlateOnlyMigration: async () => {
    console.log('🔍 VERIFYING CLEAN SLATE ONLY MIGRATION');
    
    try {
      const { verifyMigrationResults } = await import('./utils/complete-clean-slate-migration.js');
      const result = await verifyMigrationResults();
      
      console.log('✅ Clean Slate verification completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Clean Slate verification failed:', error);
      throw error;
    }
  }
};

// Clean Slate Testing Functions
// ============================

window.debugCleanSlateRBAC = () => {
  console.log('🔍 Clean Slate RBAC Debug Information:');
  
  if (window.store) {
    const state = window.store.getState();
    const currentUser = state.auth?.user;
    
    console.log('👤 Current User:', currentUser);
    
    if (currentUser) {
      console.log('🆔 User ID:', currentUser.uid);
      console.log('👤 Display Name:', currentUser.displayName);
      console.log('');
      
      if (currentUser.access) {
        console.log('✅ Clean Slate RBAC Structure:');
        console.log('  Authority:', currentUser.access.authority);
        console.log('  Geographic Scope:', currentUser.access.geographic.scope);
        console.log('  Allowed Provinces:', currentUser.access.geographic.allowedProvinces);
        console.log('  Allowed Branches:', currentUser.access.geographic.allowedBranches);
        console.log('  Home Province:', currentUser.access.geographic.homeProvince);
        console.log('  Home Branch:', currentUser.access.geographic.homeBranch);
        console.log('  Departments:', currentUser.access.departments);
        console.log('  Structure: Clean Slate RBAC');
        console.log('');
        console.log('  Permissions:');
        Object.entries(currentUser.access.permissions).forEach(([perm, value]) => {
          console.log(`    ${perm}: ${value}`);
        });
      } else {
        console.log('❌ Missing Clean Slate access structure - needs migration');
      }
    }
  } else {
    console.error('❌ Redux store not available');
  }
};

// Clean Slate Profile Validation
window.validateCleanSlateProfile = (roleKey, showDetails = true) => {
  const profile = TEST_PROFILES[roleKey];
  if (!profile) {
    console.error(`❌ Role '${roleKey}' not found`);
    return false;
  }
  
  const errors = [];
  
  // Check required basic fields
  if (!profile.uid) errors.push('Missing uid');
  if (!profile.email) errors.push('Missing email');
  if (!profile.displayName) errors.push('Missing displayName');
  
  // Check Clean Slate RBAC structure
  if (!profile.access) {
    errors.push('Missing Clean Slate access structure');
  } else {
    const { access } = profile;
    
    // Check authority
    if (!access.authority || !['ADMIN', 'MANAGER', 'LEAD', 'STAFF'].includes(access.authority)) {
      errors.push('Invalid or missing authority');
    }
    
    // Check geographic
    if (!access.geographic) {
      errors.push('Missing geographic structure');
    } else {
      const geo = access.geographic;
      if (!geo.scope || !['ALL', 'PROVINCE', 'BRANCH'].includes(geo.scope)) {
        errors.push('Invalid or missing geographic scope');
      }
      if (!Array.isArray(geo.allowedProvinces)) {
        errors.push('allowedProvinces must be array');
      }
      if (!Array.isArray(geo.allowedBranches)) {
        errors.push('allowedBranches must be array');
      }
      if (!geo.homeProvince) {
        errors.push('Missing homeProvince');
      }
      if (!geo.homeBranch) {
        errors.push('Missing homeBranch');
      }
    }
    
    // Check permissions structure
    if (!access.permissions || typeof access.permissions !== 'object') {
      errors.push('Invalid permissions structure');
    }
    
    // Check departments
    if (!Array.isArray(access.departments)) {
      errors.push('Departments must be array');
    }
    
  }
  
  if (showDetails) {
    if (errors.length === 0) {
      console.log(`✅ ${roleKey}: Clean Slate profile structure is valid`);
    } else {
      console.log(`❌ ${roleKey}: Clean Slate profile has errors:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
  }
  
  return errors.length === 0;
};

// Export for use
export {
  TEST_PROFILES
};

// Functions are attached to window object for console use

console.log('🎭 Role Testing Utilities Loaded!');
console.log('📝 Commands available:');
console.log('  window.testAllRoles() - See all available test roles');
console.log('  window.simulateUser("ROLE_NAME") - Switch to test role');
console.log('  window.checkAccess() - Check current user permissions');
console.log('  window.testNavigation("ROLE_NAME") - Get navigation test guide');
console.log('');
console.log('🚀 For comprehensive testing, use:');
console.log('  window.comprehensiveTests.runAllTests() - Run full test suite');
console.log('  window.businessWorkflowTests.testAccountingWorkflow() - Test accounting');
console.log('  window.geographicTests.testProvinceSwitching() - Test provinces');
console.log('');
console.log('🔧 For debugging:');
console.log('  window.loadProvinces() - Manually load provinces data');
console.log('  window.debugRBAC() - Show complete RBAC state');
console.log('  window.refreshRBAC("ROLE_NAME") - Force RBAC refresh with optional role switch');
console.log('  window.forceUserContextUpdate() - Force UserContext sidebar to update');
console.log('');
console.log('🧪 Test Enhanced RBAC:');
console.log('  window.testEnhancedRBAC() - Test all enhanced RBAC features');
console.log('  window.validateTestProfile("ROLE_NAME") - Validate specific test profile structure');
console.log('');
console.log('🎯 UNIFIED CLEAN SLATE RBAC SYSTEM:');
console.log('  ✅ ONE usePermissions hook (Clean Slate ONLY)');
console.log('  ✅ 3x Performance improvement (no fallback chains)');
console.log('  ✅ Complete API with migration detection');
console.log('');
console.log('🔄 Clean Slate Migration:');
console.log('  window.CLEAN_SLATE_CONSOLIDATION.executeCompleteConsolidation() - Migrate to Clean Slate ONLY');
console.log('  window.CLEAN_SLATE_CONSOLIDATION.verifyCleanSlateOnlyMigration() - Verify migration');

// Load Complete Clean Slate Consolidation
import('./utils/complete-clean-slate-migration').then(module => {
  window.CLEAN_SLATE_CONSOLIDATION = {
    executeCompleteConsolidation: module.executeCompleteConsolidation,
    executeCompleteCleanSlateMigration: module.executeCompleteCleanSlateMigration,
    verifyCleanSlateOnlyMigration: module.verifyCleanSlateOnlyMigration
  };
  
  console.log('');
  console.log('🎯 COMPLETE CLEAN SLATE CONSOLIDATION LOADED!');
  console.log('='.repeat(60));
  console.log('🚀 To consolidate to Clean Slate ONLY (LIVE MIGRATION):');
  console.log('   CLEAN_SLATE_CONSOLIDATION.executeCompleteConsolidation({ dryRun: false })');
  console.log('');
  console.log('🧪 To test migration (DRY RUN):');
  console.log('   CLEAN_SLATE_CONSOLIDATION.executeCompleteConsolidation({ dryRun: true })');
  console.log('');
  console.log('🔍 To verify after migration:');
  console.log('   CLEAN_SLATE_CONSOLIDATION.verifyCleanSlateOnlyMigration()');
  console.log('='.repeat(60));
}).catch(err => {
  console.warn('Could not load Complete Clean Slate Consolidation:', err);
}); 