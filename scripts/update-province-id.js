// @ts-check
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BRANCHES_COLLECTION = "data/company/branches";
const PROVINCES_COLLECTION = "data/company/provinces";
const NEW_PROVINCE_ID = "nakhon-sawan"; // Changed to update Nakhon Sawan
const PROVINCE_NAME = "นครสวรรค์"; // Changed to match Nakhon Sawan

async function updateProvinceId() {
  console.log('Starting province ID update...');
  
  // First get the current Nakhon Ratchasima province document
  const provincesRef = collection(db, PROVINCES_COLLECTION);
  const provincesSnapshot = await getDocs(provincesRef);
  
  let oldProvinceId = null;
  let oldProvinceData = null;
  provincesSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.name === PROVINCE_NAME) {
      oldProvinceId = doc.id;
      oldProvinceData = data;
    }
  });

  if (!oldProvinceId || !oldProvinceData) {
    console.error(`Could not find ${PROVINCE_NAME} province`);
    process.exit(1);
  }

  console.log(`Found old province ID: ${oldProvinceId}`);
  
  try {
    const batch = writeBatch(db);

    // 1. Create new province document with desired ID
    const newProvinceRef = doc(db, PROVINCES_COLLECTION, NEW_PROVINCE_ID);
    batch.set(newProvinceRef, oldProvinceData);

    // 2. Update all branches that reference the old ID
    const branchesRef = collection(db, BRANCHES_COLLECTION);
    const branchesSnapshot = await getDocs(branchesRef);
    
    let updateCount = 0;
    branchesSnapshot.forEach((branchDoc) => {
      const branchData = branchDoc.data();
      if (branchData.provinceId === oldProvinceId) {
        const branchRef = doc(db, BRANCHES_COLLECTION, branchDoc.id);
        batch.update(branchRef, {
          provinceId: NEW_PROVINCE_ID
        });
        updateCount++;
        console.log(`Preparing to update branch: ${branchData.branchName || branchDoc.id}`);
      }
    });

    // 3. Delete the old province document
    const oldProvinceRef = doc(db, PROVINCES_COLLECTION, oldProvinceId);
    batch.delete(oldProvinceRef);

    // Commit all changes
    await batch.commit();
    console.log(`Successfully updated province ID and ${updateCount} branch references!`);
  } catch (error) {
    console.error('Error updating province ID:', error);
  } finally {
    process.exit(0);
  }
}

updateProvinceId();
