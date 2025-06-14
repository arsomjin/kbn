/**
 * ☁️ FIREBASE CLOUD FUNCTIONS SAFETY GUARD
 *
 * Critical safety utility to prevent Cloud Functions from triggering during migration
 * Backup → Disable → Migrate → Restore pattern for production safety
 */

import { app } from '../firebase';

/**
 * Backup current Cloud Functions configuration
 */
export const backupCloudFunctions = async () => {
  const timestamp = Date.now();
  const backupId = `functions_backup_${timestamp}`;

  try {
    console.log('☁️ Starting Cloud Functions backup...');

    // Note: This is a placeholder for the actual backup process
    // In production, this would involve Firebase Admin SDK or CLI commands
    const functionsBackup = {
      backupId,
      timestamp,
      type: 'cloud_functions_backup',
      message: 'Cloud Functions backup created - manual CLI backup recommended',
      cliCommands: [
        'firebase functions:config:get > functions-config-backup.json',
        'firebase functions:list > functions-list-backup.json',
      ],
      restoreCommands: [
        'firebase deploy --only functions',
        'firebase functions:config:set --input functions-config-backup.json',
      ],
      metadata: {
        createdBy: 'live-deployment-system',
        purpose: 'migration-safety-guard',
        version: '1.0.0',
      },
    };

    // Save backup metadata to Firestore
    const firestore = app.firestore();
    await firestore.collection('backups').doc(backupId).set(functionsBackup);

    console.log(`✅ Cloud Functions backup metadata saved: ${backupId}`);

    return {
      success: true,
      backupId,
      timestamp,
      message: 'Cloud Functions backup metadata created',
      requiresManualBackup: true,
      cliCommands: functionsBackup.cliCommands,
    };
  } catch (error) {
    console.error('❌ Cloud Functions backup failed:', error);
    throw new Error(`Cloud Functions backup failed: ${error.message}`);
  }
};

/**
 * Create safety disable script for Cloud Functions
 */
export const createFunctionsDisableScript = async () => {
  const timestamp = Date.now();
  const scriptId = `disable_functions_${timestamp}`;

  try {
    console.log('🛡️ Creating Cloud Functions disable script...');

    // Create disable script content
    const disableScript = {
      scriptId,
      timestamp,
      type: 'functions_disable_script',
      title: 'DISABLE CLOUD FUNCTIONS FOR MIGRATION',
      description:
        'Temporarily disable Cloud Functions to prevent triggers during data migration',
      steps: [
        {
          step: 1,
          title: 'Backup Current Functions',
          commands: [
            'firebase functions:config:get > functions-config-backup.json',
            'firebase functions:list > functions-list-backup.json',
          ],
          description: 'Save current functions configuration',
        },
        {
          step: 2,
          title: 'Deploy Empty Functions',
          commands: [
            'echo "// Temporarily disabled for migration" > functions/index.js',
            'firebase deploy --only functions',
          ],
          description: 'Deploy empty functions to disable triggers',
        },
        {
          step: 3,
          title: 'Verify Functions Disabled',
          commands: [
            'firebase functions:list',
            'echo "✅ Functions disabled - safe to proceed with migration"',
          ],
          description: 'Confirm all functions are disabled',
        },
      ],
      restoreSteps: [
        {
          step: 1,
          title: 'Restore Original Functions',
          commands: [
            'git checkout functions/index.js',
            'firebase deploy --only functions',
          ],
          description: 'Restore original functions code',
        },
        {
          step: 2,
          title: 'Restore Configuration',
          commands: [
            'firebase functions:config:set --input functions-config-backup.json',
          ],
          description: 'Restore functions configuration',
        },
        {
          step: 3,
          title: 'Verify Functions Restored',
          commands: [
            'firebase functions:list',
            'echo "✅ Functions restored and active"',
          ],
          description: 'Confirm all functions are working',
        },
      ],
      warnings: [
        '🚨 This will temporarily disable ALL Cloud Functions',
        '⚠️ Real-time features may be affected during migration',
        '🔄 Functions must be restored immediately after migration',
        '📋 Keep backup files safe for restoration',
      ],
    };

    // Save script to Firestore
    const firestore = app.firestore();
    await firestore
      .collection('migration_scripts')
      .doc(scriptId)
      .set(disableScript);

    console.log(`✅ Functions disable script created: ${scriptId}`);

    return {
      success: true,
      scriptId,
      timestamp,
      script: disableScript,
      message: 'Cloud Functions disable script created',
    };
  } catch (error) {
    console.error('❌ Failed to create disable script:', error);
    throw error;
  }
};

/**
 * Verify Cloud Functions are disabled
 */
