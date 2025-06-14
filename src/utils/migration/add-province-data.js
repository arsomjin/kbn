/**
 * 🏢 ADD PROVINCE DATA UTILITY
 *
 * Adds Nakhon Sawan province and branch data to production database
 * Part of Live Deployment Control Panel
 */

import { app } from '../../firebase';

// Nakhon Sawan Province Data
const NAKHON_SAWAN_PROVINCE_DATA = {
  id: 'nakhon-sawan',
  name: 'นครสวรรค์',
  nameEn: 'Nakhon Sawan',
  code: 'NSN',
  region: 'central',
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  metadata: {
    addedBy: 'live-deployment-system',
    deploymentDate: Date.now(),
    version: '1.0.0',
  },
};

// Nakhon Sawan Branch Data
const NAKHON_SAWAN_BRANCHES = [
  {
    id: 'NSN001',
    code: 'NSN001',
    name: 'สาขาเมืองนครสวรรค์',
    nameEn: 'Nakhon Sawan City Branch',
    provinceId: 'nakhon-sawan',
    provinceCode: 'NSN',
    address: {
      street: '123 ถนนสวรรค์วิถี',
      district: 'เมืองนครสวรรค์',
      province: 'นครสวรรค์',
      postalCode: '60000',
    },
    contact: {
      phone: '056-123-456',
      email: 'nsn001@kbn.com',
    },
    isActive: true,
    isHeadquarter: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'NSN002',
    code: 'NSN002',
    name: 'สาขาตาคลี',
    nameEn: 'Takli Branch',
    provinceId: 'nakhon-sawan',
    provinceCode: 'NSN',
    address: {
      street: '456 ถนนตาคลี',
      district: 'ตาคลี',
      province: 'นครสวรรค์',
      postalCode: '60140',
    },
    contact: {
      phone: '056-234-567',
      email: 'nsn002@kbn.com',
    },
    isActive: true,
    isHeadquarter: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'NSN003',
    code: 'NSN003',
    name: 'สาขาชุมแสง',
    nameEn: 'Chumsaeng Branch',
    provinceId: 'nakhon-sawan',
    provinceCode: 'NSN',
    address: {
      street: '789 ถนนชุมแสง',
      district: 'ชุมแสง',
      province: 'นครสวรรค์',
      postalCode: '60150',
    },
    contact: {
      phone: '056-345-678',
      email: 'nsn003@kbn.com',
    },
    isActive: true,
    isHeadquarter: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * Add province data to production database
 */
export const addProvinceData = async () => {
  const firestore = app.firestore();
  const batch = firestore.batch();

  try {
    console.log('🏢 Adding Nakhon Sawan province data...');

    // Add province data
    const provinceRef = firestore
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc(NAKHON_SAWAN_PROVINCE_DATA.id);

    batch.set(provinceRef, NAKHON_SAWAN_PROVINCE_DATA);
    console.log('✅ Province data prepared for batch');

    // Add branch data
    for (const branch of NAKHON_SAWAN_BRANCHES) {
      const branchRef = firestore
        .collection('data')
        .doc('company')
        .collection('branches')
        .doc(branch.id);

      batch.set(branchRef, branch);
      console.log(`✅ Branch ${branch.code} prepared for batch`);
    }

    // Execute batch write
    console.log('🚀 Executing batch write...');
    await batch.commit();

    console.log('✅ Province and branch data added successfully');
    return {
      success: true,
      province: NAKHON_SAWAN_PROVINCE_DATA,
      branches: NAKHON_SAWAN_BRANCHES,
      message: 'Nakhon Sawan province and branches added successfully',
    };
  } catch (error) {
    console.error('❌ Error adding province data:', error);
    throw new Error(`Failed to add province data: ${error.message}`);
  }
};

/**
 * Verify province data was added correctly
 */
export const verifyProvinceData = async () => {
  const firestore = app.firestore();

  try {
    console.log('🔍 Verifying province data...');

    // Check province
    const provinceDoc = await firestore
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc('nakhon-sawan')
      .get();

    if (!provinceDoc.exists) {
      throw new Error('Province data not found');
    }

    // Check branches
    const branchesSnapshot = await firestore
      .collection('data')
      .doc('company')
      .collection('branches')
      .where('provinceId', '==', 'nakhon-sawan')
      .get();

    if (branchesSnapshot.size !== 3) {
      throw new Error(`Expected 3 branches, found ${branchesSnapshot.size}`);
    }

    console.log('✅ Province data verification passed');
    return {
      success: true,
      province: provinceDoc.data(),
      branches: branchesSnapshot.docs.map((doc) => doc.data()),
      message: 'Province data verification successful',
    };
  } catch (error) {
    console.error('❌ Province data verification failed:', error);
    throw error;
  }
};

/**
 * Remove province data (for rollback)
 */
export const removeProvinceData = async () => {
  const firestore = app.firestore();
  const batch = firestore.batch();

  try {
    console.log('🗑️ Removing Nakhon Sawan province data...');

    // Remove province
    const provinceRef = firestore
      .collection('data')
      .doc('company')
      .collection('provinces')
      .doc('nakhon-sawan');

    batch.delete(provinceRef);

    // Remove branches
    for (const branch of NAKHON_SAWAN_BRANCHES) {
      const branchRef = firestore
        .collection('data')
        .doc('company')
        .collection('branches')
        .doc(branch.id);

      batch.delete(branchRef);
    }

    await batch.commit();

    console.log('✅ Province data removed successfully');
    return {
      success: true,
      message: 'Province data removed for rollback',
    };
  } catch (error) {
    console.error('❌ Error removing province data:', error);
    throw error;
  }
};
