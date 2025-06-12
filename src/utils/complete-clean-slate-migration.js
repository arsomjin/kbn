/**
 * COMPLETE CLEAN SLATE CONSOLIDATION
 * Removes ALL legacy and Enhanced RBAC structures
 * Leaves ONLY Clean Slate access structure
 */

import { app } from '../firebase';
import { migrateToOrthogonalSystem, createUserAccess } from './orthogonal-rbac';
import { validateCleanSlateUser } from './clean-slate-helpers';

/**
 * Phase 1: Migrate ALL users to Clean Slate ONLY
 * Removes userRBAC, auth nesting, and legacy fields
 */
export const executeCompleteCleanSlateMigration = async (options = {}) => {
  const { dryRun = true, batchSize = 10 } = options;
  
  console.log('🚀 COMPLETE CLEAN SLATE CONSOLIDATION STARTING...');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : '🔴 LIVE MIGRATION'}`);
  console.log('');
  
  const results = {
    totalUsers: 0,
    migrated: 0,
    alreadyCleanSlate: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Get all users
    console.log('📊 Fetching all users...');
    const usersSnapshot = await app.firestore().collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    results.totalUsers = users.length;
    console.log(`Found ${results.totalUsers} users to process\n`);
    
    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}...`);
      
      for (const user of batch) {
        try {
          const migrationResult = await migrateUserToCleanSlateOnly(user, dryRun);
          
          if (migrationResult.status === 'migrated') {
            results.migrated++;
            console.log(`  ✅ ${user.displayName || user.email}: Migrated to Clean Slate`);
          } else if (migrationResult.status === 'already_clean_slate') {
            results.alreadyCleanSlate++;
            console.log(`  ✅ ${user.displayName || user.email}: Already Clean Slate`);
          } else {
            results.failed++;
            console.log(`  ❌ ${user.displayName || user.email}: ${migrationResult.error}`);
            results.errors.push(migrationResult.error);
          }
        } catch (error) {
          results.failed++;
          console.log(`  ❌ ${user.displayName || user.email}: ${error.message}`);
          results.errors.push(`${user.uid}: ${error.message}`);
        }
      }
      
      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎊 COMPLETE CLEAN SLATE CONSOLIDATION FINISHED');
    console.log('='.repeat(60));
    console.log(`📊 Results:`);
    console.log(`  Total Users: ${results.totalUsers}`);
    console.log(`  Migrated: ${results.migrated}`);
    console.log(`  Already Clean Slate: ${results.alreadyCleanSlate}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Success Rate: ${((results.migrated + results.alreadyCleanSlate) / results.totalUsers * 100).toFixed(1)}%`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
};

/**
 * Migrate single user to Clean Slate ONLY structure
 */
const migrateUserToCleanSlateOnly = async (user, dryRun = true) => {
  // Check if already Clean Slate only
  if (isAlreadyCleanSlateOnly(user)) {
    return { status: 'already_clean_slate' };
  }
  
  try {
    // Create Clean Slate structure
    const cleanSlateUser = migrateToOrthogonalSystem(user);
    
    if (!cleanSlateUser || !cleanSlateUser.access) {
      return { status: 'failed', error: 'Migration failed - no access structure created' };
    }
    
    // Validate Clean Slate structure
    const validation = validateCleanSlateUser(cleanSlateUser);
    if (!validation.isValid) {
      return { status: 'failed', error: `Invalid structure: ${validation.errors.join(', ')}` };
    }
    
    // Create CLEAN document structure (REMOVE ALL LEGACY FIELDS)
    const cleanDocument = createCleanDocument(cleanSlateUser, user);
    
    if (!dryRun) {
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .set(cleanDocument, { merge: false }); // Complete replacement
    }
    
    return { status: 'migrated', cleanDocument };
    
  } catch (error) {
    return { status: 'failed', error: error.message };
  }
};

/**
 * Check if user is already Clean Slate ONLY (no legacy fields)
 */
const isAlreadyCleanSlateOnly = (user) => {
  // Must have access structure
  if (!user.access || !user.access.authority) {
    return false;
  }
  
  // Must NOT have legacy fields
  const hasLegacyFields = !!(
    user.userRBAC ||           // Enhanced RBAC structure
    user.rbac ||               // Legacy RBAC structure
    user.auth ||               // Nested auth structure
    user.accessLevel ||        // Legacy access level
    user.allowedProvinces ||   // Legacy geographic
    user.allowedBranches ||    // Legacy geographic
    user.permissions ||        // Legacy permissions
    user.role                  // Legacy role field
  );
  
  return !hasLegacyFields;
};

/**
 * Create clean document with ONLY Clean Slate structure
 */
const createCleanDocument = (cleanSlateUser, originalUser) => {
  return {
    // Essential user data
    uid: originalUser.uid,
    email: originalUser.email,
    displayName: originalUser.displayName || `${originalUser.firstName || 'User'} ${originalUser.lastName || ''}`,
    firstName: originalUser.firstName || originalUser.auth?.firstName || '',
    lastName: originalUser.lastName || originalUser.auth?.lastName || '',
    photoURL: originalUser.photoURL,
    
    // Clean Slate RBAC structure (ONLY structure)
    access: cleanSlateUser.access,
    
    // Status and metadata
    isActive: originalUser.isActive !== false,
    isApproved: originalUser.isApproved !== false,
    isDev: originalUser.isDev || false,
    
    // Essential metadata
    createdAt: originalUser.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    migratedAt: new Date().toISOString(),
    
  };
};

