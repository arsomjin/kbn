#!/usr/bin/env node

/**
 * KBN Clean Slate RBAC Migration - Production Execution
 * Safely migrate real users to orthogonal RBAC system
 */

const fs = require('fs');
const path = require('path');

// Import Firebase Node.js setup and migration utilities
const { firestore } = require('./firebase-node');
const { migrateToOrthogonalSystem, generateUserPermissions } = require('./orthogonal-rbac');

/**
 * Execute the clean slate migration on real Firebase data
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} Migration results
 */
const executeCleanSlateMigration = async (options = {}) => {
  const {
    dryRun = false,
    batchSize = 10,
    logProgress = true
  } = options;
  
  console.log('🚀 Starting Clean Slate RBAC Migration');
  console.log('=====================================');
  
  if (dryRun) {
    console.log('🧪 DRY RUN MODE - No actual changes will be made\n');
  } else {
    console.log('🔴 LIVE MIGRATION MODE - Real changes will be made\n');
  }
  
  const results = {
    totalUsers: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    startTime: Date.now(),
    endTime: null
  };
  
  try {
    // Test user conversion first
    await testUserConversion();
    
    // Fetch all users from Firebase
    console.log('📊 Fetching all users from Firebase...');
    const usersSnapshot = await firestore.collection('users').get();
    
    if (usersSnapshot.empty) {
      throw new Error('No users found in Firebase collection');
    }
    
    console.log('📋 Getting users...');
    const allUsers = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const user = {
        uid: doc.id,
        ...userData.auth, // Firebase auth data
        ...userData, // Additional user data
        _key: doc.id
      };
      
      // Remove redundant auth object
      delete user.auth;
      
      allUsers.push(user);
    });
    
    results.totalUsers = allUsers.length;
    console.log(`Found ${allUsers.length} users to migrate`);
    
    // Process users in batches
    const batches = [];
    for (let i = 0; i < allUsers.length; i += batchSize) {
      batches.push(allUsers.slice(i, i + batchSize));
    }
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}...`);
      
      for (const user of batch) {
        try {
          results.processed++;
          
          // Skip users who already have the new access structure
          if (user.access && user.migratedAt) {
            console.log(`⏭️  Skipping already migrated user: ${user.uid}`);
            results.skipped++;
            continue;
          }
          
          // Convert to orthogonal system
          const migratedUser = migrateToOrthogonalSystem(user);
          
          if (!migratedUser || !migratedUser.access) {
            throw new Error('Migration conversion failed');
          }
          
          // Add migration metadata
          migratedUser.migratedAt = new Date().toISOString();
          migratedUser.migrationVersion = '1.0.0';
          migratedUser.updatedAt = new Date().toISOString();
          
          if (!dryRun) {
            // Update user in Firebase
            console.log(`💾 Updating user: ${migratedUser.displayName || migratedUser.email || migratedUser.uid}`);
            
            const userRef = firestore.collection('users').doc(user.uid);
            await userRef.update({
              access: migratedUser.access,
              migratedAt: migratedUser.migratedAt,
              migrationVersion: migratedUser.migrationVersion,
              updatedAt: migratedUser.updatedAt,
              legacyRole: migratedUser.legacyRole
            });
          } else {
            console.log(`🧪 Would migrate user: ${migratedUser.displayName || migratedUser.email || migratedUser.uid}`);
          }
          
          results.successful++;
          
        } catch (error) {
          console.error(`❌ Failed to migrate user ${user.uid}:`, error.message);
          results.failed++;
          results.errors.push({
            userId: user.uid,
            email: user.email,
            error: error.message
          });
        }
      }
    }
    
    results.endTime = Date.now();
    const duration = ((results.endTime - results.startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Migration Complete!');
    console.log('📊 Summary:');
    console.log(`  Total users: ${results.totalUsers}`);
    console.log(`  Successful: ${results.successful}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Skipped: ${results.skipped}`);
    console.log(`  Success rate: ${((results.successful / results.totalUsers) * 100).toFixed(1)}%`);
    console.log(`  Duration: ${duration}s`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(error => {
        console.log(`  - ${error.userId} (${error.email}): ${error.error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    results.endTime = Date.now();
    results.errors.push({ general: error.message });
    throw error;
  }
};

/**
 * Test user conversion with a sample user
 * @returns {Promise<Object>} Test result
 */
