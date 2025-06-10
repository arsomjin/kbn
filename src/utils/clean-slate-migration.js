/**
 * Clean Slate RBAC Migration Script
 * Converts ALL users from legacy system to orthogonal system
 * REMOVES all legacy fields - no backward compatibility
 */

import { 
  migrateToOrthogonalSystem,
  createUserAccess,
  AUTHORITY_LEVELS,
  GEOGRAPHIC_SCOPE,
  DEPARTMENTS
} from './orthogonal-rbac';

/**
 * Determine authority level from legacy access level
 * @param {string} legacyAccessLevel - Legacy access level
 * @param {boolean} isDev - Is developer
 * @returns {string} New authority level
 */
const determineAuthority = (legacyAccessLevel, isDev = false) => {
  if (isDev) return 'ADMIN';
  
  const accessLevel = (legacyAccessLevel || '').toUpperCase();
  
  if (accessLevel === 'SUPER_ADMIN') return 'ADMIN';
  if (accessLevel === 'EXECUTIVE') return 'ADMIN';
  if (accessLevel.includes('MANAGER')) return 'MANAGER';
  if (accessLevel.includes('LEAD')) return 'LEAD';
  
  return 'STAFF';
};

/**
 * Determine geographic scope from legacy data
 * @param {Array} allowedProvinces - Legacy allowed provinces
 * @param {Array} allowedBranches - Legacy allowed branches  
 * @param {string} authority - Authority level
 * @returns {string} Geographic scope
 */
const determineGeographic = (allowedProvinces = [], allowedBranches = [], authority) => {
  // Admin authority = ALL access by default
  if (authority === 'ADMIN') return 'ALL';
  
  // Multiple provinces = ALL or PROVINCE level
  if (allowedProvinces && allowedProvinces.length > 1) return 'ALL';
  
  // Multiple branches across provinces = PROVINCE level
  if (allowedBranches && allowedBranches.length > 1) {
    // Check if branches are in same province (simplified)
    const uniquePrefixes = new Set(allowedBranches.map(b => b.substring(0, 3)));
    if (uniquePrefixes.size > 1) return 'ALL';
    return 'PROVINCE';
  }
  
  // Single or few branches = BRANCH level
  return 'BRANCH';
};

/**
 * Determine departments from legacy data
 * @param {Object} legacyPermissions - Legacy permissions object
 * @param {string} legacyAccessLevel - Legacy access level
 * @returns {Array} Department array
 */
const determineDepartments = (legacyPermissions = {}, legacyAccessLevel = '') => {
  const accessLevel = legacyAccessLevel.toUpperCase();
  const permissions = legacyPermissions;
  
  // Based on access level name
  if (accessLevel.includes('ACCOUNTING')) return ['ACCOUNTING'];
  if (accessLevel.includes('SALES')) return ['SALES'];
  if (accessLevel.includes('SERVICE')) return ['SERVICE'];
  if (accessLevel.includes('INVENTORY')) return ['INVENTORY'];
  if (accessLevel.includes('HR')) return ['HR'];
  
  // Based on permission object structure
  const depts = [];
  if (permissions?.accounting) depts.push('ACCOUNTING');
  if (permissions?.sales) depts.push('SALES');
  if (permissions?.service) depts.push('SERVICE');
  if (permissions?.inventory) depts.push('INVENTORY');
  if (permissions?.hr) depts.push('HR');
  
  // Manager/Admin roles get access to multiple departments
  if (accessLevel.includes('MANAGER') || accessLevel.includes('ADMIN')) {
    return ['ACCOUNTING', 'SALES', 'SERVICE', 'INVENTORY'];
  }
  
  return depts.length > 0 ? depts : ['GENERAL'];
};

/**
 * Convert single legacy user to new orthogonal system
 * @param {Object} legacyUser - Legacy user object
 * @returns {Object} New user object with orthogonal access
 */
