/**
 * 💾 USER BACKUP UTILITY
 *
 * Creates complete backup of user data for live deployment safety
 * Part of Live Deployment Control Panel
 */

import { app } from '../firebase';

/**
 * Create complete backup of all user data
 */
export const createUserBackup = async () => {
  const firestore = app.firestore();
  const timestamp = Date.now();
  const backupId = `user_backup_${timestamp}`;

  try {
    console.log('💾 Starting user data backup...');

    // Get all users
    const usersSnapshot = await firestore.collection('users').get();
    const userData = [];

    usersSnapshot.docs.forEach((doc) => {
      userData.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    console.log(`📊 Found ${userData.length} users to backup`);

    // Create backup document
    const backupData = {
      backupId,
      timestamp,
      type: 'user_backup',
      totalUsers: userData.length,
      users: userData,
      metadata: {
        createdBy: 'live-deployment-system',
        purpose: 'production-deployment-safety',
        version: '1.0.0',
      },
    };

    // Save backup to Firestore
    await firestore.collection('backups').doc(backupId).set(backupData);

    console.log(`✅ User backup completed: ${backupId}`);

    return {
      success: true,
      backupId,
      timestamp,
      totalUsers: userData.length,
      message: 'User backup created successfully',
    };
  } catch (error) {
    console.error('❌ User backup failed:', error);
    throw new Error(`User backup failed: ${error.message}`);
  }
};

/**
 * Restore users from backup
 */
export const restoreUserBackup = async (backupId) => {
  const firestore = app.firestore();

  try {
    console.log(`🔄 Restoring user backup: ${backupId}`);

    // Get backup data
    const backupDoc = await firestore.collection('backups').doc(backupId).get();

    if (!backupDoc.exists) {
      throw new Error(`Backup ${backupId} not found`);
    }

    const backupData = backupDoc.data();
    const users = backupData.users || [];

    console.log(`📊 Restoring ${users.length} users...`);

    // Restore users in batches
    const batchSize = 500;
    let batch = firestore.batch();
    let batchCount = 0;

    for (const user of users) {
      const userRef = firestore.collection('users').doc(user.id);
      batch.set(userRef, user.data);
      batchCount++;

      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✅ Batch restored: ${batchCount} users`);
        batch = firestore.batch();
        batchCount = 0;
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Final batch restored: ${batchCount} users`);
    }

    console.log(`✅ User restore completed: ${users.length} users restored`);

    return {
      success: true,
      restoredUsers: users.length,
      message: 'User backup restored successfully',
    };
  } catch (error) {
    console.error('❌ User restore failed:', error);
    throw error;
  }
};

/**
 * List available user backups
 */
export const listUserBackups = async () => {
  const firestore = app.firestore();

  try {
    const backupsSnapshot = await firestore
      .collection('backups')
      .where('type', '==', 'user_backup')
      .orderBy('timestamp', 'desc')
      .get();

    const backups = backupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      backups,
      count: backups.length,
    };
  } catch (error) {
    console.error('❌ Failed to list user backups:', error);
    throw error;
  }
};

/**
 * Verify user backup integrity
 */
export const verifyUserBackup = async (backupId) => {
  const firestore = app.firestore();

  try {
    console.log(`🔍 Verifying user backup: ${backupId}`);

    // Get backup data
    const backupDoc = await firestore.collection('backups').doc(backupId).get();

    if (!backupDoc.exists) {
      throw new Error(`Backup ${backupId} not found`);
    }

    const backupData = backupDoc.data();
    const users = backupData.users || [];

    // Verify backup structure
    const verification = {
      backupExists: true,
      hasUsers: users.length > 0,
      totalUsers: users.length,
      hasMetadata: !!backupData.metadata,
      timestamp: backupData.timestamp,
      isValid: true,
    };

    // Check for required fields in users
    let validUsers = 0;
    let invalidUsers = 0;

    users.forEach((user) => {
      if (user.id && user.data) {
        validUsers++;
      } else {
        invalidUsers++;
      }
    });

    verification.validUsers = validUsers;
    verification.invalidUsers = invalidUsers;
    verification.isValid = invalidUsers === 0;

    console.log(`✅ Backup verification completed`);
    console.log(`   Valid users: ${validUsers}`);
    console.log(`   Invalid users: ${invalidUsers}`);

    return {
      success: true,
      verification,
      message: verification.isValid ? 'Backup is valid' : 'Backup has issues',
    };
  } catch (error) {
    console.error('❌ Backup verification failed:', error);
    throw error;
  }
};
