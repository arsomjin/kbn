/**
 * 💾 BUSINESS DATA BACKUP UTILITY
 *
 * Creates complete backup of business data for live deployment safety
 * Part of Live Deployment Control Panel
 */

import { app } from '../firebase';

// Critical business collections to backup
const CRITICAL_COLLECTIONS = [
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
  'data/company/provinces',
  'data/company/branches',
  'data/company/userGroups',
  'data/company/permissions',
];

/**
 * Create complete backup of all business data
 */
export const createDataBackup = async () => {
  const firestore = app.firestore();
  const timestamp = Date.now();
  const backupId = `data_backup_${timestamp}`;

  try {
    console.log('💾 Starting business data backup...');

    const backupData = {
      backupId,
      timestamp,
      type: 'data_backup',
      collections: {},
      metadata: {
        createdBy: 'live-deployment-system',
        purpose: 'production-deployment-safety',
        version: '1.0.0',
        totalCollections: CRITICAL_COLLECTIONS.length,
      },
    };

    let totalDocuments = 0;

    // Backup each collection
    for (const collectionPath of CRITICAL_COLLECTIONS) {
      try {
        console.log(`📋 Backing up collection: ${collectionPath}`);

        const snapshot = await firestore.collection(collectionPath).get();
        const documents = [];

        snapshot.docs.forEach((doc) => {
          documents.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        backupData.collections[collectionPath] = {
          documentCount: documents.length,
          documents: documents,
          backedUpAt: Date.now(),
        };

        totalDocuments += documents.length;
        console.log(
          `✅ Backed up ${documents.length} documents from ${collectionPath}`
        );
      } catch (error) {
        console.warn(`⚠️ Could not backup ${collectionPath}: ${error.message}`);
        backupData.collections[collectionPath] = {
          error: error.message,
          documentCount: 0,
          documents: [],
          backedUpAt: Date.now(),
        };
      }
    }

    backupData.metadata.totalDocuments = totalDocuments;

    // Save backup to Firestore in chunks (due to size limits)
    const chunkSize = 100; // Documents per chunk
    const chunks = [];

    // Split large collections into chunks
    Object.keys(backupData.collections).forEach((collectionPath) => {
      const collection = backupData.collections[collectionPath];
      if (collection.documents && collection.documents.length > chunkSize) {
        const documentChunks = [];
        for (let i = 0; i < collection.documents.length; i += chunkSize) {
          documentChunks.push(collection.documents.slice(i, i + chunkSize));
        }

        documentChunks.forEach((chunk, index) => {
          chunks.push({
            backupId,
            chunkId: `${collectionPath.replace(/\//g, '_')}_chunk_${index}`,
            collectionPath,
            chunkIndex: index,
            totalChunks: documentChunks.length,
            documents: chunk,
            timestamp,
          });
        });

        // Replace original with reference
        backupData.collections[collectionPath] = {
          ...collection,
          documents: [], // Remove documents from main backup
          chunked: true,
          totalChunks: documentChunks.length,
        };
      }
    });

    // Save main backup document
    await firestore.collection('backups').doc(backupId).set(backupData);

    // Save chunks
    for (const chunk of chunks) {
      await firestore
        .collection('backups')
        .doc(backupId)
        .collection('chunks')
        .doc(chunk.chunkId)
        .set(chunk);
    }

    console.log(`✅ Business data backup completed: ${backupId}`);
    console.log(`📊 Total documents backed up: ${totalDocuments}`);
    console.log(`📦 Total chunks created: ${chunks.length}`);

    return {
      success: true,
      backupId,
      timestamp,
      totalCollections: CRITICAL_COLLECTIONS.length,
      totalDocuments,
      totalChunks: chunks.length,
      message: 'Business data backup created successfully',
    };
  } catch (error) {
    console.error('❌ Business data backup failed:', error);
    throw new Error(`Business data backup failed: ${error.message}`);
  }
};

/**
 * Restore business data from backup
 */
export const restoreDataBackup = async (backupId) => {
  const firestore = app.firestore();

  try {
    console.log(`🔄 Restoring business data backup: ${backupId}`);

    // Get backup data
    const backupDoc = await firestore.collection('backups').doc(backupId).get();

    if (!backupDoc.exists) {
      throw new Error(`Backup ${backupId} not found`);
    }

    const backupData = backupDoc.data();
    const collections = backupData.collections || {};

    console.log(
      `📊 Restoring ${Object.keys(collections).length} collections...`
    );

    let totalRestored = 0;

    // Restore each collection
    for (const [collectionPath, collectionData] of Object.entries(
      collections
    )) {
      try {
        console.log(`📋 Restoring collection: ${collectionPath}`);

        let documents = collectionData.documents || [];

        // If collection was chunked, retrieve chunks
        if (collectionData.chunked) {
          console.log(
            `📦 Retrieving ${collectionData.totalChunks} chunks for ${collectionPath}`
          );

          const chunksSnapshot = await firestore
            .collection('backups')
            .doc(backupId)
            .collection('chunks')
            .where('collectionPath', '==', collectionPath)
            .get();

          documents = [];
          chunksSnapshot.docs.forEach((chunkDoc) => {
            const chunkData = chunkDoc.data();
            documents.push(...chunkData.documents);
          });
        }

        if (documents.length === 0) {
          console.log(`⚠️ No documents to restore for ${collectionPath}`);
          continue;
        }

        // Restore documents in batches
        const batchSize = 500;
        let batch = firestore.batch();
        let batchCount = 0;

        for (const doc of documents) {
          const docRef = firestore.collection(collectionPath).doc(doc.id);
          batch.set(docRef, doc.data);
          batchCount++;

          if (batchCount >= batchSize) {
            await batch.commit();
            console.log(`✅ Batch restored: ${batchCount} documents`);
            batch = firestore.batch();
            batchCount = 0;
          }
        }

        // Commit remaining batch
        if (batchCount > 0) {
          await batch.commit();
          console.log(`✅ Final batch restored: ${batchCount} documents`);
        }

        totalRestored += documents.length;
        console.log(
          `✅ Restored ${documents.length} documents to ${collectionPath}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to restore ${collectionPath}: ${error.message}`
        );
      }
    }

    console.log(
      `✅ Business data restore completed: ${totalRestored} documents restored`
    );

    return {
      success: true,
      restoredDocuments: totalRestored,
      restoredCollections: Object.keys(collections).length,
      message: 'Business data backup restored successfully',
    };
  } catch (error) {
    console.error('❌ Business data restore failed:', error);
    throw error;
  }
};

/**
 * List available data backups
 */
export const listDataBackups = async () => {
  const firestore = app.firestore();

  try {
    const backupsSnapshot = await firestore
      .collection('backups')
      .where('type', '==', 'data_backup')
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
    console.error('❌ Failed to list data backups:', error);
    throw error;
  }
};

/**
 * Verify data backup integrity
 */
export const verifyDataBackup = async (backupId) => {
  const firestore = app.firestore();

  try {
    console.log(`🔍 Verifying data backup: ${backupId}`);

    // Get backup data
    const backupDoc = await firestore.collection('backups').doc(backupId).get();

    if (!backupDoc.exists) {
      throw new Error(`Backup ${backupId} not found`);
    }

    const backupData = backupDoc.data();
    const collections = backupData.collections || {};

    // Verify backup structure
    const verification = {
      backupExists: true,
      hasCollections: Object.keys(collections).length > 0,
      totalCollections: Object.keys(collections).length,
      hasMetadata: !!backupData.metadata,
      timestamp: backupData.timestamp,
      isValid: true,
      collectionDetails: {},
    };

    let totalDocuments = 0;
    let validCollections = 0;
    let invalidCollections = 0;

    // Check each collection
    for (const [collectionPath, collectionData] of Object.entries(
      collections
    )) {
      const details = {
        path: collectionPath,
        documentCount: collectionData.documentCount || 0,
        hasDocuments:
          (collectionData.documents && collectionData.documents.length > 0) ||
          collectionData.chunked,
        chunked: !!collectionData.chunked,
        hasError: !!collectionData.error,
      };

      if (details.hasError) {
        invalidCollections++;
        details.isValid = false;
      } else {
        validCollections++;
        details.isValid = true;
        totalDocuments += details.documentCount;
      }

      verification.collectionDetails[collectionPath] = details;
    }

    verification.totalDocuments = totalDocuments;
    verification.validCollections = validCollections;
    verification.invalidCollections = invalidCollections;
    verification.isValid = invalidCollections === 0;

    console.log(`✅ Backup verification completed`);
    console.log(`   Valid collections: ${validCollections}`);
    console.log(`   Invalid collections: ${invalidCollections}`);
    console.log(`   Total documents: ${totalDocuments}`);

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