export const convertLegacyUser = (legacyUser) => {
  if (!legacyUser) return null;
  
  const authority = determineAuthority(legacyUser.accessLevel, legacyUser.isDev);
  const geographic = determineGeographic(
    legacyUser.allowedProvinces, 
    legacyUser.allowedBranches,
    authority
  );
  const departments = determineDepartments(
    legacyUser.permissions,
    legacyUser.accessLevel
  );
  
  // Create new user structure - REMOVE all legacy fields
  const newUser = {
    // Keep essential user data
    uid: legacyUser.uid,
    email: legacyUser.email,
    displayName: legacyUser.displayName || legacyUser.email,
    photoURL: legacyUser.photoURL,
    createdAt: legacyUser.createdAt,
    updatedAt: new Date().toISOString(),
    isActive: legacyUser.isActive !== false, // Default to true
    
    // NEW: Orthogonal access control
    access: createUserAccess(
      authority,
      geographic,
      departments,
      {
        provinces: legacyUser.allowedProvinces || [],
        branches: legacyUser.allowedBranches || [],
        homeBranch: legacyUser.homeBranch
      }
    ),
    
    // Keep developer flag if exists
    ...(legacyUser.isDev && { isDev: true }),
    
    // Migration metadata
    migratedAt: new Date().toISOString(),
    migrationVersion: '1.0.0',
    legacyRole: legacyUser.accessLevel // For debugging only
    
    // DELETED FIELDS - No longer exist:
    // accessLevel: REMOVED
    // permissions: REMOVED  
    // allowedProvinces: REMOVED
    // allowedBranches: REMOVED
    // auth: REMOVED (if it exists)
    // rbac: REMOVED (if it exists)
  };
  
  return newUser;
};

/**
 * Validate converted user has all required fields
 * @param {Object} convertedUser - Converted user object
 * @returns {boolean} Is valid
 */
export const validateConvertedUser = (convertedUser) => {
  if (!convertedUser) return false;
  
  const required = ['uid', 'email', 'access'];
  const hasRequired = required.every(field => convertedUser[field]);
  
  if (!hasRequired) {
    console.error('Missing required fields:', required.filter(f => !convertedUser[f]));
    return false;
  }
  
  const access = convertedUser.access;
  const accessRequired = ['authority', 'geographic', 'departments'];
  const hasAccessRequired = accessRequired.every(field => access[field]);
  
  if (!hasAccessRequired) {
    console.error('Missing access fields:', accessRequired.filter(f => !access[f]));
    return false;
  }
  
  // Validate enum values
  if (!AUTHORITY_LEVELS[access.authority]) {
    console.error('Invalid authority level:', access.authority);
    return false;
  }
  
  if (!GEOGRAPHIC_SCOPE[access.geographic]) {
    console.error('Invalid geographic scope:', access.geographic);
    return false;
  }
  
  const validDepartments = Object.keys(DEPARTMENTS);
  const invalidDepts = access.departments.filter(d => !validDepartments.includes(d));
  if (invalidDepts.length > 0) {
    console.error('Invalid departments:', invalidDepts);
    return false;
  }
  
  return true;
};

/**
 * Migration statistics tracker
 */
class MigrationStats {
  constructor() {
    this.total = 0;
    this.successful = 0;
    this.failed = 0;
    this.skipped = 0;
    this.errors = [];
    this.startTime = Date.now();
  }
  
  addSuccess() {
    this.successful++;
  }
  
