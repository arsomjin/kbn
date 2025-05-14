const { initializeApp } = require("firebase/app");
const { collection, getDocs, getFirestore, updateDoc } = require("firebase/firestore");
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const main = async () => {
  // Initialize Firebase with config
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // Get all branches
    const branchesRef = collection(db, "data/company/branches");
    const branchesSnapshot = await getDocs(branchesRef);
    
    console.log(`Found ${branchesSnapshot.size} branches to update`);
    
    // Update each branch
    const updates = branchesSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Only update if status is not already set
      if (!data.status) {
        console.log(`Updating branch ${doc.id} (${data.branchName})`);
        return updateDoc(doc.ref, {
          status: "active"
        });
      } else {
        console.log(`Branch ${doc.id} already has status: ${data.status}`);
        return Promise.resolve();
      }
    });

    await Promise.all(updates);
    console.log("All branches updated successfully");

  } catch (error) {
    console.error("Error updating branches:", error);
    process.exit(1);
  }

  process.exit(0);
};

main();
