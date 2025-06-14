#!/usr/bin/env node

/**
 * 🧹 COMPREHENSIVE CLEANUP SCRIPT
 *
 * Removes all temporary files created during Firebase index migration and troubleshooting.
 * This will clean up the project directory and keep only essential files.
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 STARTING COMPREHENSIVE CLEANUP...\n');

// Files to delete (temporary scripts and backups)
const filesToDelete = [
  // Notification index fix scripts
  'create-notification-indexes-manually.js',
  'fix-missing-name-field.js',
  'fix-notification-indexes.js',
  'deploy-notification-indexes.sh',

  // Firebase index migration scripts
  'sync-live-firebase-indexes.js',
  'sync-firebase-indexes.js',
  'analyze-index-migration.js',
  'analyze-index-differences.js',
  'create-merged-indexes.js',
  'optimize-firebase-indexes.js',
  'generate-provinceid-indexes.js',
  'deploy-test-indexes.sh',

  // Backup and temporary JSON files
  'firestore.indexes.backup-1749911710689.json',
  'firestore.indexes.optimized.json',
  'firestore.indexes.pre-optimization.json',
  'firestore.indexes.merged.json',
  'firestore.indexes.backup.json',
  'firestore.indexes.json.pre-provinceid-backup',
  'firestore.indexes.json.backup',
  'firestore.indexes.live.json',
  'live-firebase-indexes.json',

  // Testing and notification scripts
  'test-user-notifications.js',
  'verify-deployment.js',

  // Temporary markdown files
  'FIRESTORE_INDEX_MIGRATION_STRATEGY.md',
  'NOTIFICATION_SYSTEM_FIX_SUMMARY.md',
  'USER_NOTIFICATION_SYSTEM_IMPLEMENTATION.md',
  'DUPLICATE_MENU_KEYS_FIXES.md',
  'MOBILE_NAVIGATION_LAYER_FIXES_UPDATED.md',
  'MOBILE_NAVIGATION_LAYER_FIXES.md',
  'TOMORROW_TESTING_SUMMARY.md',
  'LIVE_DEPLOYMENT_TESTING_CHECKLIST.md',
  'LIVE_DEPLOYMENT_TESTING_STRATEGY.md',
  'CLOUD_FUNCTIONS_SAFETY_IMPLEMENTATION.md',
  'LIVE_DEPLOYMENT_GUIDE.md',
  'SUPER_ADMIN_SETUP_GUIDE.md',

  // Backup rules
  'firestore.rules.backup',
];

// Keep track of cleanup results
let deletedCount = 0;
let notFoundCount = 0;
let errorCount = 0;

console.log('📋 FILES TO DELETE:');
filesToDelete.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log(`\n🎯 Total files to clean: ${filesToDelete.length}\n`);

// Delete each file
filesToDelete.forEach((file) => {
  const filePath = path.join(__dirname, file);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`⚠️  Not found: ${file}`);
      notFoundCount++;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${file}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n📊 CLEANUP SUMMARY:');
console.log(`   ✅ Successfully deleted: ${deletedCount} files`);
console.log(`   ⚠️  Files not found: ${notFoundCount} files`);
console.log(`   ❌ Errors encountered: ${errorCount} files`);

// Clean up this cleanup script itself
console.log('\n🔄 SELF-CLEANUP:');
try {
  setTimeout(() => {
    fs.unlinkSync(__filename);
    console.log('✅ Cleanup script deleted itself');
  }, 1000);
} catch (error) {
  console.log('⚠️  Could not delete cleanup script');
}

console.log('\n🎉 CLEANUP COMPLETE!');
console.log('\n📁 REMAINING ESSENTIAL FILES:');
console.log('   ✅ firestore.indexes.json (current active indexes)');
console.log('   ✅ firestore.rules (current security rules)');
console.log('   ✅ src/ directory (application code)');
console.log('   ✅ docs/ directory (documentation)');
console.log('   ✅ package.json (dependencies)');
console.log('   ✅ firebase.json (Firebase configuration)');

console.log('\n🚀 PROJECT IS NOW CLEAN AND READY FOR PRODUCTION!');
