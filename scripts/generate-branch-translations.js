// @ts-check
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs').promises;
const path = require('path');
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

async function generateBranchTranslations() {
  console.log('Starting branch translations generation...');
  
  try {
    // Get all branches
    const branchesRef = collection(db, "data/company/branches");
    const branchesSnapshot = await getDocs(branchesRef);
    
    // Create translations object
    const thTranslations = {
      // Keep existing translations
      "selectBranch": "เลือกสาขา",
      "noBranchFound": "ไม่พบสาขา",
      "loading": "กำลังโหลดข้อมูลสาขา...",
      "error": "เกิดข้อผิดพลาดในการโหลดข้อมูลสาขา"
    };

    const enTranslations = {
      // English translations for common strings
      "selectBranch": "Select Branch",
      "noBranchFound": "No branches found",
      "loading": "Loading branches...",
      "error": "Error loading branches"
    };

    // Add branch translations
    branchesSnapshot.forEach((doc) => {
      const branch = doc.data();
      thTranslations[branch.branchCode] = branch.name;
      enTranslations[branch.branchCode] = branch.nameEn || branch.name; // Fallback to Thai name if English is not available
    });

    // Write Thai translations
    await fs.writeFile(
      path.join(__dirname, '../src/translations/th/branches.json'),
      JSON.stringify(thTranslations, null, 2),
      'utf8'
    );

    // Write English translations
    await fs.writeFile(
      path.join(__dirname, '../src/translations/en/branches.json'),
      JSON.stringify(enTranslations, null, 2),
      'utf8'
    );

    console.log('Successfully generated branch translations!');
  } catch (error) {
    console.error('Error generating branch translations:', error);
    process.exit(1);
  }

  process.exit(0);
}

generateBranchTranslations();
