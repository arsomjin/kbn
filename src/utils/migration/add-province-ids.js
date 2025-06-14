/**
 * 📋 ADD PROVINCE IDS TO DOCUMENTS UTILITY
 *
 * Adds provinceId field to ALL existing documents in production database
 * Part of Live Deployment Control Panel
 */

import { app } from '../../firebase';

// Collections that need provinceId field
const COLLECTIONS_TO_MIGRATE = [
  'sections/account/incomes',
  'sections/account/expenses',
  'sections/sales/vehicles',
  'sections/sales/bookings',
  'sections/sales/customers',
  'sections/sales/parts',
  'sections/services/serviceOrders',
  'sections/services/serviceClose',
  'sections/stocks/vehicles',
  'sections/stocks/parts',
  'sections/stocks/transferIn',
  'sections/stocks/transferOut',
  'sections/credits/credits',
  'sections/hr/importFingerPrint',
  'sections/hr/leave',
  'data/sales/customers',
  'data/sales/referrers',
  'data/sales/giveaways',
];

// Branch to province mapping
const BRANCH_TO_PROVINCE_MAPPING = {
  '0450': 'nakhon-ratchasima',
  NMA002: 'nakhon-ratchasima',
  NMA003: 'nakhon-ratchasima',
  NSN001: 'nakhon-sawan',
  NSN002: 'nakhon-sawan',
  NSN003: 'nakhon-sawan',
};

/**
 * Determine provinceId based on document data
 */
const determineProvinceId = (docData) => {
  // Method 1: Check branch field
  if (docData.branch && BRANCH_TO_PROVINCE_MAPPING[docData.branch]) {
    return BRANCH_TO_PROVINCE_MAPPING[docData.branch];
  }

  // Method 2: Check branchCode field
  if (docData.branchCode && BRANCH_TO_PROVINCE_MAPPING[docData.branchCode]) {
    return BRANCH_TO_PROVINCE_MAPPING[docData.branchCode];
  }

  // Method 3: Check nested branch data
  if (
    docData.branchData?.code &&
    BRANCH_TO_PROVINCE_MAPPING[docData.branchData.code]
  ) {
    return BRANCH_TO_PROVINCE_MAPPING[docData.branchData.code];
  }

  // Method 4: Check location field
  if (docData.location && BRANCH_TO_PROVINCE_MAPPING[docData.location]) {
    return BRANCH_TO_PROVINCE_MAPPING[docData.location];
  }

  // Method 5: Check if document has province field already
  if (docData.province) {
    if (
      docData.province === 'นครราชสีมา' ||
      docData.province === 'nakhon-ratchasima'
    ) {
      return 'nakhon-ratchasima';
    }
    if (
      docData.province === 'นครสวรรค์' ||
      docData.province === 'nakhon-sawan'
    ) {
      return 'nakhon-sawan';
    }
  }

  // Default: Assign to original province (Nakhon Ratchasima)
  // This is safe for existing data as it was all from the original province
  return 'nakhon-ratchasima';
};

/**
 * Add provinceId to documents in a single collection
 */
