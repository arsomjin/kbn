const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('/Users/arsomjin/Documents/Projects/keys/serviceAccount.kbn-test.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// === CONFIGURATION ===
const COLLECTION_NAME = 'sections/account/incomes'; // e.g. 'sections/account/incomes'
const PROVINCE_ID = 'nakhon-ratchasima'; // e.g. 'nakhon-ratchasima'
// =====================

async function addProvinceIdToAllDocs() {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  if (snapshot.empty) {
    console.log('No documents found in collection.');
    return;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const ref = doc.ref;
    batch.update(ref, { provinceId: PROVINCE_ID });
    count++;
    // Firestore batch limit is 500
    if (count % 500 === 0) {
      batch.commit();
      console.log('Committed 500 updates...');
    }
  });

  await batch.commit();
  console.log(`Added/updated provinceId for ${count} documents in "${COLLECTION_NAME}".`);
}

addProvinceIdToAllDocs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error updating documents:', err);
    process.exit(1);
  });