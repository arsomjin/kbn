/**
 * UNIFIED MIGRATION - Single source of truth for RBAC migration
 * Converts ANY user format to Clean Slate orthogonal system
 */

import { migrateToOrthogonalSystem, generateUserPermissions } from './orthogonal-rbac';
import { validateCleanSlateUser } from './clean-slate-helpers';

/**
 * Unified migration function - converts any legacy user to Clean Slate
 * @param {Object} legacyUser - User in any legacy format
 * @returns {Object} Clean Slate user structure
 */
export const migrateUserToCleanSlate = (legacyUser) => {
  if (!legacyUser) return null;
  
  // Check if already in Clean Slate format
  if (legacyUser.access && legacyUser.access.authority) {
    console.log('✅ User already in Clean Slate format:', legacyUser.uid);
    return legacyUser;
  }
  
  console.log('🔄 Migrating user to Clean Slate format:', legacyUser.uid);
  
  // Use orthogonal migration (most comprehensive)
  const cleanSlateUser = migrateToOrthogonalSystem(legacyUser);
  
  if (!cleanSlateUser) {
    console.error('❌ Migration failed for user:', legacyUser.uid);
    return null;
  }
  
  // Validate the result
  const validation = validateCleanSlateUser(cleanSlateUser);
  if (!validation.isValid) {
    console.error('❌ Migration produced invalid Clean Slate structure:', validation.errors);
    return null;
  }
  
  console.log('✅ Successfully migrated user to Clean Slate:', cleanSlateUser.uid);
  return cleanSlateUser;
};

/**
 * Get user permissions using Clean Slate system
 * Handles both legacy and Clean Slate users
 * @param {Object} user - User object
 * @returns {Object} RBAC data with permissions and geographic access
 */
export const getUserRBACData = (user) => {
  if (!user) return { permissions: [], geographic: null };
  
  // If user is already Clean Slate, generate permissions directly
  if (user.access) {
    return generateUserPermissions(user);
  }
  
  // If legacy user, migrate first then generate permissions
  const cleanSlateUser = migrateUserToCleanSlate(user);
  if (!cleanSlateUser) {
    console.error('❌ Could not migrate user for RBAC data:', user.uid);
    return { permissions: [], geographic: null };
  }
  
  return generateUserPermissions(cleanSlateUser);
};

/**
 * Check if user is in Clean Slate format
 * @param {Object} user - User object
 * @returns {boolean} Is Clean Slate format
 */
export const isCleanSlateUser = (user) => {
  return user && user.access && user.access.authority;
};

/**
 * Get migration status for user
 * @param {Object} user - User object  
 * @returns {Object} Migration status
 */
export const getMigrationStatus = (user) => {
  if (!user) {
    return { status: 'invalid', reason: 'No user provided' };
  }
  
  if (isCleanSlateUser(user)) {
    return { status: 'clean_slate', reason: 'Already in Clean Slate format' };
  }
  
  // Check for various legacy formats
  if (user.accessLevel || user.allowedProvinces || user.permissions) {
    return { status: 'legacy', reason: 'Legacy format detected, needs migration' };
  }
  
  if (user.auth || user.rbac) {
    return { status: 'nested_legacy', reason: 'Nested legacy format, needs migration' };
  }
  
  return { status: 'unknown', reason: 'Unknown user format' };
};

/**
 * Bulk migrate multiple users to Clean Slate format
 * @param {Array} users - Array of user objects
 * @param {Object} options - Migration options
 * @returns {Object} Migration results
 */
export const bulkMigrateToCleanSlate = (users, options = {}) => {
  const { dryRun = false, logProgress = true } = options;
  
  const results = {
    total: users.length,
    migrated: 0,
    alreadyCleanSlate: 0,
    failed: 0,
    errors: []
  };
  
  users.forEach((user, index) => {
    try {
      if (logProgress && index % 10 === 0) {
        console.log(`Progress: ${index}/${users.length}`);
      }
      
      if (isCleanSlateUser(user)) {
        results.alreadyCleanSlate++;
        return;
      }
      
      if (!dryRun) {
        const migrated = migrateUserToCleanSlate(user);
        if (migrated) {
          results.migrated++;
        } else {
          results.failed++;
          results.errors.push(`Failed to migrate user: ${user.uid}`);
        }
      } else {
        // Dry run - just validate migration would work
        const migrated = migrateUserToCleanSlate(user);
        if (migrated) {
          results.migrated++;
        } else {
          results.failed++;
          results.errors.push(`Would fail to migrate user: ${user.uid}`);
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error migrating user ${user.uid}: ${error.message}`);
    }
  });
  
  return results;
};

// Deprecated migration functions - redirect to unified approach
export const migrateLegacyUser = (user) => {
  console.warn('⚠️ DEPRECATED: migrateLegacyUser() - Use migrateUserToCleanSlate() instead');
  return migrateUserToCleanSlate(user);
};

export const migrateExistingUserRole = () => {
  throw new Error('DEPRECATED: migrateExistingUserRole() - Use migrateUserToCleanSlate() instead');
};

export const migrateUserToRBAC = (user) => {
  console.warn('⚠️ DEPRECATED: migrateUserToRBAC() - Use migrateUserToCleanSlate() instead');
  return migrateUserToCleanSlate(user);
};

export default {
  migrateUserToCleanSlate,
  getUserRBACData,
  isCleanSlateUser,
  getMigrationStatus,
  bulkMigrateToCleanSlate,
  // Deprecated aliases
  migrateLegacyUser,
  migrateUserToRBAC
}; 