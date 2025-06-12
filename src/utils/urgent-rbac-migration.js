/**
 * 🚨 URGENT CLEAN SLATE RBAC MIGRATION
 * Fixes users missing Clean Slate access structure
 * Run this to migrate all users to the new RBAC system
 */

import { app } from '../firebase';
import { migrateToOrthogonalSystem } from './orthogonal-rbac';

/**
 * Validate user has minimum required data for migration
 * @param {Object} user - User object to validate
 * @returns {Object} Validation result
 */
const validateUserForMigration = (user) => {
  const errors = [];
  
  // Check essential fields - only require UID
  if (!user.uid) {
    errors.push('Missing uid');
  }
  
  // If user exists in the system (has UID), they should be migrated
  // We'll generate fallback data for everything else
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
};

/**
 * Extract any available identifying information from user data
 * @param {Object} user - User object
 * @returns {Object} Extracted data
 */
const extractUserIdentity = (user) => {
  // Try to find email from various locations
  const email = user.email || 
                user.auth?.email || 
                user.auth?.providerData?.[0]?.email ||
                null;
  
  // Try to find display name from various locations
  const displayName = user.displayName || 
                     user.auth?.displayName ||
                     user.auth?.providerData?.[0]?.displayName ||
                     `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                     null;
  
  // Try to find first/last name from various locations
  const firstName = user.firstName || 
                   user.auth?.firstName ||
                   user.givenName ||
                   null;
  
  const lastName = user.lastName || 
                  user.auth?.lastName ||
                  user.familyName ||
                  null;
  
  return {
    email,
    displayName,
    firstName,
    lastName,
    photoURL: user.photoURL || user.auth?.photoURL || user.auth?.providerData?.[0]?.photoURL || null
  };
};

/**
 * Create Clean Slate user structure with missing data handling
 * @param {Object} user - User object to migrate
 * @returns {Object} Clean Slate user structure
 */
const createCleanSlateStructure = (user) => {
  // Extract any available identity data
  const identity = extractUserIdentity(user);
  
  // Generate fallback data for missing fields
  const uidShort = user.uid.slice(0, 8);
  const fallbackEmail = identity.email || `user-${user.uid}@kbn-system.local`;
  const fallbackDisplayName = identity.displayName || 
                             `${identity.firstName || 'User'} ${identity.lastName || uidShort}`.trim();
  
  // Migrate to Clean Slate structure using existing function
  const cleanSlateUser = migrateToOrthogonalSystem(user);
  
  if (!cleanSlateUser || !cleanSlateUser.access) {
    throw new Error('Migration failed - no access structure created');
  }
  
  // Create clean document with ONLY Clean Slate structure and essential data
  const cleanDocument = {
    // Essential user data with fallbacks
    uid: user.uid,
    email: fallbackEmail,
    displayName: fallbackDisplayName,
    firstName: identity.firstName || '',
    lastName: identity.lastName || '',
    photoURL: identity.photoURL,
    
    // Clean Slate RBAC structure (ONLY structure)
    access: cleanSlateUser.access,
    
    // Status and metadata
    isActive: user.isActive !== false,
    isApproved: user.isApproved !== false,
    isDev: user.isDev || false,
    
    // Essential metadata
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    migratedAt: new Date().toISOString(),
    
    // Migration notes for incomplete data
    migrationNotes: {
      hasOriginalEmail: !!identity.email,
      hasOriginalDisplayName: !!identity.displayName,
      hasOriginalFirstName: !!identity.firstName,
      hasOriginalLastName: !!identity.lastName,
      generatedFallbacks: {
        email: !identity.email,
        displayName: !identity.displayName,
        firstName: !identity.firstName,
        lastName: !identity.lastName
      },
      migrationSource: 'urgent-rbac-migration',
      originalDataPreserved: false // We're doing a clean slate replacement
    }
  };
  
  return cleanDocument;
};

/**
 * Execute urgent Clean Slate migration for all users
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} Migration results
 */
export const executeUrgentCleanSlateMigration = async (options = {}) => {
  const { dryRun = false, logProgress = true } = options;
  
  console.log('🚨 URGENT CLEAN SLATE RBAC MIGRATION STARTING...');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no data changes)' : '🔴 LIVE MIGRATION'}`);
  console.log('Note: All users with UIDs will be migrated with generated fallback data');
  console.log('');
  
  const results = {
    totalUsers: 0,
    migrated: 0,
    alreadyCleanSlate: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    warnings: []
  };
  
  try {
    // Get all users from Firestore
    const usersSnapshot = await app.firestore().collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    results.totalUsers = users.length;
    console.log(`📊 Found ${users.length} users to check for migration`);
    console.log('');
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      if (logProgress && i % 10 === 0) {
        console.log(`Progress: ${i}/${users.length} users processed`);
      }
      
      try {
        // Check if user already has Clean Slate structure
        if (user.access && user.access.authority) {
          if (logProgress) {
            console.log(`✅ ${user.displayName || user.email || `User-${user.uid.slice(0,8)}`} - Already Clean Slate`);
          }
          results.alreadyCleanSlate++;
          continue;
        }
        
        // Validate user has minimum required data (just UID)
        const validation = validateUserForMigration(user);
        if (!validation.isValid) {
          console.log(`⚠️ Skipping ${user.uid}: ${validation.errors.join(', ')}`);
          results.skipped++;
          results.warnings.push({
            userId: user.uid,
            displayName: `User-${user.uid.slice(0,8)}`,
            reason: `Skipped: ${validation.errors.join(', ')}`
          });
          continue;
        }
        
        // User needs migration - extract identity
        const identity = extractUserIdentity(user);
        const displayName = identity.displayName || `User-${user.uid.slice(0,8)}`;
        
        console.log(`🔄 Migrating: ${displayName} (${user.uid})`);
        
        // Create Clean Slate structure with fallback handling
        const cleanDocument = createCleanSlateStructure(user);
        
        // Track what data was generated vs original
        const generatedFields = [];
        if (!identity.email) generatedFields.push('email');
        if (!identity.displayName) generatedFields.push('displayName');
        if (!identity.firstName) generatedFields.push('firstName');
        if (!identity.lastName) generatedFields.push('lastName');
        
        if (generatedFields.length > 0) {
          results.warnings.push({
            userId: user.uid,
            displayName: cleanDocument.displayName,
            reason: `Generated fallback data for: ${generatedFields.join(', ')}`
          });
        }
        
        if (!dryRun) {
          // Update user in Firestore with Clean Slate structure
          await app.firestore()
            .collection('users')
            .doc(user.uid)
            .set(cleanDocument, { merge: false }); // Complete replacement
        }
        
        console.log(`✅ Successfully migrated: ${cleanDocument.displayName}`);
        if (generatedFields.length > 0) {
          console.log(`   📝 Generated: ${generatedFields.join(', ')}`);
        }
        results.migrated++;
        
      } catch (error) {
        const displayName = user.displayName || user.email || `User-${user.uid.slice(0,8)}`;
        console.error(`❌ Failed to migrate ${displayName}:`, error.message);
        results.failed++;
        results.errors.push({
          userId: user.uid,
          displayName: displayName,
          error: error.message
        });
      }
    }
    
    console.log('');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total Users: ${results.totalUsers}`);
    console.log(`✅ Successfully Migrated: ${results.migrated}`);
    console.log(`📌 Already Clean Slate: ${results.alreadyCleanSlate}`);
    console.log(`⚠️ Skipped (invalid): ${results.skipped}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.warnings.length > 0) {
      console.log('');
      console.log('📝 Migration Notes:');
      const fallbackCount = results.warnings.filter(w => w.reason.includes('Generated fallback')).length;
      console.log(`${fallbackCount} users migrated with generated fallback data`);
      
      if (logProgress && results.warnings.length <= 20) {
        results.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning.displayName}: ${warning.reason}`);
        });
      }
    }
    
    if (results.errors.length > 0) {
      console.log('');
      console.log('❌ Migration Errors:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.displayName}: ${error.error}`);
      });
    }
    
    if (!dryRun && results.migrated > 0) {
      console.log('');
      console.log('🔄 Please refresh your browser to apply the changes!');
    }
    
  } catch (error) {
    console.error('💥 Migration failed with error:', error);
    results.errors.push({ general: error.message });
  }
  
  return results;
};

