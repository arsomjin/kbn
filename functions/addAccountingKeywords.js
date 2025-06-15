const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { generateAccountingSearchFields } = require('./utils');

const firestore = admin.firestore();
const { log, error } = require('firebase-functions/logger');

// 🔥 Cloud Function: Add Keywords to Income Documents
exports.addIncomeKeywords = functions
  .region('asia-northeast1')
  .firestore.document('/sections/account/incomes/{incomeId}')
  .onCreate(async (snap, context) => {
    try {
      const incomeData = snap.data();
      const incomeId = context.params.incomeId;

      // Generate comprehensive search fields and keywords
      const searchFields = generateAccountingSearchFields(incomeData);

      // Update the document with keywords
      await snap.ref.update(searchFields);

      log(`✅ Income keywords generated for ${incomeId}:`, {
        keywordCount: searchFields.keywords?.length || 0,
        hasCustomerName: !!searchFields.customerName_lower,
        hasDescription: !!searchFields.description_lower,
      });
    } catch (e) {
      error(
        `❌ Error adding keywords to income ${context.params.incomeId}:`,
        e
      );
    }
  });

// 🔥 Cloud Function: Add Keywords to Expense Documents
exports.addExpenseKeywords = functions
  .region('asia-northeast1')
  .firestore.document('/sections/account/expenses/{expenseId}')
  .onCreate(async (snap, context) => {
    try {
      const expenseData = snap.data();
      const expenseId = context.params.expenseId;

      // Generate comprehensive search fields and keywords
      const searchFields = generateAccountingSearchFields(expenseData);

      // Special handling for expense documents
      let updateData = { ...searchFields };

      // Add isPart flag for purchase transfer expenses
      if (
        expenseData.expenseType === 'purchaseTransfer' &&
        typeof expenseData?.isPart === 'undefined'
      ) {
        if (expenseData?.billNoSKC || expenseData?.receiveNo) {
          let isPart = true;
          if (expenseData?.billNoSKC) {
            isPart = expenseData.billNoSKC.startsWith('80');
          } else {
            isPart = expenseData.receiveNo.startsWith('90');
          }
          updateData.isPart = isPart;
        }
      }

      // Update the document with keywords and additional data
      await snap.ref.update(updateData);

      log(`✅ Expense keywords generated for ${expenseId}:`, {
        keywordCount: searchFields.keywords?.length || 0,
        hasCustomerName: !!searchFields.customerName_lower,
        hasDescription: !!searchFields.description_lower,
        isPart: updateData.isPart,
      });
    } catch (e) {
      error(
        `❌ Error adding keywords to expense ${context.params.expenseId}:`,
        e
      );
    }
  });

// 🔥 Cloud Function: Add Keywords to Budget Documents
exports.addBudgetKeywords = functions
  .region('asia-northeast1')
  .firestore.document('/sections/account/budgets/{budgetId}')
  .onCreate(async (snap, context) => {
    try {
      const budgetData = snap.data();
      const budgetId = context.params.budgetId;

      // Generate comprehensive search fields and keywords
      const searchFields = generateAccountingSearchFields(budgetData);

      // Update the document with keywords
      await snap.ref.update(searchFields);

      log(`✅ Budget keywords generated for ${budgetId}:`, {
        keywordCount: searchFields.keywords?.length || 0,
        hasCategory: !!searchFields.category_lower,
        hasDescription: !!searchFields.description_lower,
      });
    } catch (e) {
      error(
        `❌ Error adding keywords to budget ${context.params.budgetId}:`,
        e
      );
    }
  });

// 🔥 Cloud Function: Batch Update Existing Documents
exports.batchUpdateAccountingKeywords = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    try {
      const { collection: collectionName, limit = 50, offset = 0 } = req.body;

      if (!['incomes', 'expenses', 'budgets'].includes(collectionName)) {
        res.status(400).json({
          error: 'Invalid collection. Must be: incomes, expenses, or budgets',
        });
        return;
      }

      const collectionRef = firestore
        .collection('sections')
        .doc('account')
        .collection(collectionName);

      // Get documents without keywords
      const snapshot = await collectionRef
        .where('keywords', '==', null)
        .limit(limit)
        .offset(offset)
        .get();

      const batch = firestore.batch();
      let updateCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const searchFields = generateAccountingSearchFields(data);

        batch.update(doc.ref, searchFields);
        updateCount++;
      });

      await batch.commit();

      log(
        `✅ Batch updated ${updateCount} ${collectionName} documents with keywords`
      );

      res.json({
        success: true,
        collection: collectionName,
        updated: updateCount,
        hasMore: snapshot.size === limit,
      });
    } catch (e) {
      error('❌ Error in batch update:', e);
      res.status(500).json({ error: e.message });
    }
  });

module.exports = {
  addIncomeKeywords: exports.addIncomeKeywords,
  addExpenseKeywords: exports.addExpenseKeywords,
  addBudgetKeywords: exports.addBudgetKeywords,
  batchUpdateAccountingKeywords: exports.batchUpdateAccountingKeywords,
};