/**
 * Phase 2: Update all components to use ONLY Clean Slate
 */
export const updateComponentsToCleanSlateOnly = () => {
  console.log('🔧 PHASE 2: Updating components to Clean Slate ONLY...');
  
  const updates = [
    {
      component: 'usePermissions',
      change: 'Remove all fallback logic, use only user.access.*'
    },
    {
      component: 'useNavigationGenerator', 
      change: 'Remove fallback to user.accessLevel, use only user.access.authority'
    },
    {
      component: 'ApprovalStatus',
      change: 'Remove userRBAC fallbacks, use only user.access.geographic.*'
    },
    {
      component: 'PermissionManagement',
      change: 'Remove userRBAC reading, use only user.access.permissions'
    },
    {
      component: 'All selectors',
      change: 'Remove legacy field support, use only Clean Slate structure'
    }
  ];
  
  console.log('Components to update:');
  updates.forEach((update, index) => {
    console.log(`  ${index + 1}. ${update.component}: ${update.change}`);
  });
  
  return updates;
};

/**
 * Phase 3: Remove deprecated code
 */
export const getDeprecatedCodeToRemove = () => {
  const deprecated = [
    'src/utils/rbac-enhanced.js - Enhanced RBAC system (REMOVE)',
    'src/utils/userMigration.js - Legacy migration utilities (REMOVE)',
    'All userRBAC references in components (REMOVE)',
    'All auth.* field reading in components (REMOVE)',
    'All accessLevel, allowedProvinces fallbacks (REMOVE)',
    'Legacy role constants: SUPER_ADMIN, PROVINCE_MANAGER, etc. (REMOVE)',
    'Enhanced RBAC test profiles in role-testing-utilities.js (REMOVE)'
  ];
  
  console.log('\n🗑️ PHASE 3: Deprecated code to remove:');
  deprecated.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item}`);
  });
  
  return deprecated;
};

/**
 * Verification: Check all users are Clean Slate ONLY
 */
export const verifyCleanSlateOnlyMigration = async () => {
  console.log('🔍 Verifying Clean Slate ONLY migration...');
  
  const usersSnapshot = await app.firestore().collection('users').get();
  const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  
  const issues = [];
  let cleanSlateOnlyCount = 0;
  
  users.forEach(user => {
    if (isAlreadyCleanSlateOnly(user)) {
      cleanSlateOnlyCount++;
    } else {
      const legacyFields = [];
      if (user.userRBAC) legacyFields.push('userRBAC');
      if (user.rbac) legacyFields.push('rbac');
      if (user.auth) legacyFields.push('auth');
      if (user.accessLevel) legacyFields.push('accessLevel');
      if (user.allowedProvinces) legacyFields.push('allowedProvinces');
      
      issues.push(`${user.displayName || user.email}: Still has ${legacyFields.join(', ')}`);
    }
  });
  
  console.log(`✅ Clean Slate ONLY: ${cleanSlateOnlyCount}/${users.length} users`);
  console.log(`❌ Still have legacy fields: ${issues.length} users`);
  
  if (issues.length > 0) {
    console.log('\nUsers with legacy fields:');
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  return {
    total: users.length,
    cleanSlateOnly: cleanSlateOnlyCount,
    withLegacyFields: issues.length,
    issues
  };
};

/**
 * Master execution function
 */
export const executeCompleteConsolidation = async (options = {}) => {
  console.log('🚀 STARTING COMPLETE CLEAN SLATE CONSOLIDATION');
  console.log('='.repeat(70));
  
  try {
    // Phase 1: Migrate all users
    console.log('📋 PHASE 1: User Data Migration');
    const migrationResults = await executeCompleteCleanSlateMigration(options);
    
    // Phase 2: Component updates (manual)
    console.log('\n📋 PHASE 2: Component Updates');
    updateComponentsToCleanSlateOnly();
    
    // Phase 3: Code cleanup (manual)
    console.log('\n📋 PHASE 3: Code Cleanup');
    getDeprecatedCodeToRemove();
    
    // Verification
    console.log('\n📋 VERIFICATION: Clean Slate Only Check');
    const verificationResults = await verifyCleanSlateOnlyMigration();
    
    return {
      migration: migrationResults,
      verification: verificationResults
    };
    
  } catch (error) {
    console.error('💥 Complete consolidation failed:', error);
    throw error;
  }
};

// Console functions
if (typeof window !== 'undefined') {
  window.executeCompleteCleanSlateMigration = executeCompleteCleanSlateMigration;
  window.verifyCleanSlateOnlyMigration = verifyCleanSlateOnlyMigration;
  window.executeCompleteConsolidation = executeCompleteConsolidation;
  
  console.log('🧪 Complete Clean Slate Consolidation loaded!');
  console.log('Available functions:');
  console.log('  window.executeCompleteConsolidation() - Run complete consolidation');
  console.log('  window.executeCompleteCleanSlateMigration() - Migrate users only');
  console.log('  window.verifyCleanSlateOnlyMigration() - Verify migration');
}

export default {
  executeCompleteCleanSlateMigration,
  verifyCleanSlateOnlyMigration,
  executeCompleteConsolidation
}; 