/**
 * Quick migration function for immediate use
 */
export const migrateCurrentUser = async (user) => {
  if (!user) {
    console.error('❌ No user provided for migration');
    return null;
  }
  
  // Check if already Clean Slate
  if (user.access && user.access.authority) {
    console.log('✅ User already in Clean Slate format');
    return user;
  }
  
  console.log('🔄 Migrating current user to Clean Slate...');
  
  try {
    // Validate user
    const validation = validateUserForMigration(user);
    if (!validation.isValid) {
      throw new Error(`User validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Create Clean Slate structure
    const cleanDocument = createCleanSlateStructure(user);
    
    console.log('✅ Current user migrated successfully');
    return cleanDocument;
    
  } catch (error) {
    console.error('❌ Failed to migrate current user:', error.message);
    return null;
  }
};

// Browser console function for immediate execution
if (typeof window !== 'undefined') {
  window.URGENT_MIGRATE_RBAC = () => {
    console.log('🚨 Executing URGENT Clean Slate RBAC Migration...');
    return executeUrgentCleanSlateMigration({ dryRun: false, logProgress: true });
  };
  
  window.TEST_MIGRATE_RBAC = () => {
    console.log('🧪 Testing Clean Slate RBAC Migration (Dry Run)...');
    return executeUrgentCleanSlateMigration({ dryRun: true, logProgress: true });
  };
  
  // Add debug function
  window.DEBUG_USER_DATA = (sampleSize = 20) => {
    console.log('🔍 Starting user data analysis...');
    import('./debug-user-data').then(module => {
      return module.debugUserData({ sampleSize });
    });
  };
}

export default {
  executeUrgentCleanSlateMigration,
  migrateCurrentUser
}; 