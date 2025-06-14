/**
 * 🚨 EMERGENCY ROLLBACK UTILITY
 *
 * Complete rollback system for live deployment emergencies
 * Part of Live Deployment Control Panel
 */

import { app } from '../firebase';
import { restoreUserBackup } from './backup-users';
import { restoreDataBackup } from './backup-data';

/**
 * Execute complete emergency rollback
 */
export const executeEmergencyRollback = async (rollbackOptions = {}) => {
  const firestore = app.firestore();
  const rollbackId = `emergency_rollback_${Date.now()}`;

  const results = {
    success: true,
    rollbackId,
    timestamp: Date.now(),
    steps: [],
    errors: [],
    warnings: [],
  };

  try {
    console.log('🚨 EMERGENCY ROLLBACK INITIATED');
    console.log(`🆔 Rollback ID: ${rollbackId}`);

    // Step 1: Create rollback log
    results.steps.push({
      step: 1,
      name: 'Initialize Rollback Log',
      status: 'starting',
      timestamp: Date.now(),
    });

    try {
      await firestore
        .collection('rollback_logs')
        .doc(rollbackId)
        .set({
          rollbackId,
          initiatedAt: Date.now(),
          reason: rollbackOptions.reason || 'Emergency rollback',
          initiatedBy: rollbackOptions.userId || 'system',
          status: 'in_progress',
          steps: [],
        });

      results.steps[0].status = 'completed';
      results.steps[0].completedAt = Date.now();
      console.log('✅ Rollback log initialized');
    } catch (error) {
      results.steps[0].status = 'failed';
      results.steps[0].error = error.message;
      results.errors.push(
        `Failed to initialize rollback log: ${error.message}`
      );
      console.error('❌ Failed to initialize rollback log:', error);
    }

    // Step 2: Restore User Data (if backup specified)
    if (rollbackOptions.userBackupId) {
      results.steps.push({
        step: 2,
        name: 'Restore User Data',
        status: 'starting',
        timestamp: Date.now(),
        backupId: rollbackOptions.userBackupId,
      });

      try {
        console.log(
          `🔄 Restoring user data from backup: ${rollbackOptions.userBackupId}`
        );
        const userRestoreResult = await restoreUserBackup(
          rollbackOptions.userBackupId
        );

        results.steps[1].status = 'completed';
        results.steps[1].completedAt = Date.now();
        results.steps[1].result = userRestoreResult;
        console.log(
          `✅ User data restored: ${userRestoreResult.restoredUsers} users`
        );
      } catch (error) {
        results.steps[1].status = 'failed';
        results.steps[1].error = error.message;
        results.errors.push(`Failed to restore user data: ${error.message}`);
        results.success = false;
        console.error('❌ Failed to restore user data:', error);
      }
    }

    // Step 3: Restore Business Data (if backup specified)
    if (rollbackOptions.dataBackupId) {
      const stepIndex = results.steps.length;
      results.steps.push({
        step: stepIndex + 1,
        name: 'Restore Business Data',
        status: 'starting',
        timestamp: Date.now(),
        backupId: rollbackOptions.dataBackupId,
      });

      try {
        console.log(
          `🔄 Restoring business data from backup: ${rollbackOptions.dataBackupId}`
        );
        const dataRestoreResult = await restoreDataBackup(
          rollbackOptions.dataBackupId
        );

        results.steps[stepIndex].status = 'completed';
        results.steps[stepIndex].completedAt = Date.now();
        results.steps[stepIndex].result = dataRestoreResult;
        console.log(
          `✅ Business data restored: ${dataRestoreResult.restoredDocuments} documents`
        );
      } catch (error) {
        results.steps[stepIndex].status = 'failed';
        results.steps[stepIndex].error = error.message;
        results.errors.push(
          `Failed to restore business data: ${error.message}`
        );
        results.success = false;
        console.error('❌ Failed to restore business data:', error);
      }
    }

    // Step 4: Remove New Province Data (if requested)
    if (rollbackOptions.removeNewProvinceData) {
      const stepIndex = results.steps.length;
      results.steps.push({
        step: stepIndex + 1,
        name: 'Remove New Province Data',
        status: 'starting',
        timestamp: Date.now(),
      });

      try {
        console.log('🗑️ Removing new province data...');

        // Remove Nakhon Sawan province
        await firestore
          .collection('data')
          .doc('company')
          .collection('provinces')
          .doc('nakhon-sawan')
          .delete();

        // Remove Nakhon Sawan branches
        const newBranches = ['NSN001', 'NSN002', 'NSN003'];
        for (const branchId of newBranches) {
          await firestore
            .collection('data')
            .doc('company')
            .collection('branches')
            .doc(branchId)
            .delete();
        }

        results.steps[stepIndex].status = 'completed';
        results.steps[stepIndex].completedAt = Date.now();
        results.steps[stepIndex].result = {
          removedProvince: 'nakhon-sawan',
          removedBranches: newBranches,
        };
        console.log('✅ New province data removed');
      } catch (error) {
        results.steps[stepIndex].status = 'failed';
        results.steps[stepIndex].error = error.message;
        results.errors.push(
          `Failed to remove new province data: ${error.message}`
        );
        results.success = false;
        console.error('❌ Failed to remove new province data:', error);
      }
    }

    // Step 5: Remove ProvinceId Fields (if requested)
    if (rollbackOptions.removeProvinceIds) {
      const stepIndex = results.steps.length;
      results.steps.push({
        step: stepIndex + 1,
        name: 'Remove ProvinceId Fields',
        status: 'starting',
        timestamp: Date.now(),
      });

      try {
        console.log('🗑️ Removing provinceId fields from documents...');

        const collectionsToClean = [
          'sections/account/incomes',
          'sections/account/expenses',
          'sections/sales/vehicles',
          'sections/sales/bookings',
          'sections/sales/customers',
        ];

        let totalCleaned = 0;

        for (const collectionPath of collectionsToClean) {
          try {
            const snapshot = await firestore.collection(collectionPath).get();

            if (!snapshot.empty) {
              const batch = firestore.batch();
              let batchCount = 0;

              snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.provinceId) {
                  const cleanData = { ...data };
                  delete cleanData.provinceId;
                  batch.update(doc.ref, {
                    provinceId: firestore.FieldValue.delete(),
                  });
                  batchCount++;
                  totalCleaned++;
                }
              });

              if (batchCount > 0) {
                await batch.commit();
                console.log(
                  `✅ Cleaned ${batchCount} documents from ${collectionPath}`
                );
              }
            }
          } catch (error) {
            console.warn(
              `⚠️ Could not clean ${collectionPath}: ${error.message}`
            );
            results.warnings.push(
              `Could not clean ${collectionPath}: ${error.message}`
            );
          }
        }

        results.steps[stepIndex].status = 'completed';
        results.steps[stepIndex].completedAt = Date.now();
        results.steps[stepIndex].result = {
          totalDocumentsCleaned: totalCleaned,
          collectionsProcessed: collectionsToClean.length,
        };
        console.log(
          `✅ ProvinceId fields removed from ${totalCleaned} documents`
        );
      } catch (error) {
        results.steps[stepIndex].status = 'failed';
        results.steps[stepIndex].error = error.message;
        results.errors.push(
          `Failed to remove provinceId fields: ${error.message}`
        );
        results.success = false;
        console.error('❌ Failed to remove provinceId fields:', error);
      }
    }

    // Step 6: Update rollback log with final status
    const stepIndex = results.steps.length;
    results.steps.push({
      step: stepIndex + 1,
      name: 'Finalize Rollback Log',
      status: 'starting',
      timestamp: Date.now(),
    });

    try {
      await firestore
        .collection('rollback_logs')
        .doc(rollbackId)
        .update({
          status: results.success ? 'completed' : 'failed',
          completedAt: Date.now(),
          steps: results.steps,
          errors: results.errors,
          warnings: results.warnings,
          summary: {
            totalSteps: results.steps.length,
            successfulSteps: results.steps.filter(
              (s) => s.status === 'completed'
            ).length,
            failedSteps: results.steps.filter((s) => s.status === 'failed')
              .length,
            overallSuccess: results.success,
          },
        });

      results.steps[stepIndex].status = 'completed';
      results.steps[stepIndex].completedAt = Date.now();
      console.log('✅ Rollback log finalized');
    } catch (error) {
      results.steps[stepIndex].status = 'failed';
      results.steps[stepIndex].error = error.message;
      results.warnings.push(
        `Failed to finalize rollback log: ${error.message}`
      );
      console.error('❌ Failed to finalize rollback log:', error);
    }

    // Final summary
    const totalSteps = results.steps.length;
    const successfulSteps = results.steps.filter(
      (s) => s.status === 'completed'
    ).length;
    const failedSteps = results.steps.filter(
      (s) => s.status === 'failed'
    ).length;

    console.log(
      `\n🚨 EMERGENCY ROLLBACK ${results.success ? 'COMPLETED' : 'FAILED'}`
    );
    console.log(`📊 Summary:`);
    console.log(`   Total steps: ${totalSteps}`);
    console.log(`   Successful: ${successfulSteps}`);
    console.log(`   Failed: ${failedSteps}`);
    console.log(`   Warnings: ${results.warnings.length}`);
    console.log(`   Rollback ID: ${rollbackId}`);

    if (results.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log(`\n⚠️ Warnings:`);
      results.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    return results;
  } catch (error) {
    console.error('💥 CRITICAL ROLLBACK FAILURE:', error);

    // Try to log the critical failure
    try {
      await firestore
        .collection('rollback_logs')
        .doc(rollbackId)
        .set({
          rollbackId,
          initiatedAt: Date.now(),
          status: 'critical_failure',
          criticalError: error.message,
          reason: rollbackOptions.reason || 'Emergency rollback',
          initiatedBy: rollbackOptions.userId || 'system',
        });
    } catch (logError) {
      console.error('💥 Could not even log the critical failure:', logError);
    }

    return {
      success: false,
      rollbackId,
      timestamp: Date.now(),
      steps: results.steps,
      errors: [
        ...results.errors,
        `Critical rollback failure: ${error.message}`,
      ],
      warnings: results.warnings,
      criticalFailure: true,
    };
  }
};

/**
 * List available rollback logs
 */
export const listRollbackLogs = async () => {
  const firestore = app.firestore();

  try {
    const logsSnapshot = await firestore
      .collection('rollback_logs')
      .orderBy('initiatedAt', 'desc')
      .limit(20)
      .get();

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      logs,
      count: logs.length,
    };
  } catch (error) {
    console.error('❌ Failed to list rollback logs:', error);
    throw error;
  }
};

/**
 * Get detailed rollback log
 */
export const getRollbackLog = async (rollbackId) => {
  const firestore = app.firestore();

  try {
    const logDoc = await firestore
      .collection('rollback_logs')
      .doc(rollbackId)
      .get();

    if (!logDoc.exists) {
      throw new Error(`Rollback log ${rollbackId} not found`);
    }

    return {
      success: true,
      log: {
        id: logDoc.id,
        ...logDoc.data(),
      },
    };
  } catch (error) {
    console.error('❌ Failed to get rollback log:', error);
    throw error;
  }
};
