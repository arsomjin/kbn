/**
 * 🧹 CLEANUP INVALID USERS
 * Utility to clean up user records that are completely invalid and can't be migrated
 */

import { app } from '../firebase';

/**
 * Find and optionally delete completely invalid user records
 * @param {Object} options - Cleanup options
 * @returns {Promise<Object>} Cleanup results
 */
export const cleanupInvalidUsers = async (options = {}) => {
  const { dryRun = true, deleteInvalid = false } = options;
  
  console.log('🧹 CLEANUP INVALID USERS STARTING...');
  console.log('='.repeat(50));
  console.log(`Mode: ${dryRun ? 'DRY RUN (analysis only)' : '🔴 LIVE CLEANUP'}`);
  console.log('');
  
  const results = {
    totalUsers: 0,
    valid: 0,
    invalid: 0,
    deleted: 0,
    invalidUsers: [],
    errors: []
  };
  
  try {
    // Get all users from Firestore
    const usersSnapshot = await app.firestore().collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    results.totalUsers = users.length;
    console.log(`📊 Analyzing ${users.length} users...`);
    console.log('');
    
    for (const user of users) {
      // Check if user is completely invalid
      const isCompletelyInvalid = (
        !user.uid || 
        (!user.email && !user.displayName && !user.firstName && !user.lastName)
      );
      
      if (isCompletelyInvalid) {
        console.log(`❌ INVALID: ${user.uid} - No identifying information`);
        results.invalid++;
        results.invalidUsers.push({
          uid: user.uid,
          reason: 'No identifying information (email, displayName, firstName, lastName)',
          data: user
        });
        
        if (!dryRun && deleteInvalid) {
          try {
            await app.firestore().collection('users').doc(user.uid).delete();
            console.log(`🗑️ DELETED: ${user.uid}`);
            results.deleted++;
          } catch (error) {
            console.error(`❌ Failed to delete ${user.uid}:`, error.message);
            results.errors.push({
              uid: user.uid,
              error: error.message
            });
          }
        }
      } else {
        results.valid++;
      }
    }
    
    console.log('');
    console.log('🎉 CLEANUP ANALYSIS COMPLETE!');
    console.log('='.repeat(50));
    console.log(`📊 Total Users: ${results.totalUsers}`);
    console.log(`✅ Valid Users: ${results.valid}`);
    console.log(`❌ Invalid Users: ${results.invalid}`);
    
    if (!dryRun && deleteInvalid) {
      console.log(`🗑️ Deleted: ${results.deleted}`);
    }
    
    if (results.invalid > 0) {
      console.log('');
      console.log('❌ Invalid Users Found:');
      results.invalidUsers.forEach((invalid, index) => {
        console.log(`  ${index + 1}. ${invalid.uid}: ${invalid.reason}`);
      });
      
      if (dryRun) {
        console.log('');
        console.log('💡 To delete invalid users, run:');
        console.log('   cleanupInvalidUsers({ dryRun: false, deleteInvalid: true })');
      }
    }
    
  } catch (error) {
    console.error('💥 Cleanup failed with error:', error);
    results.errors.push({ general: error.message });
  }
  
  return results;
};

// Browser console function
if (typeof window !== 'undefined') {
  window.CLEANUP_INVALID_USERS = (deleteMode = false) => {
    console.log('🧹 Starting invalid user cleanup...');
    return cleanupInvalidUsers({ 
      dryRun: !deleteMode, 
      deleteInvalid: deleteMode 
    });
  };
}

export default cleanupInvalidUsers; 