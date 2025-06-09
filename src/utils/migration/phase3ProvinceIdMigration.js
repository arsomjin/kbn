/**
 * Phase 3 Migration: Add ProvinceId to Existing Data
 * 
 * Critical for production deployment - ensures all existing data 
 * has provinceId fields for automatic geographic filtering
 */

import app from 'firebase/app';

// Get firestore instance directly
const firestore = app.firestore();

// Branch to Province mapping - Updated with actual KBN branch data
export const BRANCH_PROVINCE_MAP = {
  // Nakhon Ratchasima Province branches
  '0450': 'nakhon-ratchasima',
  '0451': 'nakhon-ratchasima',
  '0452': 'nakhon-ratchasima', 
  '0453': 'nakhon-ratchasima', 
  '0454': 'nakhon-ratchasima', 
  '0455': 'nakhon-ratchasima', 
  '0456': 'nakhon-ratchasima', 
  '1004': 'nakhon-ratchasima',
  '0500': 'nakhon-ratchasima',
  
  // Legacy branch codes (if any old data exists)
  'NMA002': 'nakhon-ratchasima', 
  'NMA003': 'nakhon-ratchasima',
  
  // Nakhon Sawan Province branches
  'NSN001': 'nakhon-sawan',
  'NSN002': 'nakhon-sawan',
  'NSN003': 'nakhon-sawan',
  
  // Special warehouse branch
  '1003': 'nakhon-ratchasima'  // Treating warehouse as part of main province for now
};

// Default province for records without branchCode
const DEFAULT_PROVINCE = 'nakhon-ratchasima';

