/**
 * Migration Utilities for Enhanced RBAC System
 * Migrates from role replacement to additive granular permissions
 */

import { app } from '../firebase';
import { BASE_ROLES, getCompatiblePermissions, getEffectivePermissions } from './rbac-enhanced';

/**
 * Migrate a single user to the new additive permission system
 */
export const migrateUserToAdditiveSystem = async (userId, dryRun = true) => {
  try {
    const userRef = app.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data();
    const currentRole = userData.auth?.accessLevel;
    const currentAdditionalPerms = userData.auth?.additionalPermissions || [];
    
    // If user already has additionalPermissions, they're already migrated
    if (currentAdditionalPerms.length > 0) {
      return {
        status: 'already_migrated',
        userId,
        currentRole,
        additionalPermissions: currentAdditionalPerms
      };
    }
    
    // Check if current role exists in base roles
    if (!BASE_ROLES[currentRole]) {
      return {
        status: 'invalid_role',
        userId,
        currentRole,
        error: 'Role not found in BASE_ROLES'
      };
    }
    
    // For basic roles, no additional permissions needed
    const basicRoles = ['SUPER_ADMIN', 'PROVINCE_MANAGER', 'BRANCH_MANAGER', 'ACCOUNTING_STAFF', 'SALES_STAFF', 'SERVICE_STAFF', 'INVENTORY_STAFF', 'HR_STAFF', 'EXECUTIVE'];
    
    let additionalPermissions = [];
    let newBaseRole = currentRole;
    
    // Map enhanced roles to base role + additional permissions
    const enhancedRoleMappings = {
      'ACCOUNTING_STAFF_SALES_VIEWER': {
        baseRole: 'ACCOUNTING_STAFF',
        additionalPermissions: ['SALES_DATA_ACCESS']
      },
      'SALES_STAFF_INVENTORY_VIEWER': {
        baseRole: 'SALES_STAFF', 
        additionalPermissions: ['INVENTORY_DATA_ACCESS']
      },
      'SERVICE_STAFF_PARTS_MANAGER': {
        baseRole: 'SERVICE_STAFF',
        additionalPermissions: ['INVENTORY_MANAGEMENT']
      },
      'FINANCE_ANALYST': {
        baseRole: 'ACCOUNTING_STAFF',
        additionalPermissions: ['SALES_DATA_ACCESS', 'PROVINCE_REPORTING', 'ADVANCED_REPORTING']
      },
      'OPERATIONS_COORDINATOR': {
        baseRole: 'SALES_STAFF',
        additionalPermissions: ['SERVICE_DATA_ACCESS', 'INVENTORY_DATA_ACCESS', 'MULTI_BRANCH_COORDINATION']
      }
    };
    
    // Check if current role is an enhanced role that needs migration
    if (enhancedRoleMappings[currentRole]) {
      const mapping = enhancedRoleMappings[currentRole];
      newBaseRole = mapping.baseRole;
      additionalPermissions = mapping.additionalPermissions;
    }
    
    const migrationPlan = {
      status: 'migration_needed',
      userId,
      oldRole: currentRole,
      newBaseRole,
      additionalPermissions,
      oldEffectivePermissions: userData.auth?.permissions || [],
      newEffectivePermissions: getEffectivePermissions(newBaseRole, additionalPermissions)
    };
    
    if (!dryRun) {
      // Perform the actual migration
      const updates = {
        'auth.accessLevel': newBaseRole,
        'auth.additionalPermissions': additionalPermissions,
        'auth.migratedAt': Date.now(),
        'auth.migrationVersion': '2.0-additive',
        'auth.lastUpdated': Date.now()
      };
      
      await userRef.update(updates);
      
      // Log the migration
      await app.firestore().collection('auditLogs').add({
        type: 'USER_MIGRATION',
        userId,
        oldRole: currentRole,
        newBaseRole,
        additionalPermissions,
        timestamp: Date.now(),
        migrationVersion: '2.0-additive'
      });
      
      migrationPlan.status = 'migrated';
    }
    
    return migrationPlan;
    
  } catch (error) {
    console.error('Error migrating user:', error);
    return {
      status: 'error',
      userId,
      error: error.message
    };
  }
};

/**
 * Migrate all users to the new additive permission system
 */
export const migrateAllUsersToAdditiveSystem = async (dryRun = true) => {
  try {
    const usersSnapshot = await app.firestore().collection('users').get();
    const migrationResults = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const result = await migrateUserToAdditiveSystem(userDoc.id, dryRun);
      migrationResults.push(result);
    }
    
    // Generate migration summary
    const summary = {
      totalUsers: migrationResults.length,
      alreadyMigrated: migrationResults.filter(r => r.status === 'already_migrated').length,
      migrationNeeded: migrationResults.filter(r => r.status === 'migration_needed').length,
      migrated: migrationResults.filter(r => r.status === 'migrated').length,
      errors: migrationResults.filter(r => r.status === 'error').length,
      invalidRoles: migrationResults.filter(r => r.status === 'invalid_role').length,
      details: migrationResults
    };
    
    if (!dryRun) {
      // Save migration summary
      await app.firestore().collection('migrations').add({
        type: 'additive_permissions_migration',
        timestamp: Date.now(),
        summary,
        version: '2.0-additive'
      });
    }
    
    return summary;
    
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
};

/**
 * Check migration status for all users
 */
