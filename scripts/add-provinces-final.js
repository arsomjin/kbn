const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyATsNum6OUMXCgWqVjrcnkHCYltnZc9KG4",
  authDomain: "kubota-benjapol-test.firebaseapp.com",
  projectId: "kubota-benjapol-test",
  storageBucket: "kubota-benjapol-test.appspot.com",
  messagingSenderId: "692206279287",
  appId: "1:692206279287:web:124b539416d7d2c7d24472"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROVINCES_COLLECTION = "data/company/provinces";

const provinces = [
  {
    name: "นครราชสีมา",
    nameEn: "Nakhon Ratchasima",
    code: "NMA",
    status: "active"
  },
  {
    name: "นครสวรรค์",
    nameEn: "Nakhon Sawan",
    code: "NSN",
    status: "active"
  }
];

async function addProvince(provinceData) {
  try {
    const docRef = await addDoc(collection(db, PROVINCES_COLLECTION), {
      ...provinceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Added province ${provinceData.name} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Error adding province:", error);
    throw error;
  }
}

async function populateProvinces() {
  console.log("Starting province population...");
  console.log("Firebase config:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
  try {
    for (const province of provinces) {
      await addProvince(province);
    }
    console.log("All provinces added successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

populateProvinces();
