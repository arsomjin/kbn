/**
 * 🚀 SUPER ADMIN CREATION SCRIPT
 *
 * Run this in browser console to create Super Admin for testing
 * Usage: Open browser console and run window.createSuperAdmin()
 */

import { app } from './firebase';

// Super Admin creation function
export const createSuperAdmin = async () => {
  try {
    console.log('🚀 Creating Super Admin...');

    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.error('❌ No user logged in. Please login first.');
      return false;
    }

    console.log('👤 Current user:', currentUser.email);
    console.log('🔧 Setting up Super Admin access...');

    // Create comprehensive Super Admin structure
    const superAdminData = {
      // Essential user data
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',

      // Clean Slate RBAC structure
      access: {
        authority: 'ADMIN',
        geographic: {
          scope: 'ALL',
          assignedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
          assignedBranches: [
            '0450',
            'NMA002',
            'NMA003',
            'NSN001',
            'NSN002',
            'NSN003',
          ],
          homeProvince: 'nakhon-ratchasima',
          homeBranch: '0450',
        },
        departments: ['all'],
        permissions: ['*'],
        isActive: true,
        lastUpdate: Date.now(),
        updatedBy: 'super-admin-creation-script',
      },

      // Legacy compatibility fields
      accessLevel: 'SUPER_ADMIN',
      allowedProvinces: [], // Empty = all provinces
      allowedBranches: [], // Empty = all branches
      homeProvince: 'nakhon-ratchasima',
      homeBranch: '0450',
      permissions: ['*'],

      // Status flags
      isDev: true,
      isActive: true,
      isApproved: true,

      // Auth status
      auth: {
        isActive: true,
        isApproved: true,
        approvalStatus: 'approved',
      },

      // System metadata
      created: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
      lastLogin: Date.now(),
      migrationType: 'super-admin-creation',
    };

    // Update user document in Firestore
    await app
      .firestore()
      .collection('users')
      .doc(currentUser.uid)
      .set(superAdminData, { merge: true });

    console.log('✅ Super Admin created successfully!');
    console.log('🎯 User now has:');
    console.log('   - Full system access (ADMIN authority)');
    console.log('   - All provinces and branches');
    console.log('   - All permissions (*)');
    console.log('   - Dev access enabled');
    console.log('');
    console.log('🔄 Please refresh the page to see changes.');

    return true;
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    return false;
  }
};

// Create different role types for testing
export const createTestUser = async (
  role = 'SALES_STAFF',
  province = 'nakhon-sawan',
  branch = 'NSN001'
) => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.error('❌ No user logged in. Please login first.');
      return false;
    }

    console.log(`🎭 Creating ${role} user for testing...`);

    const roleConfigs = {
      SALES_MANAGER: {
        authority: 'MANAGER',
        departments: ['sales'],
        permissions: [
          'sales.view',
          'sales.edit',
          'sales.approve',
          'accounting.view',
        ],
        accessLevel: 'BRANCH_MANAGER',
      },
      SALES_STAFF: {
        authority: 'STAFF',
        departments: ['sales'],
        permissions: ['sales.view', 'sales.edit'],
        accessLevel: 'SALES_STAFF',
      },
      ACCOUNTING_STAFF: {
        authority: 'STAFF',
        departments: ['accounting'],
        permissions: ['accounting.view', 'accounting.edit'],
        accessLevel: 'ACCOUNTING_STAFF',
      },
    };

    const config = roleConfigs[role] || roleConfigs['SALES_STAFF'];

    const testUserData = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || `Test ${role}`,

      access: {
        authority: config.authority,
        geographic: {
          scope: config.authority === 'MANAGER' ? 'PROVINCE' : 'BRANCH',
          assignedProvinces: [province],
          assignedBranches: config.authority === 'MANAGER' ? [] : [branch],
          homeProvince: province,
          homeBranch: branch,
        },
        departments: config.departments,
        permissions: config.permissions,
        isActive: true,
        lastUpdate: Date.now(),
        updatedBy: 'test-user-creation-script',
      },

      // Legacy compatibility
      accessLevel: config.accessLevel,
      allowedProvinces: [province],
      allowedBranches: [branch],
      homeProvince: province,
      homeBranch: branch,
      permissions: config.permissions,

      isActive: true,
      isApproved: true,
      auth: {
        isActive: true,
        isApproved: true,
        approvalStatus: 'approved',
      },

      updatedAt: Date.now(),
    };

    await app
      .firestore()
      .collection('users')
      .doc(currentUser.uid)
      .set(testUserData, { merge: true });

    console.log(`✅ ${role} user created successfully!`);
    console.log(`🏢 Province: ${province}`);
    console.log(`🏪 Branch: ${branch}`);
    console.log(`🔐 Permissions: ${config.permissions.join(', ')}`);
    console.log('🔄 Please refresh the page to see changes.');

    return true;
  } catch (error) {
    console.error(`❌ Error creating ${role} user:`, error);
    return false;
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  window.createSuperAdmin = createSuperAdmin;
  window.createTestUser = createTestUser;

  // Quick shortcuts
  window.makeMeSuperAdmin = createSuperAdmin;
  window.makeMeSalesManager = () =>
    createTestUser('SALES_MANAGER', 'nakhon-sawan', 'NSN001');
  window.makeMeSalesStaff = () =>
    createTestUser('SALES_STAFF', 'nakhon-sawan', 'NSN001');
  window.makeMeAccountingStaff = () =>
    createTestUser('ACCOUNTING_STAFF', 'nakhon-sawan', 'NSN001');
}

console.log('🎭 Super Admin Creation Script Loaded!');
console.log('');
console.log('Available commands:');
console.log('  window.createSuperAdmin() - Make current user Super Admin');
console.log('  window.makeMeSuperAdmin() - Quick Super Admin');
console.log('  window.makeMeSalesManager() - Sales Manager NSN001');
console.log('  window.makeMeSalesStaff() - Sales Staff NSN001');
console.log('  window.makeMeAccountingStaff() - Accounting Staff NSN001');
console.log('');
