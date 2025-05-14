const admin = require('firebase-admin');
const { DateTime } = require('luxon');

// Path to your service account key
const serviceAccount = require('../../../keys/serviceAccount.kbn-test.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateEmployees() {
    // 1. Build branchName (Thai) -> branchCode map
    const branchesSnapshot = await db.collection('data/company/branches').get();
    const branchNameToCode = {};
    branchesSnapshot.forEach(branchDoc => {
        const branchData = branchDoc.data();
        if (branchData.branchCode && branchData.branchName) {
            branchNameToCode[branchData.branchName] = branchData.branchCode;
        }
    });

    const employeesRef = db.collection('data/company/employees');
    const snapshot = await employeesRef.limit(5).get();

    const batch = db.batch();
    let count = 0;
    let updated = 0;
    const updatedIds = [];

    snapshot.forEach(doc => {
        if (count >= 5) return; // Only process first 5 records
        count++;

        const data = doc.data();
        const updates = {};

        // 1. Set branchCode based on affiliate (branchName in Thai)
        if (data.affiliate && branchNameToCode[data.affiliate]) {
            if (!data.branchCode || data.branchCode !== branchNameToCode[data.affiliate]) {
                updates.branchCode = branchNameToCode[data.affiliate];
            }
        }
        // 2. Convert startDate/endDate to ISO string if needed
        if (data.startDate && typeof data.startDate !== 'string') {
            updates.startDate = DateTime.fromMillis(data.startDate).toISODate();
        }
        if (data.endDate && typeof data.endDate !== 'string') {
            updates.endDate = DateTime.fromMillis(data.endDate).toISODate();
        }

        // 3. Derive isActive from status
        if (typeof data.status === 'string') {
            updates.isActive = data.status !== 'ลาออก';
        }

        // 4. (Optional) Map Thai status to English for internal use
        if (data.status === 'ลาออก') {
            updates.status = 'resigned';
        } else if (data.status === 'active' || data.status === 'Active') {
            updates.status = 'active';
        }

        // 5. Set missing provinceId to "nakhon-ratchasima"
        if (!data.provinceId) {
            updates.provinceId = 'nakhon-ratchasima';
        }

        // 6. Add more transformation logic as needed...

        if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
            updated++;
            updatedIds.push(doc.id); // Track updated doc ID
        }
    });
    
    if (updated > 0) {
        await batch.commit();
        console.log(`Migrated ${updated} employee documents.`);
        console.log('Updated document IDs:', updatedIds);
    } else {
        console.log('No documents needed migration.');
    }
}

migrateEmployees().catch(console.error);