const migrateCollection = async (collectionPath, progressCallback) => {
  const firestore = app.firestore();

  try {
    console.log(`🔄 Migrating collection: ${collectionPath}`);

    // Get all documents in collection
    const snapshot = await firestore.collection(collectionPath).get();
    const totalDocs = snapshot.size;

    if (totalDocs === 0) {
      console.log(`⚠️ Collection ${collectionPath} is empty, skipping`);
      return { processed: 0, updated: 0, skipped: 0 };
    }

    console.log(`📊 Found ${totalDocs} documents in ${collectionPath}`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;
    const batchSize = 500; // Firestore batch limit
    let batch = firestore.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const docData = doc.data();

      // Skip if document already has provinceId
      if (docData.provinceId) {
        skipped++;
        processed++;
        continue;
      }

      // Determine provinceId for this document
      const provinceId = determineProvinceId(docData);

      // Add to batch
      batch.update(doc.ref, {
        provinceId: provinceId,
        migratedAt: Date.now(),
        migratedBy: 'live-deployment-system',
      });

      updated++;
      batchCount++;

      // Execute batch when it reaches limit
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✅ Batch committed: ${batchCount} documents updated`);
        batch = firestore.batch();
        batchCount = 0;
      }

      processed++;

      // Report progress
      if (progressCallback && processed % 100 === 0) {
        progressCallback({
          collection: collectionPath,
          processed,
          total: totalDocs,
          updated,
          skipped,
        });
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Final batch committed: ${batchCount} documents updated`);
    }

    console.log(`✅ Collection ${collectionPath} migration completed`);
    console.log(
      `   📊 Processed: ${processed}, Updated: ${updated}, Skipped: ${skipped}`
    );

    return { processed, updated, skipped };
  } catch (error) {
    console.error(`❌ Error migrating collection ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Add provinceId to all documents across all collections
 */
export const addProvinceIdToDocuments = async (progressCallback) => {
  const startTime = Date.now();
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  const results = [];

  try {
    console.log('🚀 Starting provinceId migration for all collections...');
    console.log(`📋 Collections to migrate: ${COLLECTIONS_TO_MIGRATE.length}`);

    for (let i = 0; i < COLLECTIONS_TO_MIGRATE.length; i++) {
      const collectionPath = COLLECTIONS_TO_MIGRATE[i];

      console.log(
        `\n🔄 [${i + 1}/${COLLECTIONS_TO_MIGRATE.length}] Migrating: ${collectionPath}`
      );

      try {
        const result = await migrateCollection(collectionPath, (progress) => {
          if (progressCallback) {
            progressCallback({
              ...progress,
              collectionIndex: i + 1,
              totalCollections: COLLECTIONS_TO_MIGRATE.length,
              overallProgress: {
                completed: totalProcessed + progress.processed,
                total: totalProcessed + progress.total,
              },
            });
          }
        });

        results.push({
          collection: collectionPath,
          ...result,
          success: true,
        });

        totalProcessed += result.processed;
        totalUpdated += result.updated;
        totalSkipped += result.skipped;
      } catch (error) {
        console.error(`❌ Failed to migrate ${collectionPath}:`, error.message);
        results.push({
          collection: collectionPath,
          error: error.message,
          success: false,
        });
      }
    }

    const duration = Date.now() - startTime;
    const durationMinutes = Math.round((duration / 60000) * 100) / 100;

    console.log('\n🎉 PROVINCE ID MIGRATION COMPLETED!');
    console.log(`⏱️ Duration: ${durationMinutes} minutes`);
    console.log(`📊 Total Processed: ${totalProcessed}`);
    console.log(`✅ Total Updated: ${totalUpdated}`);
    console.log(`⏭️ Total Skipped: ${totalSkipped}`);

    // Create migration log
    const migrationLog = {
      timestamp: Date.now(),
      duration: duration,
      totalCollections: COLLECTIONS_TO_MIGRATE.length,
      totalProcessed,
      totalUpdated,
      totalSkipped,
      results,
      success: true,
    };

    // Save migration log
    await app
      .firestore()
      .collection('migrationLogs')
      .doc(`provinceId_migration_${Date.now()}`)
      .set(migrationLog);

    return migrationLog;
  } catch (error) {
    console.error('❌ Province ID migration failed:', error);
    throw new Error(`Province ID migration failed: ${error.message}`);
  }
};

/**
 * Verify provinceId migration was successful
 */
export const verifyProvinceIdMigration = async () => {
  const firestore = app.firestore();
  const verificationResults = [];

  try {
    console.log('🔍 Verifying provinceId migration...');

    for (const collectionPath of COLLECTIONS_TO_MIGRATE) {
      try {
        // Check if collection exists and has documents
        const snapshot = await firestore
          .collection(collectionPath)
          .limit(10)
          .get();

        if (snapshot.empty) {
          verificationResults.push({
            collection: collectionPath,
            status: 'empty',
            message: 'Collection is empty',
          });
          continue;
        }

        // Check if documents have provinceId
        let hasProvinceId = 0;
        let missingProvinceId = 0;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.provinceId) {
            hasProvinceId++;
          } else {
            missingProvinceId++;
          }
        });

        verificationResults.push({
          collection: collectionPath,
          status: missingProvinceId === 0 ? 'success' : 'partial',
          hasProvinceId,
          missingProvinceId,
          sampleSize: snapshot.size,
        });
      } catch (error) {
        verificationResults.push({
          collection: collectionPath,
          status: 'error',
          error: error.message,
        });
      }
    }

    const successCount = verificationResults.filter(
      (r) => r.status === 'success'
    ).length;
    const totalCount = verificationResults.length;

    console.log(
      `✅ Verification completed: ${successCount}/${totalCount} collections verified`
    );

    return {
      success: successCount === totalCount,
      results: verificationResults,
      summary: {
        total: totalCount,
        success: successCount,
        partial: verificationResults.filter((r) => r.status === 'partial')
          .length,
        errors: verificationResults.filter((r) => r.status === 'error').length,
        empty: verificationResults.filter((r) => r.status === 'empty').length,
      },
    };
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
};

/**
 * Rollback provinceId migration (remove provinceId fields)
 */
export const rollbackProvinceIdMigration = async () => {
  const firestore = app.firestore();

  try {
    console.log('🔄 Rolling back provinceId migration...');

    for (const collectionPath of COLLECTIONS_TO_MIGRATE) {
      console.log(`🗑️ Removing provinceId from ${collectionPath}...`);

      const snapshot = await firestore
        .collection(collectionPath)
        .where('migratedBy', '==', 'live-deployment-system')
        .get();

      if (!snapshot.empty) {
        const batch = firestore.batch();

        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, {
            provinceId: app.firestore.FieldValue.delete(),
            migratedAt: app.firestore.FieldValue.delete(),
            migratedBy: app.firestore.FieldValue.delete(),
          });
        });

        await batch.commit();
        console.log(
          `✅ Removed provinceId from ${snapshot.size} documents in ${collectionPath}`
        );
      }
    }

    console.log('✅ ProvinceId migration rollback completed');
    return { success: true, message: 'Rollback completed successfully' };
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
