/**
 * 🏗️ PROVINCE EXPANSION DATA SIMULATION SCRIPT
 *
 * Purpose: Simulate Nakhon Sawan province data for testing
 * Source: Copy existing Nakhon Ratchasima data and transform
 * Target: Create realistic test data for new province expansion
 *
 * Boss, this script will help you test the dual-search system with real-looking data!
 */

import { app } from '../firebase';
import dayjs from 'dayjs';

// Get firestore instance
const firestore = app.firestore();

// 🗺️ PROVINCE & BRANCH MAPPING
const PROVINCE_MAPPING = {
  source: {
    provinceId: 'nakhon-ratchasima',
    provinceName: 'นครราชสีมา',
    provinceCode: 'NMA',
    branches: ['0450', '0451', '0452', '0453', '0454', '0455', '0456', '0500'],
  },
  target: {
    provinceId: 'nakhon-sawan',
    provinceName: 'นครสวรรค์',
    provinceCode: 'NSN',
    branches: ['NSN001', 'NSN002', 'NSN003'],
  },
};

// 🏢 BRANCH TRANSFORMATION MAPPING
const BRANCH_MAPPING = {
  '0450': 'NSN001', // Head office → NSN001
  '0451': 'NSN002', // Bua Yai → Takli
  '0452': 'NSN003', // Chakkarat → Nong Bua
  '0453': 'NSN001', // Sida → NSN001
  '0454': 'NSN002', // Kok Kruat → NSN002
  '0455': 'NSN003', // Nong Bumrung → NSN003
  '0456': 'NSN001', // Kham Sa Kaeo → NSN001
  '0500': 'NSN002', // Farm → NSN002
};

// 👥 CUSTOMER NAME VARIATIONS (for realistic data)
const CUSTOMER_VARIATIONS = [
  'บริษัท กุโบต้า นครสวรรค์ จำกัด',
  'นายสมชาย เกษตรกรดี',
  'นางสาวมาลี รักษ์ดิน',
  'สหกรณ์เกษตรกรตำบลตาคลี',
  'นายประยุทธ ขายเก่ง',
  'บริษัท เกษตรสีเขียว จำกัด',
  'นายสมศักดิ์ ปลูกข้าว',
  'นางสุดา ทำนา',
  'กลุ่มเกษตรกรหนองบัว',
  'นายวิชัย รักเกษตร',
];

// 🚜 VEHICLE MODEL VARIATIONS
const VEHICLE_MODELS = [
  'L3408',
  'L2202',
  'L4508',
  'L3008',
  'L2602',
  'L4008',
  'L3608',
  'L2402',
];

// 💰 REALISTIC AMOUNT RANGES
const AMOUNT_RANGES = {
  vehicles: { min: 80000, max: 350000 },
  service: { min: 2000, max: 15000 },
  parts: { min: 500, max: 25000 },
  other: { min: 1000, max: 50000 },
};

/**
 * 🔧 UTILITY FUNCTIONS
 */

// Generate random amount within range
const generateRandomAmount = (category = 'vehicles') => {
  const range = AMOUNT_RANGES[category] || AMOUNT_RANGES.vehicles;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

// Generate random customer name
const generateCustomerName = () => {
  return CUSTOMER_VARIATIONS[
    Math.floor(Math.random() * CUSTOMER_VARIATIONS.length)
  ];
};

// Generate random vehicle model
const generateVehicleModel = () => {
  return VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];
};