  addFailure(error, user) {
    this.failed++;
    this.errors.push({
      user: user?.uid || 'unknown',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  addSkipped() {
    this.skipped++;
  }
  
  getSummary() {
    const duration = Date.now() - this.startTime;
    return {
      total: this.total,
      successful: this.successful,
      failed: this.failed,
      skipped: this.skipped,
      duration: `${(duration / 1000).toFixed(2)}s`,
      successRate: `${((this.successful / this.total) * 100).toFixed(1)}%`,
      errors: this.errors
    };
  }
}

/**
 * Execute complete clean slate migration
 * @param {Function} getUsersFunction - Function to get all users
 * @param {Function} updateUserFunction - Function to update user
 * @param {Object} options - Migration options
 * @returns {Object} Migration results
 */
export const executeCleanSlateMigration = async (
  getUsersFunction,
  updateUserFunction,
  options = {}
) => {
  const {
    dryRun = false,
    batchSize = 50,
    logProgress = true
  } = options;
  
  const stats = new MigrationStats();
  
  console.log('🚀 Starting Clean Slate RBAC Migration...');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no data changes)' : 'LIVE MIGRATION'}`);
  
  try {
    // Get all users
    console.log('📊 Fetching all users...');
    const allUsers = await getUsersFunction();
    stats.total = allUsers.length;
    
    console.log(`Found ${stats.total} users to migrate`);
    
    // Process users in batches
    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);
      
      if (logProgress) {
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allUsers.length / batchSize)}...`);
      }
      
      const batchPromises = batch.map(async (user) => {
        try {
          // Skip already migrated users
          if (user.access && user.migratedAt) {
            stats.addSkipped();
            return;
          }
          
          // Convert user
          const convertedUser = convertLegacyUser(user);
          
          if (!convertedUser) {
            throw new Error('Conversion failed - null result');
          }
          
          // Validate converted user
          if (!validateConvertedUser(convertedUser)) {
            throw new Error('Validation failed');
          }
          
          // Update user (unless dry run)
          if (!dryRun) {
            await updateUserFunction(user.uid, convertedUser);
          }
          
          stats.addSuccess();
          
          if (logProgress && stats.successful % 10 === 0) {
            console.log(`✅ Migrated ${stats.successful} users...`);
          }
          
        } catch (error) {
          console.error(`❌ Failed to migrate user ${user.uid}:`, error.message);
          stats.addFailure(error, user);
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    // Migration complete
    const summary = stats.getSummary();
    
    console.log('\n🎉 Migration Complete!');
    console.log('📊 Summary:');
    console.log(`  Total users: ${summary.total}`);
    console.log(`  Successful: ${summary.successful}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Skipped: ${summary.skipped}`);
    console.log(`  Success rate: ${summary.successRate}`);
    console.log(`  Duration: ${summary.duration}`);
    
    if (summary.errors.length > 0) {
      console.log('\n❌ Errors:');
      summary.errors.forEach(error => {
        console.log(`  ${error.user}: ${error.error}`);
      });
    }
    
    return {
      success: summary.failed === 0,
      stats: summary
    };
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    return {
      success: false,
      error: error.message,
      stats: stats.getSummary()
    };
  }
};

/**
 * Rollback migration (restore from backup)
 * @param {Function} restoreFromBackupFunction - Function to restore users from backup
 * @returns {Object} Rollback results
 */
export const rollbackMigration = async (restoreFromBackupFunction) => {
  console.log('🔄 Rolling back migration...');
  
  try {
    const result = await restoreFromBackupFunction();
    console.log('✅ Rollback successful');
    return { success: true, result };
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test migration on a single user (for debugging)
 * @param {Object} testUser - User to test migration on
 * @returns {Object} Test results
 */
export const testMigrationOnUser = (testUser) => {
  console.log('🧪 Testing migration on user:', testUser.uid);
  
  try {
    const converted = convertLegacyUser(testUser);
    const isValid = validateConvertedUser(converted);
    
    console.log('Original user:', {
      uid: testUser.uid,
      accessLevel: testUser.accessLevel,
      permissions: testUser.permissions,
      allowedProvinces: testUser.allowedProvinces,
      allowedBranches: testUser.allowedBranches
    });
    
    console.log('Converted user:', {
      uid: converted.uid,
      access: converted.access,
      migratedAt: converted.migratedAt
    });
    
    console.log('Validation result:', isValid);
    
    return {
      success: isValid,
      original: testUser,
      converted,
      isValid
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  convertLegacyUser,
  validateConvertedUser,
  executeCleanSlateMigration,
  rollbackMigration,
  testMigrationOnUser
}; 