export const checkAdditiveSystemMigrationStatus = async () => {
  try {
    const usersSnapshot = await app.firestore().collection('users').get();
    const status = {
      totalUsers: usersSnapshot.size,
      migratedUsers: 0,
      needsMigration: 0,
      invalidRoles: 0,
      userDetails: []
    };
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const auth = userData.auth || {};
      const accessLevel = auth.accessLevel;
      const additionalPermissions = auth.additionalPermissions || [];
      const migrationVersion = auth.migrationVersion;
      
      const userDetail = {
        uid: doc.id,
        email: userData.email || 'N/A',
        displayName: userData.displayName || 'N/A',
        accessLevel,
        additionalPermissions,
        migrationVersion,
        isMigrated: migrationVersion === '2.0-additive' || additionalPermissions.length > 0,
        needsMigration: !BASE_ROLES[accessLevel] || (!migrationVersion && additionalPermissions.length === 0)
      };
      
      if (userDetail.isMigrated) {
        status.migratedUsers++;
      } else if (!BASE_ROLES[accessLevel]) {
        status.invalidRoles++;
      } else {
        status.needsMigration++;
      }
      
      status.userDetails.push(userDetail);
    });
    
    return status;
    
  } catch (error) {
    console.error('Error checking migration status:', error);
    throw error;
  }
};

/**
 * Add additional permission to a user
 */
export const addAdditionalPermissionToUser = async (userId, permissionKey) => {
  try {
    const userRef = app.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data();
    const currentRole = userData.auth?.accessLevel;
    const currentAdditionalPerms = userData.auth?.additionalPermissions || [];
    
    // Check if permission is compatible with current role
    const compatiblePermissions = getCompatiblePermissions(currentRole);
    const isCompatible = compatiblePermissions.some(p => p.key === permissionKey);
    
    if (!isCompatible) {
      throw new Error(`Permission ${permissionKey} is not compatible with role ${currentRole}`);
    }
    
    // Check if permission is already added
    if (currentAdditionalPerms.includes(permissionKey)) {
      return {
        status: 'already_exists',
        userId,
        permissionKey
      };
    }
    
    // Add the permission
    const newAdditionalPerms = [...currentAdditionalPerms, permissionKey];
    
    await userRef.update({
      'auth.additionalPermissions': newAdditionalPerms,
      'auth.lastUpdated': Date.now()
    });
    
    // Log the addition
    await app.firestore().collection('auditLogs').add({
      type: 'PERMISSION_ADDED',
      userId,
      permissionKey,
      previousPermissions: currentAdditionalPerms,
      newPermissions: newAdditionalPerms,
      timestamp: Date.now()
    });
    
    return {
      status: 'added',
      userId,
      permissionKey,
      newAdditionalPermissions: newAdditionalPerms
    };
    
  } catch (error) {
    console.error('Error adding additional permission:', error);
    throw error;
  }
};

/**
 * Remove additional permission from a user
 */
export const removeAdditionalPermissionFromUser = async (userId, permissionKey) => {
  try {
    const userRef = app.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data();
    const currentAdditionalPerms = userData.auth?.additionalPermissions || [];
    
    // Check if permission exists
    if (!currentAdditionalPerms.includes(permissionKey)) {
      return {
        status: 'not_found',
        userId,
        permissionKey
      };
    }
    
    // Remove the permission
    const newAdditionalPerms = currentAdditionalPerms.filter(p => p !== permissionKey);
    
    await userRef.update({
      'auth.additionalPermissions': newAdditionalPerms,
      'auth.lastUpdated': Date.now()
    });
    
    // Log the removal
    await app.firestore().collection('auditLogs').add({
      type: 'PERMISSION_REMOVED',
      userId,
      permissionKey,
      previousPermissions: currentAdditionalPerms,
      newPermissions: newAdditionalPerms,
      timestamp: Date.now()
    });
    
    return {
      status: 'removed',
      userId,
      permissionKey,
      newAdditionalPermissions: newAdditionalPerms
    };
    
  } catch (error) {
    console.error('Error removing additional permission:', error);
    throw error;
  }
};

/**
 * Rollback user migration (convert back to enhanced roles if needed)
 */
export const rollbackUserMigration = async (userId) => {
  try {
    const userRef = app.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data();
    const currentRole = userData.auth?.accessLevel;
    const additionalPermissions = userData.auth?.additionalPermissions || [];
    
    // If no additional permissions, no rollback needed
    if (additionalPermissions.length === 0) {
      return {
        status: 'no_rollback_needed',
        userId
      };
    }
    
    // Remove additional permissions (keep base role)
    await userRef.update({
      'auth.additionalPermissions': [],
      'auth.rolledBackAt': Date.now(),
      'auth.lastUpdated': Date.now()
    });
    
    // Log the rollback
    await app.firestore().collection('auditLogs').add({
      type: 'MIGRATION_ROLLBACK',
      userId,
      baseRole: currentRole,
      removedPermissions: additionalPermissions,
      timestamp: Date.now()
    });
    
    return {
      status: 'rolled_back',
      userId,
      baseRole: currentRole,
      removedPermissions: additionalPermissions
    };
    
  } catch (error) {
    console.error('Error rolling back user migration:', error);
    throw error;
  }
};

/**
 * Utility to preview what additional permissions a user would get
 */
export const previewUserPermissions = (baseRole, additionalPermissions = []) => {
  const basePermissions = BASE_ROLES[baseRole]?.permissions || [];
  const effectivePermissions = getEffectivePermissions(baseRole, additionalPermissions);
  const addedPermissions = effectivePermissions.filter(p => !basePermissions.includes(p));
  
  return {
    baseRole,
    basePermissions,
    additionalPermissions,
    addedPermissions,
    effectivePermissions,
    permissionCount: {
      base: basePermissions.length,
      added: addedPermissions.length,
      total: effectivePermissions.length
    }
  };
};

export default {
  migrateUserToAdditiveSystem,
  migrateAllUsersToAdditiveSystem,
  checkAdditiveSystemMigrationStatus,
  addAdditionalPermissionToUser,
  removeAdditionalPermissionFromUser,
  rollbackUserMigration,
  previewUserPermissions
}; 