// Generate new document ID with NSN prefix
const generateNewDocumentId = (originalId, type = 'ACC') => {
  const timestamp = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${type}-NSN-${timestamp}-${random}`;
};

// Transform branch code
const transformBranchCode = (originalBranch) => {
  return BRANCH_MAPPING[originalBranch] || 'NSN001';
};

// Generate realistic date within last 30 days
const generateRecentDate = () => {
  const daysAgo = Math.floor(Math.random() * 30);
  return dayjs().subtract(daysAgo, 'days').format('YYYY-MM-DD');
};

/**
 * 📊 DATA TRANSFORMATION FUNCTIONS
 */

// Transform accounting document
const transformAccountingDocument = (originalDoc, docId) => {
  const data = originalDoc.data();
  const newBranchCode = transformBranchCode(data.branchCode || data.branch);

  return {
    ...data,
    // Update IDs and references
    incomeId: generateNewDocumentId(data.incomeId || docId, 'ACC'),

    // Update geographic data
    provinceId: PROVINCE_MAPPING.target.provinceId,
    province: PROVINCE_MAPPING.target.provinceName,
    branchCode: newBranchCode,
    branch: newBranchCode,

    // Update customer data (randomize for variety)
    customerName: generateCustomerName(),
    customerId: `CUST-NSN-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`,

    // Update vehicle/product data
    vehicleModel: generateVehicleModel(),
    productName: `รถไถเดินตาม ${generateVehicleModel()}`,

    // Update amounts (realistic variations)
    amount: generateRandomAmount(data.incomeSubCategory),
    totalAmount: generateRandomAmount(data.incomeSubCategory),

    // Update dates (recent dates for testing)
    date: generateRecentDate(),
    created: dayjs().valueOf(),

    // Update metadata
    createdBy: 'data-simulation-script',
    description: `${data.description || 'เอกสารรายได้ประจำวัน'} (จำลองข้อมูลนครสวรรค์)`,

    // Add simulation metadata
    _simulation: {
      originalId: data.incomeId || docId,
      originalProvince: data.provinceId || 'nakhon-ratchasima',
      originalBranch: data.branchCode || data.branch,
      simulatedAt: dayjs().toISOString(),
      simulatedBy: 'province-expansion-testing',
    },
  };
};

// Transform sale document
const transformSaleDocument = (originalDoc, docId) => {
  const data = originalDoc.data();
  const newBranchCode = transformBranchCode(data.branchCode || data.branch);

  return {
    ...data,
    // Update IDs and references
    saleId: generateNewDocumentId(data.saleId || docId, 'SO'),
    saleNo: generateNewDocumentId(data.saleNo || docId, 'SO'),

    // Update geographic data
    provinceId: PROVINCE_MAPPING.target.provinceId,
    province: PROVINCE_MAPPING.target.provinceName,
    branchCode: newBranchCode,
    branch: newBranchCode,

    // Update customer data
    customerName: generateCustomerName(),
    customerId: `CUST-NSN-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`,
    customer: generateCustomerName(),

    // Update vehicle/product data
    vehicleModel: generateVehicleModel(),
    productName: `รถไถเดินตาม ${generateVehicleModel()}`,

    // Update amounts
    amount: generateRandomAmount('vehicles'),
    totalAmount: generateRandomAmount('vehicles'),

    // Update dates
    date: generateRecentDate(),
    created: dayjs().valueOf(),

    // Ensure approved status for reference
    status: 'approved',

    // Update metadata
    createdBy: 'data-simulation-script',
    description: `${data.description || 'ใบสั่งขายรถไถ'} (จำลองข้อมูลนครสวรรค์)`,

    // Add simulation metadata
    _simulation: {
      originalId: data.saleId || docId,
      originalProvince: data.provinceId || 'nakhon-ratchasima',
      originalBranch: data.branchCode || data.branch,
      simulatedAt: dayjs().toISOString(),
      simulatedBy: 'province-expansion-testing',
    },
  };
};

/**
 * 🚀 MAIN SIMULATION FUNCTIONS
 */

// Simulate accounting documents
export const simulateAccountingDocuments = async (limit = 20) => {
  try {
    console.log(
      '🔍 Fetching existing accounting documents from Nakhon Ratchasima...'
    );

    // Fetch existing accounting documents
    const accountingQuery = await firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .where('incomeCategory', '==', 'daily')
      .where('provinceId', '==', PROVINCE_MAPPING.source.provinceId)
      .limit(limit)
      .get();

    if (accountingQuery.empty) {
      console.log(
        '⚠️ No existing accounting documents found. Creating sample data...'
      );
      return await createSampleAccountingDocuments(limit);
    }

    console.log(
      `📊 Found ${accountingQuery.size} accounting documents to simulate`
    );

    const batch = firestore.batch();
    let count = 0;

    accountingQuery.forEach((doc) => {
      const transformedData = transformAccountingDocument(doc, doc.id);
      const newDocRef = firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .doc(transformedData.incomeId);

      batch.set(newDocRef, transformedData);
      count++;
    });

    await batch.commit();
    console.log(
      `✅ Successfully simulated ${count} accounting documents for Nakhon Sawan`
    );

    return { success: true, count, type: 'accounting' };
  } catch (error) {
    console.error('❌ Error simulating accounting documents:', error);
    throw error;
  }
};

// Simulate sale documents
export const simulateSaleDocuments = async (limit = 15) => {
  try {
    console.log(
      '🔍 Fetching existing sale documents from Nakhon Ratchasima...'
    );

    // Fetch existing sale documents
    const saleQuery = await firestore
      .collection('sections')
      .doc('sales')
      .collection('vehicles')
      .where('saleCategory', '==', 'daily')
      .where('status', '==', 'approved')
      .where('provinceId', '==', PROVINCE_MAPPING.source.provinceId)
      .limit(limit)
      .get();

    if (saleQuery.empty) {
      console.log(
        '⚠️ No existing sale documents found. Creating sample data...'
      );
      return await createSampleSaleDocuments(limit);
    }

    console.log(`🛒 Found ${saleQuery.size} sale documents to simulate`);

    const batch = firestore.batch();
    let count = 0;

    saleQuery.forEach((doc) => {
      const transformedData = transformSaleDocument(doc, doc.id);
      const newDocRef = firestore
        .collection('sections')
        .doc('sales')
        .collection('vehicles')
        .doc(transformedData.saleId);

      batch.set(newDocRef, transformedData);
      count++;
    });

    await batch.commit();
    console.log(
      `✅ Successfully simulated ${count} sale documents for Nakhon Sawan`
    );

    return { success: true, count, type: 'sales' };
  } catch (error) {
    console.error('❌ Error simulating sale documents:', error);
    throw error;
  }
};

// Create sample accounting documents if none exist
const createSampleAccountingDocuments = async (count = 20) => {
  console.log('🏗️ Creating sample accounting documents...');

  const batch = firestore.batch();
  const categories = ['vehicles', 'service', 'parts', 'other'];

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const branchCode =
      PROVINCE_MAPPING.target.branches[
        i % PROVINCE_MAPPING.target.branches.length
      ];

    const sampleData = {
      incomeId: generateNewDocumentId(`SAMPLE-${i}`, 'ACC'),
      incomeCategory: 'daily',
      incomeSubCategory: category,

      // Geographic data
      provinceId: PROVINCE_MAPPING.target.provinceId,
      province: PROVINCE_MAPPING.target.provinceName,
      branchCode: branchCode,
      branch: branchCode,

      // Customer data
      customerName: generateCustomerName(),
      customerId: `CUST-NSN-${i.toString().padStart(3, '0')}`,

      // Product data
      vehicleModel: generateVehicleModel(),
      productName: `รถไถเดินตาม ${generateVehicleModel()}`,

      // Financial data
      amount: generateRandomAmount(category),
      totalAmount: generateRandomAmount(category),

      // Dates
      date: generateRecentDate(),
      created: dayjs().valueOf(),

      // Status
      status: ['draft', 'review', 'approved'][i % 3],

      // Metadata
      createdBy: 'sample-data-generator',
      description: `เอกสารรายได้ประจำวัน - ${category} (ข้อมูลตัวอย่าง)`,

      // Simulation metadata
      _simulation: {
        type: 'sample',
        simulatedAt: dayjs().toISOString(),
        simulatedBy: 'province-expansion-testing',
      },
    };

    const docRef = firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .doc(sampleData.incomeId);

    batch.set(docRef, sampleData);
  }

  await batch.commit();
  console.log(`✅ Created ${count} sample accounting documents`);

  return { success: true, count, type: 'accounting-sample' };
};

// Create sample sale documents if none exist
const createSampleSaleDocuments = async (count = 15) => {
  console.log('🏗️ Creating sample sale documents...');

  const batch = firestore.batch();

  for (let i = 0; i < count; i++) {
    const branchCode =
      PROVINCE_MAPPING.target.branches[
        i % PROVINCE_MAPPING.target.branches.length
      ];

    const sampleData = {
      saleId: generateNewDocumentId(`SAMPLE-${i}`, 'SO'),
      saleNo: generateNewDocumentId(`SAMPLE-${i}`, 'SO'),
      saleCategory: 'daily',
      saleSubCategory: 'vehicles',
      saleType: 'cash',

      // Geographic data
      provinceId: PROVINCE_MAPPING.target.provinceId,
      province: PROVINCE_MAPPING.target.provinceName,
      branchCode: branchCode,
      branch: branchCode,

      // Customer data
      customerName: generateCustomerName(),
      customerId: `CUST-NSN-${i.toString().padStart(3, '0')}`,
      customer: generateCustomerName(),

      // Product data
      vehicleModel: generateVehicleModel(),
      productName: `รถไถเดินตาม ${generateVehicleModel()}`,

      // Financial data
      amount: generateRandomAmount('vehicles'),
      totalAmount: generateRandomAmount('vehicles'),

      // Dates
      date: generateRecentDate(),
      created: dayjs().valueOf(),

      // Status (approved for reference)
      status: 'approved',

      // Metadata
      createdBy: 'sample-data-generator',
      salesPerson: 'นายสมชาย ขายดี',
      description: `ใบสั่งขายรถไถ (ข้อมูลตัวอย่าง)`,

      // Simulation metadata
      _simulation: {
        type: 'sample',
        simulatedAt: dayjs().toISOString(),
        simulatedBy: 'province-expansion-testing',
      },
    };

    const docRef = firestore
      .collection('sections')
      .doc('sales')
      .collection('vehicles')
      .doc(sampleData.saleId);

    batch.set(docRef, sampleData);
  }

  await batch.commit();
  console.log(`✅ Created ${count} sample sale documents`);

  return { success: true, count, type: 'sales-sample' };
};

/**
 * 🎯 MAIN EXECUTION FUNCTION
 */
export const simulateProvinceExpansionData = async (options = {}) => {
  const {
    accountingLimit = 20,
    salesLimit = 15,
    skipAccounting = false,
    skipSales = false,
  } = options;

  console.log('🚀 Starting Province Expansion Data Simulation...');
  console.log(
    `📍 Source: ${PROVINCE_MAPPING.source.provinceName} (${PROVINCE_MAPPING.source.provinceCode})`
  );
  console.log(
    `📍 Target: ${PROVINCE_MAPPING.target.provinceName} (${PROVINCE_MAPPING.target.provinceCode})`
  );

  const results = {
    accounting: null,
    sales: null,
    summary: {
      totalDocuments: 0,
      success: true,
      errors: [],
    },
  };

  try {
    // Simulate accounting documents
    if (!skipAccounting) {
      console.log('\n📊 Simulating Accounting Documents...');
      results.accounting = await simulateAccountingDocuments(accountingLimit);
      results.summary.totalDocuments += results.accounting.count;
    }

    // Simulate sale documents
    if (!skipSales) {
      console.log('\n🛒 Simulating Sale Documents...');
      results.sales = await simulateSaleDocuments(salesLimit);
      results.summary.totalDocuments += results.sales.count;
    }

    console.log('\n🎉 Province Expansion Data Simulation Complete!');
    console.log(
      `📊 Total Documents Created: ${results.summary.totalDocuments}`
    );
    console.log(`📍 Province: ${PROVINCE_MAPPING.target.provinceName}`);
    console.log(`🏢 Branches: ${PROVINCE_MAPPING.target.branches.join(', ')}`);

    return results;
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    results.summary.success = false;
    results.summary.errors.push(error.message);
    throw error;
  }
};

/**
 * 🧹 CLEANUP FUNCTION
 */
export const cleanupSimulatedData = async () => {
  console.log('🧹 Cleaning up simulated data...');

  try {
    // Delete simulated accounting documents
    const accountingQuery = await firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .where('provinceId', '==', PROVINCE_MAPPING.target.provinceId)
      .where('_simulation.simulatedBy', '==', 'province-expansion-testing')
      .get();

    // Delete simulated sale documents
    const salesQuery = await firestore
      .collection('sections')
      .doc('sales')
      .collection('vehicles')
      .where('provinceId', '==', PROVINCE_MAPPING.target.provinceId)
      .where('_simulation.simulatedBy', '==', 'province-expansion-testing')
      .get();

    const batch = firestore.batch();
    let deleteCount = 0;

    accountingQuery.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    salesQuery.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    await batch.commit();

    console.log(`✅ Cleaned up ${deleteCount} simulated documents`);
    return { success: true, deletedCount: deleteCount };
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
};

// Export for easy usage
export default {
  simulateProvinceExpansionData,
  simulateAccountingDocuments,
  simulateSaleDocuments,
  cleanupSimulatedData,
  PROVINCE_MAPPING,
  BRANCH_MAPPING,
};
