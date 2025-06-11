/**
 * KBN User Data Backup Utility
 * Creates comprehensive backup before clean slate migration
 */

const fs = require('fs');
const path = require('path');

// Import Firebase Node.js setup
const { firestore } = require('./firebase-node');

/**
 * Create comprehensive backup of user data from Firebase
 * @returns {Promise<string>} Backup file path
 */
const createUserBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups');
  const backupFile = path.join(backupDir, `user-backup-${timestamp}.json`);
  
  console.log('🔄 Creating user data backup from Firebase...');
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // Fetch real users from Firebase
    console.log('📡 Connecting to Firebase users collection...');
    const usersSnapshot = await firestore.collection('users').get();
    
    if (usersSnapshot.empty) {
      throw new Error('No users found in Firebase collection');
    }
    
    const currentUsers = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      // Structure the user data as stored in Firebase
      const user = {
        uid: doc.id,
        ...userData.auth, // Firebase auth data
        ...userData, // Additional user data
        _key: doc.id
      };
      
      // Remove redundant auth object
      delete user.auth;
      
      currentUsers.push(user);
    });
    
    console.log(`📊 Found ${currentUsers.length} users in Firebase`);
    
    // Also backup user groups for complete context
    console.log('📡 Fetching user groups...');
    const userGroupsSnapshot = await firestore
      .collection('data')
      .doc('company')
      .collection('userGroups')
      .get();
    
    const userGroups = {};
    userGroupsSnapshot.forEach(doc => {
      userGroups[doc.id] = {
        ...doc.data(),
        _key: doc.id
      };
    });
    
    // Also backup permissions for complete context
    console.log('📡 Fetching permissions...');
    const permissionsSnapshot = await firestore
      .collection('data')
      .doc('company')
      .collection('permissions')
      .get();
    
    const permissions = {};
    permissionsSnapshot.forEach(doc => {
      permissions[doc.id] = {
        ...doc.data(),
        _key: doc.id
      };
    });
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      description: 'Pre-migration user data backup from Firebase',
      totalUsers: currentUsers.length,
      activeUsers: currentUsers.filter(u => u.isActive !== false).length,
      users: currentUsers,
      userGroups: userGroups,
      permissions: permissions,
      metadata: {
        backupReason: 'Clean slate RBAC migration',
        systemVersion: '1.4.3',
        migrationVersion: '1.0.0',
        firebaseProject: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'unknown'
      }
    };
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Backed up ${currentUsers.length} users from Firebase`);
    console.log(`📋 Included ${Object.keys(userGroups).length} user groups`);
    console.log(`🔐 Included ${Object.keys(permissions).length} permissions`);
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Firebase backup failed:', error.message);
    throw error;
  }
};

/**
 * Verify backup integrity
 * @param {string} backupFile - Path to backup file
 * @returns {boolean} Backup is valid
 */
const verifyBackup = (backupFile) => {
  try {
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    const requiredFields = ['timestamp', 'version', 'users', 'totalUsers'];
    const hasAllFields = requiredFields.every(field => backup[field] !== undefined);
    
    const hasUsers = Array.isArray(backup.users) && backup.users.length > 0;
    const userCountMatches = backup.users.length === backup.totalUsers;
    const hasUserGroups = backup.userGroups && typeof backup.userGroups === 'object';
    const hasPermissions = backup.permissions && typeof backup.permissions === 'object';
    
    console.log(`🔍 Backup verification:`);
    console.log(`  - Has required fields: ${hasAllFields}`);
    console.log(`  - Has users: ${hasUsers}`);
    console.log(`  - User count matches: ${userCountMatches}`);
    console.log(`  - Has user groups: ${hasUserGroups}`);
    console.log(`  - Has permissions: ${hasPermissions}`);
    
    return hasAllFields && hasUsers && userCountMatches && hasUserGroups && hasPermissions;
  } catch (error) {
    console.error('❌ Backup verification failed:', error.message);
    return false;
  }
};

/**
 * Get user sample for verification
 * @param {string} backupFile - Path to backup file
 * @returns {Object} Sample user data
 */
const getBackupSample = (backupFile) => {
  try {
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    if (backup.users && backup.users.length > 0) {
      const sampleUser = backup.users[0];
      console.log(`📋 Sample user from backup:`);
      console.log(`  - UID: ${sampleUser.uid}`);
      console.log(`  - Email: ${sampleUser.email || 'Not set'}`);
      console.log(`  - Display Name: ${sampleUser.displayName || 'Not set'}`);
      console.log(`  - Access Level: ${sampleUser.accessLevel || 'Not set'}`);
      console.log(`  - Allowed Provinces: ${sampleUser.allowedProvinces?.join(', ') || 'Not set'}`);
      console.log(`  - Allowed Branches: ${sampleUser.allowedBranches?.join(', ') || 'Not set'}`);
      console.log(`  - Is Active: ${sampleUser.isActive !== false ? 'Yes' : 'No'}`);
      
      return sampleUser;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Could not get backup sample:', error.message);
    return null;
  }
};

/**
 * List available backups
 * @returns {Array} List of backup files
 */
const listBackups = () => {
  const backupDir = path.join(__dirname, '../../backups');
  
  if (!fs.existsSync(backupDir)) {
    return [];
  }
  
  return fs.readdirSync(backupDir)
    .filter(file => file.startsWith('user-backup-') && file.endsWith('.json'))
    .map(file => ({
      file,
      path: path.join(backupDir, file),
      created: fs.statSync(path.join(backupDir, file)).mtime
    }))
    .sort((a, b) => b.created - a.created);
};

module.exports = {
  createUserBackup,
  verifyBackup,
  getBackupSample,
  listBackups
};

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 Starting REAL user data backup from Firebase...');
      
      const backupFile = await createUserBackup();
      const isValid = verifyBackup(backupFile);
      
      if (isValid) {
        console.log('✅ Backup completed successfully!');
        console.log(`📁 Backup location: ${backupFile}`);
        
        // Show sample user
        const sample = getBackupSample(backupFile);
        
        // List all backups
        const backups = listBackups();
        console.log(`\n📋 Available backups (${backups.length}):`);
        backups.forEach((backup, index) => {
          console.log(`  ${index + 1}. ${backup.file} (${backup.created.toLocaleString()})`);
        });
      } else {
        console.error('❌ Backup verification failed!');
        process.exit(1);
      }
    } catch (error) {
      console.error('💥 Backup failed:', error.message);
      process.exit(1);
    }
  })();
} 