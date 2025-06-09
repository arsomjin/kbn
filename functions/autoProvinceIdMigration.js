const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Branch to Province mapping (same as migration)
const BRANCH_PROVINCE_MAP = {
  // Nakhon Ratchasima Province
  "0450": "nakhon-ratchasima",
  "0451": "nakhon-ratchasima",
  "0452": "nakhon-ratchasima",
  "0453": "nakhon-ratchasima",
  "0454": "nakhon-ratchasima",
  "0455": "nakhon-ratchasima",
  "0456": "nakhon-ratchasima",
  "1004": "nakhon-ratchasima",
  "0500": "nakhon-ratchasima",
  "NMA002": "nakhon-ratchasima",
  "NMA003": "nakhon-ratchasima",

  // Nakhon Sawan Province
  "NSN001": "nakhon-sawan",
  "NSN002": "nakhon-sawan",
  "NSN003": "nakhon-sawan"
};

// Collections that need provinceId auto-migration
const COLLECTIONS_TO_AUTO_MIGRATE = [
  'sections/account/incomes',
  'sections/account/expenses', 
  'sections/account/budgets',
  'sections/sales/vehicles',
  'sections/sales/bookings',
  'sections/sales/parts',
  'sections/stocks/vehicles',
  'sections/stocks/parts',
  'sections/service/orders',
  'sections/service/appointments',
  'sections/hr/employees',
  'sections/hr/leaves',
  'sections/hr/attendance'
];

/**
 * Auto-add provinceId to documents that don't have it
 * Triggers on document creation/update across multiple collections
 */
const createAutoMigrationFunction = (collectionPath) => {
  const functionName = collectionPath.replace(/\//g, '_').replace(/sections_/, '');
  
  return functions.firestore
    .document(`${collectionPath}/{docId}`)
    .onWrite(async (change, context) => {
      try {
        const after = change.after.exists ? change.after.data() : null;
        const before = change.before.exists ? change.before.data() : null;
        
        // Skip if document was deleted
        if (!after) {
          console.log(`Document deleted in ${collectionPath}, skipping auto-migration`);
          return null;
        }
        
        // Skip if provinceId already exists
        if (after.provinceId) {
          console.log(`Document ${context.params.docId} already has provinceId: ${after.provinceId}`);
          return null;
        }
        
        // Get branchCode from document
        const branchCode = after.branchCode || after.branch;
        if (!branchCode) {
          console.log(`No branchCode found in document ${context.params.docId}, skipping auto-migration`);
          return null;
        }
        
        // Map branchCode to provinceId
        const provinceId = BRANCH_PROVINCE_MAP[branchCode];
        if (!provinceId) {
          console.warn(`Unknown branchCode: ${branchCode} in document ${context.params.docId}`);
          return null;
        }
        
        // Prevent infinite loops - check if this update is only adding provinceId
        if (before && Object.keys(after).length === Object.keys(before).length + 1) {
          const beforeKeys = Object.keys(before).sort();
          const afterKeys = Object.keys(after).filter(key => key !== 'provinceId').sort();
          
          if (JSON.stringify(beforeKeys) === JSON.stringify(afterKeys)) {
            console.log(`Skipping auto-migration for ${context.params.docId} - already processed`);
            return null;
          }
        }
        
        // Add provinceId to the document
        console.log(`Auto-migrating ${context.params.docId}: ${branchCode} → ${provinceId}`);
        
        await change.after.ref.update({
          provinceId: provinceId,
          _autoMigrated: true,
          _autoMigratedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Auto-migration complete for ${context.params.docId}`);
        return null;
        
      } catch (error) {
        console.error(`Auto-migration error in ${collectionPath}:`, error);
        return null;
      }
    });
};

// Export auto-migration functions for each collection
module.exports = {
  // Account collections
  autoMigrateAccountIncomes: createAutoMigrationFunction('sections/account/incomes'),
  autoMigrateAccountExpenses: createAutoMigrationFunction('sections/account/expenses'),
  autoMigrateAccountBudgets: createAutoMigrationFunction('sections/account/budgets'),
  
  // Sales collections  
  autoMigrateSalesVehicles: createAutoMigrationFunction('sections/sales/vehicles'),
  autoMigrateSalesBookings: createAutoMigrationFunction('sections/sales/bookings'),
  autoMigrateSalesParts: createAutoMigrationFunction('sections/sales/parts'),
  
  // Stock collections
  autoMigrateStocksVehicles: createAutoMigrationFunction('sections/stocks/vehicles'),
  autoMigrateStocksParts: createAutoMigrationFunction('sections/stocks/parts'),
  
  // Service collections
  autoMigrateServiceOrders: createAutoMigrationFunction('sections/service/orders'),
  autoMigrateServiceAppointments: createAutoMigrationFunction('sections/service/appointments'),
  
  // HR collections
  autoMigrateHREmployees: createAutoMigrationFunction('sections/hr/employees'),
  autoMigrateHRLeaves: createAutoMigrationFunction('sections/hr/leaves'),
  autoMigrateHRAttendance: createAutoMigrationFunction('sections/hr/attendance'),
  
  // Utility function to check migration status
  checkAutoMigrationStatus: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }
      
      const collections = COLLECTIONS_TO_AUTO_MIGRATE;
      const status = {};
      
      for (const collectionPath of collections) {
        try {
          // Check total documents
          const totalSnapshot = await admin.firestore()
            .collection(collectionPath)
            .limit(1000)
            .get();
          
          // Check documents with provinceId
          const migratedSnapshot = await admin.firestore()
            .collection(collectionPath)
            .where('provinceId', '!=', null)
            .limit(1000)
            .get();
          
          // Check auto-migrated documents
          const autoMigratedSnapshot = await admin.firestore()
            .collection(collectionPath)
            .where('_autoMigrated', '==', true)
            .limit(1000)
            .get();
          
          status[collectionPath] = {
            total: totalSnapshot.size,
            migrated: migratedSnapshot.size,
            autoMigrated: autoMigratedSnapshot.size,
            migrationProgress: totalSnapshot.size > 0 ? 
              Math.round((migratedSnapshot.size / totalSnapshot.size) * 100) : 100
          };
          
        } catch (error) {
          status[collectionPath] = {
            error: error.message
          };
        }
      }
      
      return {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        collections: status,
        summary: {
          totalCollections: collections.length,
          activeCollections: Object.keys(status).filter(key => !status[key].error).length
        }
      };
      
    } catch (error) {
      console.error('Auto-migration status check error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to check migration status');
    }
  })
}; 