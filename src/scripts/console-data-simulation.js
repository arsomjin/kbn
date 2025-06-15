/**
 * 🚀 BROWSER CONSOLE DATA SIMULATION SCRIPT
 *
 * Boss, copy and paste this entire script into the browser console!
 *
 * Usage:
 * 1. Open your KBN app in browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: await simulateData()
 */

(async function () {
  console.log('🚀 KBN Province Expansion Data Simulation');
  console.log('==========================================');

  // Get Firebase instance from the app
  const firestore = window.firebase?.firestore() || window.app?.firestore();

  if (!firestore) {
    console.error(
      '❌ Firebase not found! Make sure you are on the KBN app page.'
    );
    return;
  }

  // 🗺️ PROVINCE & BRANCH MAPPING
  const PROVINCE_MAPPING = {
    source: {
      provinceId: 'nakhon-ratchasima',
      provinceName: 'นครราชสีมา',
      provinceCode: 'NMA',
      branches: [
        '0450',
        '0451',
        '0452',
        '0453',
        '0454',
        '0455',
        '0456',
        '0500',
      ],
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

  // 👥 CUSTOMER NAME VARIATIONS
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

  // 🔧 UTILITY FUNCTIONS
  const generateRandomAmount = (category = 'vehicles') => {
    const range = AMOUNT_RANGES[category] || AMOUNT_RANGES.vehicles;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const generateCustomerName = () => {
    return CUSTOMER_VARIATIONS[
      Math.floor(Math.random() * CUSTOMER_VARIATIONS.length)
    ];
  };

  const generateVehicleModel = () => {
    return VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];
  };

  const generateNewDocumentId = (originalId, type = 'ACC') => {
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${type}-NSN-${timestamp}-${random}`;
  };

  const transformBranchCode = (originalBranch) => {
    return BRANCH_MAPPING[originalBranch] || 'NSN001';
  };

  const generateRecentDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return (
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      date.getDate().toString().padStart(2, '0')
    );
  };

  // 📊 CREATE SAMPLE DATA FUNCTIONS
  const createSampleAccountingDocuments = async (count = 25) => {
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
        created: Date.now(),

        // Status
        status: ['draft', 'review', 'approved'][i % 3],

        // Metadata
        createdBy: 'sample-data-generator',
        description: `เอกสารรายได้ประจำวัน - ${category} (ข้อมูลตัวอย่าง)`,

        // Simulation metadata
        _simulation: {
          type: 'sample',
          simulatedAt: new Date().toISOString(),
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

  const createSampleSaleDocuments = async (count = 20) => {
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
        created: Date.now(),

        // Status (approved for reference)
        status: 'approved',

        // Metadata
        createdBy: 'sample-data-generator',
        salesPerson: 'นายสมชาย ขายดี',
        description: `ใบสั่งขายรถไถ (ข้อมูลตัวอย่าง)`,

        // Simulation metadata
        _simulation: {
          type: 'sample',
          simulatedAt: new Date().toISOString(),
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

  // 🎯 MAIN SIMULATION FUNCTION
  window.simulateData = async (options = {}) => {
    const { accountingDocs = 25, saleDocs = 20 } = options;

    console.log('📊 Starting data simulation...');
    console.log(`📈 Accounting Documents: ${accountingDocs}`);
    console.log(`🛒 Sale Documents: ${saleDocs}`);

    try {
      const results = {
        accounting: null,
        sales: null,
        summary: {
          totalDocuments: 0,
          success: true,
        },
      };

      // Create accounting documents
      console.log('\n📊 Creating Accounting Documents...');
      results.accounting =
        await createSampleAccountingDocuments(accountingDocs);
      results.summary.totalDocuments += results.accounting.count;

      // Create sale documents
      console.log('\n🛒 Creating Sale Documents...');
      results.sales = await createSampleSaleDocuments(saleDocs);
      results.summary.totalDocuments += results.sales.count;

      console.log('\n🎉 SIMULATION COMPLETE!');
      console.log('========================');
      console.log(`📊 Total Documents: ${results.summary.totalDocuments}`);
      console.log(`📈 Accounting: ${results.accounting?.count || 0}`);
      console.log(`🛒 Sales: ${results.sales?.count || 0}`);
      console.log('📍 Province: นครสวรรค์ (Nakhon Sawan)');
      console.log('🏢 Branches: NSN001, NSN002, NSN003');

      console.log('\n✅ Ready for testing!');
      console.log('🔍 You can now search for:');
      console.log('   • ACC-NSN-* (accounting documents)');
      console.log('   • SO-NSN-* (sale documents)');
      console.log('   • Customer names like "สมชาย", "มาลี", etc.');

      return results;
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      throw error;
    }
  };

  // 🧹 CLEANUP FUNCTION
  window.cleanupSimulatedData = async () => {
    console.log('🧹 Cleaning up simulated data...');

    try {
      // Delete simulated accounting documents
      const accountingQuery = await firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .where('provinceId', '==', PROVINCE_MAPPING.target.provinceId)
        .get();

      // Delete simulated sale documents
      const salesQuery = await firestore
        .collection('sections')
        .doc('sales')
        .collection('vehicles')
        .where('provinceId', '==', PROVINCE_MAPPING.target.provinceId)
        .get();

      const batch = firestore.batch();
      let deleteCount = 0;

      accountingQuery.forEach((doc) => {
        const data = doc.data();
        if (data._simulation?.simulatedBy === 'province-expansion-testing') {
          batch.delete(doc.ref);
          deleteCount++;
        }
      });

      salesQuery.forEach((doc) => {
        const data = doc.data();
        if (data._simulation?.simulatedBy === 'province-expansion-testing') {
          batch.delete(doc.ref);
          deleteCount++;
        }
      });

      await batch.commit();

      console.log(`✅ Cleaned up ${deleteCount} simulated documents`);
      return { success: true, deletedCount: deleteCount };
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  };

  // 📋 SHOW AVAILABLE COMMANDS
  console.log('\n🎯 Available Commands:');
  console.log('======================');
  console.log(
    '• await simulateData()                         - Create 25 accounting + 20 sales docs'
  );
  console.log(
    '• await simulateData({accountingDocs: 30, saleDocs: 25}) - Custom amounts'
  );
  console.log(
    '• await cleanupSimulatedData()                 - Clean up all simulated data'
  );
  console.log('');
  console.log('🚀 Ready! Run: await simulateData()');
})();