export const verifyFunctionsDisabled = async () => {
  try {
    console.log('🔍 Verifying Cloud Functions status...');

    // Note: This would require Firebase Admin SDK or CLI integration
    // For now, we'll create a verification checklist
    const verification = {
      timestamp: Date.now(),
      type: 'functions_verification',
      checks: [
        {
          check: 'functions_list_empty',
          description:
            'Verify firebase functions:list shows no active functions',
          status: 'manual_check_required',
          command: 'firebase functions:list',
        },
        {
          check: 'no_function_logs',
          description: 'Verify no new function execution logs',
          status: 'manual_check_required',
          command: 'firebase functions:log --limit 10',
        },
        {
          check: 'firestore_triggers_disabled',
          description: 'Verify Firestore triggers are not responding',
          status: 'manual_check_required',
          note: 'Test with a small document update',
        },
      ],
      manualVerificationRequired: true,
      safetyMessage:
        'Manual verification required before proceeding with migration',
    };

    return {
      success: true,
      verification,
      requiresManualCheck: true,
      message: 'Functions verification checklist created',
    };
  } catch (error) {
    console.error('❌ Functions verification failed:', error);
    throw error;
  }
};

/**
 * Create restoration script for Cloud Functions
 */
export const createFunctionsRestoreScript = async (backupId) => {
  const timestamp = Date.now();
  const restoreScriptId = `restore_functions_${timestamp}`;

  try {
    console.log(
      `🔄 Creating Cloud Functions restore script for backup: ${backupId}`
    );

    const restoreScript = {
      restoreScriptId,
      backupId,
      timestamp,
      type: 'functions_restore_script',
      title: 'RESTORE CLOUD FUNCTIONS AFTER MIGRATION',
      description:
        'Restore Cloud Functions to normal operation after migration completion',
      urgency: 'CRITICAL - Must be executed immediately after migration',
      steps: [
        {
          step: 1,
          title: 'Verify Migration Completed',
          commands: [
            'echo "Confirm all migration steps are completed"',
            'echo "Verify data integrity before restoring functions"',
          ],
          description: 'Ensure migration is fully complete',
        },
        {
          step: 2,
          title: 'Restore Functions Code',
          commands: ['git checkout functions/index.js', 'git status'],
          description: 'Restore original functions source code',
        },
        {
          step: 3,
          title: 'Deploy Functions',
          commands: [
            'firebase deploy --only functions',
            'firebase functions:list',
          ],
          description: 'Deploy and verify functions are active',
        },
        {
          step: 4,
          title: 'Restore Configuration',
          commands: [
            'firebase functions:config:set --input functions-config-backup.json',
            'firebase functions:config:get',
          ],
          description: 'Restore functions configuration',
        },
        {
          step: 5,
          title: 'Test Functions',
          commands: [
            'firebase functions:log --limit 5',
            'echo "Test a small document update to verify triggers work"',
          ],
          description: 'Verify functions are working correctly',
        },
      ],
      postRestoreChecks: [
        'Verify all Cloud Functions are listed and active',
        'Test Firestore triggers with a small document update',
        'Check function logs for any errors',
        'Confirm real-time features are working',
        'Monitor function execution for 10 minutes',
      ],
      emergencyContacts: [
        'If functions fail to restore, immediately contact development team',
        'Keep backup files available for emergency restoration',
        'Document any issues for post-migration review',
      ],
    };

    // Save restore script to Firestore
    const firestore = app.firestore();
    await firestore
      .collection('migration_scripts')
      .doc(restoreScriptId)
      .set(restoreScript);

    console.log(`✅ Functions restore script created: ${restoreScriptId}`);

    return {
      success: true,
      restoreScriptId,
      backupId,
      timestamp,
      script: restoreScript,
      message: 'Cloud Functions restore script created',
    };
  } catch (error) {
    console.error('❌ Failed to create restore script:', error);
    throw error;
  }
};

/**
 * Get Cloud Functions safety status
 */
export const getCloudFunctionsSafetyStatus = async () => {
  const firestore = app.firestore();

  try {
    // Get latest backup
    const backupsSnapshot = await firestore
      .collection('backups')
      .where('type', '==', 'cloud_functions_backup')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    // Get latest scripts
    const scriptsSnapshot = await firestore
      .collection('migration_scripts')
      .where('type', 'in', [
        'functions_disable_script',
        'functions_restore_script',
      ])
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    const latestBackup = backupsSnapshot.empty
      ? null
      : {
          id: backupsSnapshot.docs[0].id,
          ...backupsSnapshot.docs[0].data(),
        };

    const scripts = scriptsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      latestBackup,
      scripts,
      safetyStatus: latestBackup ? 'backup_available' : 'no_backup',
      message: latestBackup
        ? 'Cloud Functions backup available'
        : 'No Cloud Functions backup found',
    };
  } catch (error) {
    console.error('❌ Failed to get safety status:', error);
    throw error;
  }
};