// Collections that need provinceId migration
export const COLLECTIONS_TO_MIGRATE = [
  // Sales Collections
  { 
    path: 'sections/sales/vehicles',
    name: 'Vehicle Sales',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/sales/bookings',
    name: 'Vehicle Bookings',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/sales/partGroups',
    name: 'Part Groups',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/sales/parts',
    name: 'Parts',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/sales/saleItems',
    name: 'Sale Items',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  
  // Account Collections
  { 
    path: 'sections/account/incomes',
    name: 'Income Records',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/account/expenses',
    name: 'Expense Records',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/account/incomeItems',
    name: 'Income Items',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  
  // Service Collections
  { 
    path: 'sections/services/serviceOrders',
    name: 'Service Orders',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/services/importServices',
    name: 'Import Service',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/services/serviceClose',
    name: 'Service Close',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/services/gasCost',
    name: 'Gas Cost',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  
  // Warehouse Collections
  { 
    path: 'sections/stocks/importPartItems',
    name: 'Import Part Items',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/importVehicles',
    name: 'Import Vehicles',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/importVehicleItems',
    name: 'Import Vehicle Items',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/peripherals',
    name: 'Peripherals',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/purchasePlan',
    name: 'Purchase Plan',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/saleOut',
    name: 'Sale Out',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/saleOutItems',
    name: 'Sale Out Items',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/transfer',
    name: 'Transfer',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/transferItems',
    name: 'Transfer Items',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/stocks/vehicles',
    name: 'Vehicles',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  
  // Customer Collections
  { 
    path: 'data/sales/customers',
    name: 'Customers',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'data/sales/referrers',
    name: 'Referrers',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'data/sales/dealers',
    name: 'Dealers',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  
  // Credit Collections
  { 
    path: 'sections/credits/credits',
    name: 'Credits',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  
  // HR Collections (if applicable)
  { 
    path: 'sections/hr/importFingerPrint',
    name: 'Import Finger Print',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/hr/importFingerPrintBatch',
    name: 'Import Finger Print Batch',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'sections/hr/leave',
    name: 'Leave',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  },
  { 
    path: 'data/company/employees',
    name: 'Employees',
    branchField: 'branchCode',
    fallbackBranchField: 'branch'
  }
];

/**
 * Determine provinceId from branchCode
 */
const getProvinceFromBranch = (branchCode) => {
  if (!branchCode) return DEFAULT_PROVINCE;
  return BRANCH_PROVINCE_MAP[branchCode] || DEFAULT_PROVINCE;
};

/**
 * Get branchCode from document data
 */
const getBranchCode = (docData, branchField, fallbackBranchField) => {
  return docData[branchField] || docData[fallbackBranchField] || null;
};

/**
 * Migrate a single collection
 */
const migrateCollection = async (collection, onProgress) => {
  const { path, name, branchField, fallbackBranchField } = collection;
  
  console.log(`🚀 Starting migration for ${name} (${path})`);
  
  try {
    // Get collection reference
    const collectionRef = firestore.collection(path);
    
    // First, check if collection exists and get approximate count
    const initialSnapshot = await collectionRef.limit(1).get();
    if (initialSnapshot.empty) {
      console.log(`✅ ${name}: No documents found`);
      return { 
        success: true, 
        migrated: 0, 
        skipped: 0, 
        errors: [] 
      };
    }
    
    let migrated = 0;
    let skipped = 0;
    let errors = [];
    let lastDoc = null;
    const pageSize = 50;  // Reduced to prevent write exhaustion
    let totalProcessed = 0;
    
    console.log(`📊 ${name}: Starting paginated migration (${pageSize} docs per page)`);
    
    while (true) {
      // Use pagination to avoid loading all documents at once
      let query = collectionRef.orderBy('__name__').limit(pageSize);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        console.log(`✅ ${name}: No more documents to process`);
        break;
      }
      
      // Process documents in smaller batches to prevent write exhaustion
      const batchSize = 10;  // Much smaller batches to prevent overload
      let currentBatch = firestore.batch();
      let batchCount = 0;
      const batches = [];
      
      for (const doc of snapshot.docs) {
        totalProcessed++;
        const docData = doc.data();
        
        // Skip if already has provinceId
        if (docData.provinceId) {
          skipped++;
          continue;
        }
        
        try {
          // Determine provinceId
          const branchCode = getBranchCode(docData, branchField, fallbackBranchField);
          const provinceId = getProvinceFromBranch(branchCode);
          
          // Prepare update data
          const updateData = {
            provinceId,
            recordedProvince: provinceId, // For audit trail
            migratedAt: new Date().toISOString(),
            migratedBy: 'phase3-migration'
          };
          
          // Add to batch
          currentBatch.update(doc.ref, updateData);
          batchCount++;
          migrated++;
          
          // Commit batch when full
          if (batchCount >= batchSize) {
            batches.push(currentBatch);
            currentBatch = firestore.batch();
            batchCount = 0;
          }
          
        } catch (error) {
          console.error(`❌ Error processing document ${doc.id}:`, error);
          errors.push({
            docId: doc.id,
            error: error.message
          });
        }
        
        // Yield control every 10 documents to prevent UI blocking
        if (totalProcessed % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
          
          // Progress callback
          if (onProgress) {
            onProgress({
              collection: name,
              processed: totalProcessed,
              total: totalProcessed + 1, // Estimate, since we don't know total
              migrated,
              skipped
            });
          }
        }
      }
      
      // Commit remaining batch
      if (batchCount > 0) {
        batches.push(currentBatch);
      }
      
      // Execute all batches for this page
      console.log(`💾 Committing ${batches.length} batches for ${name} (page with ${snapshot.size} docs)`);
      for (let i = 0; i < batches.length; i++) {
        await batches[i].commit();
        
        // Longer delay between batch commits to prevent overwhelming Firebase
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
      
      // Set last document for pagination
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      // If we got fewer documents than page size, we're done
      if (snapshot.size < pageSize) {
        break;
      }
      
      // Longer delay between pages to prevent write exhaustion
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay between pages
    }
    
    console.log(`✅ ${name}: Migrated ${migrated}, Skipped ${skipped}, Errors: ${errors.length}, Total Processed: ${totalProcessed}`);
    
    return {
      success: true,
      migrated,
      skipped,
      errors
    };
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${name}:`, error);
    return {
      success: false,
      error: error.message,
      migrated: 0,
      skipped: 0,
      errors: []
    };
  }
};

/**
 * Execute Phase 3 Migration
 */
export const executePhase3Migration = async (onProgress, selectedCollections = null) => {
  console.log('🚀 Starting Phase 3 Migration: Add ProvinceId to Existing Data');
  console.log('📅 Migration Date:', new Date().toISOString());
  
  // Use selected collections or all collections
  const collectionsToMigrate = selectedCollections 
    ? COLLECTIONS_TO_MIGRATE.filter(col => selectedCollections.includes(col.name))
    : COLLECTIONS_TO_MIGRATE;
  
  console.log('🎯 Target Collections:', collectionsToMigrate.length);
  if (selectedCollections) {
    console.log('📋 Selected Collections:', selectedCollections);
  }
  
  const startTime = Date.now();
  const results = {
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    collections: {},
    summary: {
      totalCollections: collectionsToMigrate.length,
      successfulCollections: 0,
      failedCollections: 0,
      totalMigrated: 0,
      totalSkipped: 0,
      totalErrors: 0
    }
  };
  
  // Migrate each collection with timeout protection
  for (let i = 0; i < collectionsToMigrate.length; i++) {
    const collection = collectionsToMigrate[i];
    
    try {
      console.log(`\n🎯 Processing collection ${i + 1}/${collectionsToMigrate.length}: ${collection.name}`);
      
      // Add timeout protection (5 minutes per collection)
      const migrationPromise = migrateCollection(collection, (progress) => {
        if (onProgress) {
          onProgress({
            ...progress,
            currentCollection: collection.name,
            totalCollections: collectionsToMigrate.length,
            completedCollections: Object.keys(results.collections).length
          });
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Migration timeout after 30 minutes for ${collection.name}`)), 30 * 60 * 1000);
      });
      
      const result = await Promise.race([migrationPromise, timeoutPromise]);
      
      results.collections[collection.name] = result;
      
      if (result.success) {
        results.summary.successfulCollections++;
        results.summary.totalMigrated += result.migrated;
        results.summary.totalSkipped += result.skipped;
        results.summary.totalErrors += result.errors.length;
      } else {
        results.summary.failedCollections++;
      }
      
      // Yield control between collections to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Critical error migrating ${collection.name}:`, error);
      results.collections[collection.name] = {
        success: false,
        error: error.message,
        migrated: 0,
        skipped: 0,
        errors: []
      };
      results.summary.failedCollections++;
      
      // Continue with next collection even if one fails
      console.log(`⏭️  Continuing with next collection...`);
    }
  }
  
  // Complete migration
  const endTime = Date.now();
  results.endTime = new Date().toISOString();
  results.duration = endTime - startTime;
  
  // Log summary
  console.log('\n🎉 Phase 3 Migration Complete!');
  console.log('📊 Summary:', results.summary);
  console.log(`⏱️ Duration: ${Math.round(results.duration / 1000)} seconds`);
  
  // Save migration log
  try {
    await firestore
      .collection('migrations')
      .doc('phase3-provinceId')
      .set({
        ...results,
        version: '3.0.0',
        type: 'provinceId-injection',
        status: results.summary.failedCollections > 0 ? 'completed-with-errors' : 'completed'
      });
    
    console.log('💾 Migration log saved successfully');
  } catch (error) {
    console.error('❌ Failed to save migration log:', error);
  }
  
  return results;
};

