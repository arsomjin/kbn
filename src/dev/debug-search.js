/**
 * 🔍 DEBUG SEARCH MECHANISM
 *
 * This script helps debug the search functionality in income-daily
 * Run this in the browser console to understand what's happening
 */

// 🔧 DEBUG: Test search mechanism
export const debugIncomeSearch = async (searchTerm = 'test') => {
  console.log('🔍 DEBUGGING INCOME SEARCH MECHANISM');
  console.log('='.repeat(50));

  try {
    // Get Firebase instance
    const firebase = window.firebase;
    const firestore = firebase.firestore();

    console.log('📊 Testing search for term:', searchTerm);
    console.log('');

    // 1. Check if income documents exist
    console.log('1️⃣ Checking income documents...');
    const incomeSnapshot = await firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .limit(5)
      .get();

    console.log('📄 Total income documents found:', incomeSnapshot.size);

    if (!incomeSnapshot.empty) {
      console.log('📋 Sample documents:');
      incomeSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Document ${index + 1}:`, {
          id: doc.id,
          incomeId: data.incomeId,
          customerName: data.customerName,
          provinceId: data.provinceId,
          branchCode: data.branchCode,
          keywords: data.keywords,
          hasKeywords: !!data.keywords,
          keywordsLength: data.keywords?.length || 0,
          created: data.created,
          incomeSubCategory: data.incomeSubCategory,
        });
      });
    }

    // 2. Test keywords search
    console.log('');
    console.log('2️⃣ Testing keywords search...');
    try {
      const keywordsSnapshot = await firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .where('keywords', 'array-contains', searchTerm.toLowerCase())
        .limit(10)
        .get();

      console.log('🔍 Keywords search results:', keywordsSnapshot.size);

      if (!keywordsSnapshot.empty) {
        keywordsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`Keywords result ${index + 1}:`, {
            id: doc.id,
            incomeId: data.incomeId,
            customerName: data.customerName,
            keywords: data.keywords,
          });
        });
      }
    } catch (keywordsError) {
      console.error('❌ Keywords search failed:', keywordsError);
    }

    // 3. Test incomeId search
    console.log('');
    console.log('3️⃣ Testing incomeId search...');
    try {
      const incomeIdSnapshot = await firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .where('incomeId', '>=', searchTerm.toUpperCase())
        .where('incomeId', '<=', searchTerm.toUpperCase() + '\uf8ff')
        .limit(10)
        .get();

      console.log('🔍 IncomeId search results:', incomeIdSnapshot.size);

      if (!incomeIdSnapshot.empty) {
        incomeIdSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`IncomeId result ${index + 1}:`, {
            id: doc.id,
            incomeId: data.incomeId,
            customerName: data.customerName,
          });
        });
      }
    } catch (incomeIdError) {
      console.error('❌ IncomeId search failed:', incomeIdError);
    }

    // 4. Test customer name search
    console.log('');
    console.log('4️⃣ Testing customer name search...');
    try {
      const customerSnapshot = await firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .where('customerName', '>=', searchTerm)
        .where('customerName', '<=', searchTerm + '\uf8ff')
        .limit(10)
        .get();

      console.log('🔍 Customer name search results:', customerSnapshot.size);

      if (!customerSnapshot.empty) {
        customerSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`Customer result ${index + 1}:`, {
            id: doc.id,
            incomeId: data.incomeId,
            customerName: data.customerName,
          });
        });
      }
    } catch (customerError) {
      console.error('❌ Customer name search failed:', customerError);
    }

    // 5. Test province filtering
    console.log('');
    console.log('5️⃣ Testing province filtering...');
    try {
      const provinceSnapshot = await firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .where('provinceId', '==', 'NMA') // Nakhon Ratchasima
        .limit(10)
        .get();

      console.log('🔍 Province NMA results:', provinceSnapshot.size);

      if (!provinceSnapshot.empty) {
        provinceSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`Province result ${index + 1}:`, {
            id: doc.id,
            incomeId: data.incomeId,
            customerName: data.customerName,
            provinceId: data.provinceId,
            branchCode: data.branchCode,
          });
        });
      }
    } catch (provinceError) {
      console.error('❌ Province search failed:', provinceError);
    }

    // 6. Check data structure consistency
    console.log('');
    console.log('6️⃣ Checking data structure consistency...');
    const allDocsSnapshot = await firestore
      .collection('sections')
      .doc('account')
      .collection('incomes')
      .limit(20)
      .get();

    let hasKeywordsCount = 0;
    let hasProvinceIdCount = 0;
    let hasBranchCodeCount = 0;
    let hasIncomeIdCount = 0;
    let hasCustomerNameCount = 0;

    allDocsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.keywords) hasKeywordsCount++;
      if (data.provinceId) hasProvinceIdCount++;
      if (data.branchCode) hasBranchCodeCount++;
      if (data.incomeId) hasIncomeIdCount++;
      if (data.customerName) hasCustomerNameCount++;
    });

    console.log('📊 Data structure analysis:');
    console.log(
      `- Documents with keywords: ${hasKeywordsCount}/${allDocsSnapshot.size}`
    );
    console.log(
      `- Documents with provinceId: ${hasProvinceIdCount}/${allDocsSnapshot.size}`
    );
    console.log(
      `- Documents with branchCode: ${hasBranchCodeCount}/${allDocsSnapshot.size}`
    );
    console.log(
      `- Documents with incomeId: ${hasIncomeIdCount}/${allDocsSnapshot.size}`
    );
    console.log(
      `- Documents with customerName: ${hasCustomerNameCount}/${allDocsSnapshot.size}`
    );

    console.log('');
    console.log(
      '✅ Debug complete! Check the results above to identify the issue.'
    );
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// 🔧 DEBUG: Test specific search strategies
export const debugSearchStrategies = async (searchTerm = 'test') => {
  console.log('🔍 TESTING SEARCH STRATEGIES');
  console.log('='.repeat(50));

  try {
    const firebase = window.firebase;
    const firestore = firebase.firestore();

    // Test the actual search function from the API
    const { searchAccountingDocuments } = await import(
      '../Modules/Account/screens/Income/IncomeDaily/api'
    );

    // Mock user RBAC for testing
    const mockUserRBAC = {
      authority: 'STAFF',
      allowedProvinces: ['NMA'],
      allowedBranches: ['0450', 'NMA002', 'NMA003'],
      isDev: false,
    };

    console.log('🔍 Testing searchAccountingDocuments function...');
    const results = await searchAccountingDocuments(
      searchTerm,
      mockUserRBAC,
      firestore
    );

    console.log('📊 Search results:', {
      searchTerm,
      resultsCount: results?.length || 0,
      results: results,
    });
  } catch (error) {
    console.error('❌ Strategy test failed:', error);
  }
};

// 🔧 DEBUG: Check Firebase indexes
export const debugFirebaseIndexes = async () => {
  console.log('🔍 CHECKING FIREBASE INDEXES');
  console.log('='.repeat(50));

  try {
    const firebase = window.firebase;
    const firestore = firebase.firestore();

    // Test compound queries that require indexes
    const testQueries = [
      {
        name: 'Province + Keywords',
        query: () =>
          firestore
            .collection('sections')
            .doc('account')
            .collection('incomes')
            .where('provinceId', '==', 'NMA')
            .where('keywords', 'array-contains', 'test')
            .limit(1),
      },
      {
        name: 'Branch + Keywords',
        query: () =>
          firestore
            .collection('sections')
            .doc('account')
            .collection('incomes')
            .where('branchCode', '==', '0450')
            .where('keywords', 'array-contains', 'test')
            .limit(1),
      },
      {
        name: 'Province + IncomeId Range',
        query: () =>
          firestore
            .collection('sections')
            .doc('account')
            .collection('incomes')
            .where('provinceId', '==', 'NMA')
            .where('incomeId', '>=', 'KBN')
            .where('incomeId', '<=', 'KBN\uf8ff')
            .limit(1),
      },
    ];

    for (const test of testQueries) {
      try {
        console.log(`Testing: ${test.name}`);
        const snapshot = await test.query().get();
        console.log(`✅ ${test.name}: Works (${snapshot.size} results)`);
      } catch (error) {
        console.log(`❌ ${test.name}: Failed - ${error.message}`);
        if (error.message.includes('index')) {
          console.log(`   📝 Index needed for: ${test.name}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Index check failed:', error);
  }
};

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  window.debugIncomeSearch = debugIncomeSearch;
  window.debugSearchStrategies = debugSearchStrategies;
  window.debugFirebaseIndexes = debugFirebaseIndexes;
}

console.log('🔧 Debug functions loaded! Use in browser console:');
console.log('- debugIncomeSearch("your-search-term")');
console.log('- debugSearchStrategies("your-search-term")');
console.log('- debugFirebaseIndexes()');
