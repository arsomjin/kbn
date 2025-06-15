/**
 * 🎯 SIMPLE DATA CLONING SCRIPT
 *
 * Boss, this is MUCH simpler! Just run this in console:
 *
 * 1. Open browser console (F12)
 * 2. Paste this small script
 * 3. Run: cloneData()
 *
 * It fetches 20-30 existing records, modifies them for Nakhon Sawan, and saves them back.
 */

window.cloneData = async () => {
  console.log('🚀 Simple Data Cloning for Nakhon Sawan');

  // Get Firebase from window
  const db = window.firebase?.firestore() || window.app?.firestore();
  if (!db) {
    console.error('❌ Firebase not found!');
    return;
  }

  // Simple mappings
  const branchMap = {
    '0450': 'NSN001',
    '0451': 'NSN002',
    '0452': 'NSN003',
    '0453': 'NSN001',
    '0454': 'NSN002',
    '0455': 'NSN003',
  };

  const customers = [
    'นายสมชาย นครสวรรค์',
    'นางมาลี ตาคลี',
    'บริษัท เกษตรสีเขียว จำกัด',
    'นายประยุทธ หนองบัว',
  ];

  try {
    // 1. Clone accounting documents
    console.log('📊 Cloning accounting documents...');
    const accountingDocs = await db
      .collection('sections/account/incomes')
      .where('incomeCategory', '==', 'daily')
      .limit(20)
      .get();

    const batch1 = db.batch();
    let count1 = 0;

    accountingDocs.forEach((doc) => {
      const data = doc.data();
      const newBranch = branchMap[data.branchCode] || 'NSN001';
      const newId = `ACC-NSN-${Date.now()}-${count1}`;

      const newData = {
        ...data,
        incomeId: newId,
        incomeCategory: 'daily',
        incomeSubCategory: data.incomeSubCategory || 'vehicles',
        incomeType: data.incomeType || 'cash',
        provinceId: 'nakhon-sawan',
        province: 'นครสวรรค์',
        branchCode: newBranch,
        branch: newBranch,
        customerName: customers[count1 % customers.length],
        date: new Date().toISOString().split('T')[0],
        created: Date.now(),
        _cloned: true,
      };

      const newRef = db.collection('sections/account/incomes').doc(newId);
      batch1.set(newRef, newData);
      count1++;
    });

    await batch1.commit();
    console.log(`✅ Cloned ${count1} accounting documents`);

    // 2. Clone sale documents
    console.log('🛒 Cloning sale documents...');
    const saleDocs = await db
      .collection('sections/sales/vehicles')
      .where('status', '==', 'approved')
      .limit(15)
      .get();

    const batch2 = db.batch();
    let count2 = 0;

    saleDocs.forEach((doc) => {
      const data = doc.data();
      const newBranch = branchMap[data.branchCode] || 'NSN001';
      const newId = `SO-NSN-${Date.now()}-${count2}`;

      const newData = {
        ...data,
        saleId: newId,
        saleNo: newId,
        saleCategory: 'daily',
        saleSubCategory: data.saleSubCategory || 'vehicles',
        saleType: data.saleType || 'cash',
        provinceId: 'nakhon-sawan',
        province: 'นครสวรรค์',
        branchCode: newBranch,
        branch: newBranch,
        customerName: customers[count2 % customers.length],
        date: new Date().toISOString().split('T')[0],
        created: Date.now(),
        _cloned: true,
      };

      const newRef = db.collection('sections/sales/vehicles').doc(newId);
      batch2.set(newRef, newData);
      count2++;
    });

    await batch2.commit();
    console.log(`✅ Cloned ${count2} sale documents`);

    console.log(
      `\n🎉 DONE! Created ${count1 + count2} documents for Nakhon Sawan`
    );
    console.log('🔍 Search for: ACC-NSN, SO-NSN, สมชาย, มาลี');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Cleanup function
window.cleanupClonedData = async () => {
  const db = window.firebase?.firestore() || window.app?.firestore();

  const [acc, sales] = await Promise.all([
    db
      .collection('sections/account/incomes')
      .where('_cloned', '==', true)
      .get(),
    db.collection('sections/sales/vehicles').where('_cloned', '==', true).get(),
  ]);

  const batch = db.batch();
  acc.forEach((doc) => batch.delete(doc.ref));
  sales.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
  console.log(`✅ Cleaned up ${acc.size + sales.size} cloned documents`);
};

console.log('🎯 Simple Commands:');
console.log('• cloneData()           - Clone 20+15 documents');
console.log('• cleanupClonedData()   - Remove cloned data');
console.log('\n🚀 Ready! Just run: cloneData()');