/**
 * Validate migration results
 */
export const validatePhase3Migration = async () => {
  console.log('🔍 Validating Phase 3 Migration...');
  
  const validation = {
    collections: {},
    summary: {
      totalCollections: COLLECTIONS_TO_MIGRATE.length,
      validCollections: 0,
      invalidCollections: 0,
      totalDocuments: 0,
      documentsWithProvinceId: 0,
      documentsWithoutProvinceId: 0
    }
  };
  
  for (const collection of COLLECTIONS_TO_MIGRATE) {
    try {
      const collectionRef = firestore.collection(collection.path);
      const snapshot = await collectionRef.get();
      
      let withProvinceId = 0;
      let withoutProvinceId = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.provinceId) {
          withProvinceId++;
        } else {
          withoutProvinceId++;
        }
      });
      
      const isValid = withoutProvinceId === 0;
      
      validation.collections[collection.name] = {
        total: snapshot.size,
        withProvinceId,
        withoutProvinceId,
        isValid
      };
      
      validation.summary.totalDocuments += snapshot.size;
      validation.summary.documentsWithProvinceId += withProvinceId;
      validation.summary.documentsWithoutProvinceId += withoutProvinceId;
      
      if (isValid) {
        validation.summary.validCollections++;
      } else {
        validation.summary.invalidCollections++;
      }
      
      console.log(`${isValid ? '✅' : '❌'} ${collection.name}: ${withProvinceId}/${snapshot.size} have provinceId`);
      
    } catch (error) {
      console.error(`❌ Error validating ${collection.name}:`, error);
      validation.collections[collection.name] = {
        error: error.message,
        isValid: false
      };
      validation.summary.invalidCollections++;
    }
  }
  
  console.log('\n📊 Validation Summary:', validation.summary);
  
  return validation;
};

/**
 * Rollback Phase 3 Migration (if needed)
 */
export const rollbackPhase3Migration = async (onProgress) => {
  console.log('🔄 Rolling back Phase 3 Migration...');
  
  const results = {
    startTime: new Date().toISOString(),
    collections: {},
    summary: {
      totalCollections: COLLECTIONS_TO_MIGRATE.length,
      rolledBackCollections: 0,
      totalDocumentsRolledBack: 0
    }
  };
  
  for (const collection of COLLECTIONS_TO_MIGRATE) {
    try {
      const collectionRef = firestore.collection(collection.path);
      const snapshot = await collectionRef
        .where('migratedBy', '==', 'phase3-migration')
        .get();
      
      if (snapshot.empty) {
        console.log(`✅ ${collection.name}: No migrated documents found`);
        continue;
      }
      
      console.log(`🔄 Rolling back ${snapshot.size} documents in ${collection.name}`);
      
      const batch = firestore.batch();
      let count = 0;
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          provinceId: firestore.FieldValue.delete(),
          recordedProvince: firestore.FieldValue.delete(),
          migratedAt: firestore.FieldValue.delete(),
          migratedBy: firestore.FieldValue.delete()
        });
        count++;
      });
      
      await batch.commit();
      
      results.collections[collection.name] = {
        rolledBack: count
      };
      results.summary.rolledBackCollections++;
      results.summary.totalDocumentsRolledBack += count;
      
      console.log(`✅ ${collection.name}: Rolled back ${count} documents`);
      
    } catch (error) {
      console.error(`❌ Error rolling back ${collection.name}:`, error);
      results.collections[collection.name] = {
        error: error.message
      };
    }
  }
  
  console.log('🎉 Rollback complete:', results.summary);
  
  return results;
}; 