const testUserConversion = async () => {
  console.log('🔍 Testing user conversion...');
  
  // Fetch a real user for testing
  const usersSnapshot = await firestore.collection('users').limit(1).get();
  
  if (usersSnapshot.empty) {
    throw new Error('No users available for testing');
  }
  
  let testUser = null;
  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    testUser = {
      uid: doc.id,
      ...userData.auth,
      ...userData,
      _key: doc.id
    };
    delete testUser.auth;
  });
  
  if (!testUser) {
    throw new Error('Could not create test user');
  }
  
  console.log(`🧪 Testing migration on user: ${testUser.uid}`);
  console.log('Original user:', {
    uid: testUser.uid,
    email: testUser.email,
    displayName: testUser.displayName,
    accessLevel: testUser.accessLevel,
    permissions: testUser.permissions,
    allowedProvinces: testUser.allowedProvinces,
    allowedBranches: testUser.allowedBranches
  });
  
  // Test conversion
  const convertedUser = migrateToOrthogonalSystem(testUser);
  convertedUser.migratedAt = new Date().toISOString();
  
  console.log('Converted user:', {
    uid: convertedUser.uid,
    access: convertedUser.access,
    migratedAt: convertedUser.migratedAt
  });
  
  // Test permission generation
  const userPermissions = generateUserPermissions(convertedUser);
  console.log('Validation result:', !!userPermissions && userPermissions.permissions.length > 0);
  
  const testResult = {
    success: true,
    original: testUser,
    converted: convertedUser,
    isValid: !!userPermissions && userPermissions.permissions.length > 0
  };
  
  console.log('✅ Test result:', JSON.stringify(testResult, null, 2));
  
  return testResult;
};

/**
 * Verify migration results
 * @returns {Promise<Object>} Verification results
 */
const verifyMigrationResults = async () => {
  console.log('🔍 Verifying migration results...');
  
  const usersSnapshot = await firestore.collection('users').get();
  let totalUsers = 0;
  let migratedUsers = 0;
  let validMigrations = 0;
  
  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    totalUsers++;
    
    if (userData.access && userData.migratedAt) {
      migratedUsers++;
      
      // Check if migration is valid
      if (userData.access.authority && userData.access.geographic && userData.access.departments) {
        validMigrations++;
      }
    }
  });
  
  const results = {
    totalUsers,
    migratedUsers,
    validMigrations,
    migrationRate: ((migratedUsers / totalUsers) * 100).toFixed(1),
    validityRate: migratedUsers > 0 ? ((validMigrations / migratedUsers) * 100).toFixed(1) : 0
  };
  
  console.log('📊 Migration verification:');
  console.log(`  Total users: ${results.totalUsers}`);
  console.log(`  Migrated users: ${results.migratedUsers}`);
  console.log(`  Valid migrations: ${results.validMigrations}`);
  console.log(`  Migration rate: ${results.migrationRate}%`);
  console.log(`  Validity rate: ${results.validityRate}%`);
  
  return results;
};

/**
 * Save migration report
 * @param {Object} results - Migration results
 * @returns {string} Report file path
 */
const saveMigrationReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(__dirname, '../../reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `migration-report-${timestamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  
  console.log(`📁 Migration report saved: ${reportFile}`);
  return reportFile;
};

module.exports = {
  executeCleanSlateMigration,
  testUserConversion,
  verifyMigrationResults,
  saveMigrationReport
};

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      const args = process.argv.slice(2);
      const isDryRun = args.includes('--dry-run');
      
      if (isDryRun) {
        console.log('🧪 Running in DRY RUN mode');
      }
      
      // Execute migration
      const results = await executeCleanSlateMigration({
        dryRun: isDryRun,
        batchSize: 5,
        logProgress: true
      });
      
      // Save report
      saveMigrationReport(results);
      
      if (!isDryRun) {
        // Verify results
        await verifyMigrationResults();
      }
      
      console.log('\n🎉 Migration completed successfully!');
      console.log('📊 Migration Summary:');
      console.log(`   ✅ Successful: ${results.successful}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      console.log(`   ⏭️  Skipped: ${results.skipped}`);
      console.log(`   ⏱️  Duration: ${((results.endTime - results.startTime) / 1000).toFixed(2)}s`);
      
      if (results.failed > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Migration execution failed:', error.message);
      process.exit(1);
    }
  })();
} 