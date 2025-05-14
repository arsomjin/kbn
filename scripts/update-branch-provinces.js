// @ts-check
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');
require('dotenv').config();

// Initialize Firebase with environment variables
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

async function updateBranches() {
  console.log('Starting branch update...');
  
  // First get the Nakhon Ratchasima province ID
  const provincesRef = collection(db, PROVINCES_COLLECTION);
  const provincesSnapshot = await getDocs(provincesRef);
  
  let nakhonRatchasimaId = null;
  provincesSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.name === "นครราชสีมา") {
      nakhonRatchasimaId = doc.id;
    }
  });

  if (!nakhonRatchasimaId) {
    console.error('Could not find Nakhon Ratchasima province');
    process.exit(1);
  }

  console.log(`Found Nakhon Ratchasima province ID: ${nakhonRatchasimaId}`);
  console.log('Starting branch update...');
  try {
    const branchesRef = collection(db, BRANCHES_COLLECTION);
    const snapshot = await getDocs(branchesRef);
    
    if (snapshot.empty) {
      console.log('No branches found');
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    snapshot.forEach((branchDoc) => {
      const branchRef = doc(db, BRANCHES_COLLECTION, branchDoc.id);
      const branchData = branchDoc.data();
      
      // Only update if provinceId is not set
      if (!branchData.provinceId) {
        batch.update(branchRef, {
          provinceId: nakhonRatchasimaId
        });
        updateCount++;
        console.log(`Preparing to update branch: ${branchData.branchName || branchDoc.id}`);
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} branches!`);
    } else {
      console.log('No branches needed updating');
    }
  } catch (error) {
    console.error('Error updating branches:', error);
  } finally {
    process.exit(0);
  }
}

updateBranches();
