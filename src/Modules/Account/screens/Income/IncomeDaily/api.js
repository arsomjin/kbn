import dayjs from 'dayjs';
import { checkCollection } from '../../../../../firebase/api';
import { fetchFirestoreKeywords } from '../../../../../utils';

/**
 * 🔍 ENHANCED SEARCH: Search accounting documents with backward compatibility
 * Updated to work with both old documents (no keywords) and new documents (with keywords)
 */
export const searchAccountingDocuments = async (
  searchTerm,
  userRBAC,
  firestore
) => {
  try {
    console.log('🔍 [searchAccountingDocuments] Starting enhanced search', {
      searchTerm,
      userRBAC: userRBAC?.authority,
    });

    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // Build geographic filters based on RBAC
    let queries = [];

    if (userRBAC && !userRBAC.isDev && userRBAC.authority !== 'ADMIN') {
      // Get allowed provinces/branches from proper RBAC structure
      let allowedProvinces =
        userRBAC.access?.geographic?.allowedProvinces ||
        userRBAC.userRBAC?.geographic?.allowedProvinces ||
        userRBAC.allowedProvinces ||
        [];

      let allowedBranches =
        userRBAC.access?.geographic?.allowedBranches ||
        userRBAC.userRBAC?.geographic?.allowedBranches ||
        userRBAC.allowedBranches ||
        [];

      if (allowedProvinces.length > 0) {
        queries.push(['provinceId', 'in', allowedProvinces]);
      } else if (allowedBranches.length > 0) {
        queries.push(['branchCode', 'in', allowedBranches]);
      }
    }

    let results = [];
    const searchTermUpper = searchTerm.toUpperCase();
    const searchTermLower = searchTerm.toLowerCase();

    // 🚀 STRATEGY 1: Keywords search (for new documents)
    console.log('🔍 [searchAccountingDocuments] Strategy 1: Keywords search');

    try {
      const keywordsSnap = await checkCollection('sections/account/incomes', [
        ...queries,
        ['keywords', 'array-contains', searchTermLower],
      ]);

      if (keywordsSnap) {
        keywordsSnap.forEach((doc) => {
          results.push(formatDocumentResult(doc.id, doc.data()));
        });
        console.log(
          '🔍 [searchAccountingDocuments] Keywords search found:',
          results.length
        );
      }
    } catch (keywordsError) {
      console.warn(
        '🔍 [searchAccountingDocuments] Keywords search failed (expected for old docs):',
        keywordsError
      );
    }

    // 🚀 STRATEGY 2: Direct field searches (for both old and new documents)
    if (results.length < 10) {
      console.log(
        '🔍 [searchAccountingDocuments] Strategy 2: Direct field searches'
      );

      try {
        // Search by incomeId (exact match and prefix)
        const incomeIdSnap = await checkCollection('sections/account/incomes', [
          ...queries,
          ['incomeId', '>=', searchTermUpper],
          ['incomeId', '<=', searchTermUpper + '\uf8ff'],
        ]);

        if (incomeIdSnap) {
          incomeIdSnap.forEach((doc) => {
            // Avoid duplicates from keywords search
            if (!results.find((r) => r.id === doc.id)) {
              results.push(formatDocumentResult(doc.id, doc.data()));
            }
          });
        }

        // Search by customerName if not enough results
        if (results.length < 15) {
          const customerSnap = await checkCollection(
            'sections/account/incomes',
            [
              ...queries,
              ['customerName', '>=', searchTerm],
              ['customerName', '<=', searchTerm + '\uf8ff'],
            ]
          );

          if (customerSnap) {
            customerSnap.forEach((doc) => {
              if (!results.find((r) => r.id === doc.id)) {
                results.push(formatDocumentResult(doc.id, doc.data()));
              }
            });
          }
        }

        // Search by customerName_lower for better matching
        if (results.length < 15) {
          const customerLowerSnap = await checkCollection(
            'sections/account/incomes',
            [
              ...queries,
              ['customerName_lower', '>=', searchTermLower],
              ['customerName_lower', '<=', searchTermLower + '\uf8ff'],
            ]
          );

          if (customerLowerSnap) {
            customerLowerSnap.forEach((doc) => {
              if (!results.find((r) => r.id === doc.id)) {
                results.push(formatDocumentResult(doc.id, doc.data()));
              }
            });
          }
        }

        console.log(
          '🔍 [searchAccountingDocuments] Direct search found:',
          results.length
        );
      } catch (directError) {
        console.warn(
          '🔍 [searchAccountingDocuments] Direct search failed:',
          directError
        );
      }
    }

    // 🚀 STRATEGY 3: Client-side filtering (fallback for old documents)
    if (results.length < 5) {
      console.log(
        '🔍 [searchAccountingDocuments] Strategy 3: Client-side filtering'
      );

      try {
        // Get recent documents (last 3 months to limit dataset)
        const recentSnap = await checkCollection(
          'sections/account/incomes',
          [
            ...queries,
            ['created', '>=', dayjs().subtract(3, 'month').valueOf()],
          ],
          100
        ); // Limit to 100 recent documents

        if (recentSnap) {
          recentSnap.forEach((doc) => {
            // Skip if already found
            if (results.find((r) => r.id === doc.id)) {
              return;
            }

            const data = doc.data();

            // Client-side text matching across multiple fields
            const searchableFields = [
              data.incomeId,
              data.customerName,
              data.customer, // fallback field
              data.vehicleModel,
              data.description,
              data.note,
              data.remark,
              data.referenceSaleOrder,
            ].filter(Boolean);

            const searchableText = searchableFields.join(' ').toLowerCase();

            if (searchableText.includes(searchTermLower)) {
              results.push(formatDocumentResult(doc.id, data));
            }
          });

          console.log(
            '🔍 [searchAccountingDocuments] Client-side search found:',
            results.length
          );
        }
      } catch (clientSideError) {
        console.warn(
          '🔍 [searchAccountingDocuments] Client-side search failed:',
          clientSideError
        );
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = results
      .filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
      )
      .slice(0, 50);

    console.log('🔍 [searchAccountingDocuments] Final results:', {
      searchTerm,
      totalFound: uniqueResults.length,
      strategies: ['keywords', 'direct_fields', 'client_side_filtering'],
      samples: uniqueResults.slice(0, 2).map((r) => ({
        id: r.id,
        incomeId: r.saleOrderNumber,
        customer: r.customerName,
        hasKeywords: !!r.keywords,
      })),
    });

    return uniqueResults;
  } catch (error) {
    console.error('🔍 [searchAccountingDocuments] Search failed:', error);
    return [];
  }
};

/**
 * Helper function to format document result
 */
const formatDocumentResult = (docId, data) => {
  return {
    id: docId,
    saleOrderNumber: data.incomeId,
    customerName: data.customerName || data.customer || 'ไม่ระบุ',
    customerId: data.customerId || 'N/A',
    amount: data.totalAmount || data.amount || 0,
    date: data.date ? dayjs(data.date).valueOf() : dayjs().valueOf(),
    status: data.status || 'draft',
    provinceId: data.provinceId,
    branchCode: data.branchCode,
    salesPerson: data.salesPerson || data.createdBy,
    vehicleModel: data.vehicleModel || 'ไม่ระบุ',
    description: data.description || data.note || 'เอกสารรายได้ประจำวัน',
    documentType: 'accounting',
    referenceSaleOrder: data.referenceSaleOrder || null,
    // Additional fields for editing
    incomeCategory: data.incomeCategory,
    incomeSubCategory: data.incomeSubCategory,
    items: data.items || [],
    payments: data.payments || [],
    createdBy: data.createdBy,
    created: data.created,
    editedBy: data.editedBy || [],
  };
};

/**
 * 🔧 HELPER: Generate keywords for accounting documents
 * Creates searchable keywords array for better search functionality
 */
const generateAccountingDocumentKeywords = (data) => {
  const keywords = new Set();

  // Add core fields to keywords
  const searchableFields = [
    data.incomeId,
    data.customerName,
    data.customer,
    data.vehicleModel,
    data.description,
    data.note,
    data.remark,
    data.referenceSaleOrder,
  ];

  searchableFields.forEach((field) => {
    if (field && typeof field === 'string') {
      // Add full field
      keywords.add(field.toLowerCase());

      // Add individual words
      field.split(/\s+/).forEach((word) => {
        if (word.length > 1) {
          keywords.add(word.toLowerCase());
        }
      });

      // Add partial matches for numbers/codes
      if (/^[A-Z0-9-]+$/i.test(field)) {
        for (let i = 2; i <= field.length; i++) {
          keywords.add(field.substring(0, i).toLowerCase());
        }
      }
    }
  });

  return Array.from(keywords).filter((keyword) => keyword.length > 1);
};

/**
 * 🔍 ENHANCED SEARCH: Search sale documents with multiple strategies
 * Fixed to use correct collections and implement keyword searching
 */
export const searchSaleDocuments = async (
  searchTerm,
  userRBAC,
  firestore,
  category = null
) => {
  try {
    console.log('🔍 [searchSaleDocuments] Starting search', {
      searchTerm,
      userRBAC: userRBAC?.authority,
      category,
    });

    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // Build geographic filters
    let queries = [];

    if (userRBAC && !userRBAC.isDev && userRBAC.authority !== 'ADMIN') {
      let allowedProvinces =
        userRBAC.access?.geographic?.allowedProvinces ||
        userRBAC.userRBAC?.geographic?.allowedProvinces ||
        userRBAC.allowedProvinces ||
        [];

      let allowedBranches =
        userRBAC.access?.geographic?.allowedBranches ||
        userRBAC.userRBAC?.geographic?.allowedBranches ||
        userRBAC.allowedBranches ||
        [];

      if (allowedProvinces.length > 0) {
        queries.push(['provinceId', 'in', allowedProvinces]);
      } else if (allowedBranches.length > 0) {
        queries.push(['branchCode', 'in', allowedBranches]);
      }
    }

    let results = [];
    const searchTermLower = searchTerm.toLowerCase();

    // 🚀 STRATEGY 1: Search sale bookings (sections/sales/bookings)
    try {
      console.log('🔍 [searchSaleDocuments] Searching bookings...');

      // Search by bookNo
      const bookingsByNumber = await checkCollection(
        'sections/sales/bookings',
        [
          ...queries,
          ['bookNo', '>=', searchTerm.toUpperCase()],
          ['bookNo', '<=', searchTerm.toUpperCase() + '\uf8ff'],
        ]
      );

      if (bookingsByNumber) {
        bookingsByNumber.forEach((doc) => {
          const data = doc.data();
          results.push({
            id: doc.id,
            saleOrderNumber: data.bookNo,
            customerName: data.firstName || data.customerName || 'ไม่ระบุ',
            customerId: data.customerId || 'N/A',
            amount: data.amtReceived || data.amtFull || 0,
            date: data.date ? dayjs(data.date).valueOf() : dayjs().valueOf(),
            status: data.status || 'pending',
            provinceId: data.provinceId,
            branchCode: data.branchCode,
            salesPerson: data.salesPerson,
            vehicleModel: data.model || data.vehicleModel || 'ไม่ระบุ',
            description: `ใบจอง ${data.bookNo}`,
            documentType: 'booking',
            referenceSaleOrder: data.bookNo,
          });
        });
      }

      // Search by customer name if not enough results
      if (results.length < 10) {
        const bookingsByCustomer = await checkCollection(
          'sections/sales/bookings',
          [
            ...queries,
            ['firstName_lower', '>=', searchTermLower],
            ['firstName_lower', '<=', searchTermLower + '\uf8ff'],
          ]
        );

        if (bookingsByCustomer) {
          bookingsByCustomer.forEach((doc) => {
            const data = doc.data();
            // Avoid duplicates
            if (!results.find((r) => r.id === doc.id)) {
              results.push({
                id: doc.id,
                saleOrderNumber: data.bookNo,
                customerName: data.firstName || data.customerName || 'ไม่ระบุ',
                customerId: data.customerId || 'N/A',
                amount: data.amtReceived || data.amtFull || 0,
                date: data.date
                  ? dayjs(data.date).valueOf()
                  : dayjs().valueOf(),
                status: data.status || 'pending',
                provinceId: data.provinceId,
                branchCode: data.branchCode,
                salesPerson: data.salesPerson,
                vehicleModel: data.model || data.vehicleModel || 'ไม่ระบุ',
                description: `ใบจอง ${data.bookNo}`,
                documentType: 'booking',
                referenceSaleOrder: data.bookNo,
              });
            }
          });
        }
      }

      // 🚀 ENHANCED: Search by keywords if available
      if (results.length < 10) {
        console.log(
          '🔍 [searchSaleDocuments] Searching bookings by keywords...'
        );
        const bookingsByKeywords = await checkCollection(
          'sections/sales/bookings',
          [...queries, ['keywords', 'array-contains', searchTermLower]]
        );

        if (bookingsByKeywords) {
          bookingsByKeywords.forEach((doc) => {
            const data = doc.data();
            // Avoid duplicates
            if (!results.find((r) => r.id === doc.id)) {
              results.push({
                id: doc.id,
                saleOrderNumber: data.bookNo,
                customerName: data.firstName || data.customerName || 'ไม่ระบุ',
                customerId: data.customerId || 'N/A',
                amount: data.amtReceived || data.amtFull || 0,
                date: data.date
                  ? dayjs(data.date).valueOf()
                  : dayjs().valueOf(),
                status: data.status || 'pending',
                provinceId: data.provinceId,
                branchCode: data.branchCode,
                salesPerson: data.salesPerson,
                vehicleModel: data.model || data.vehicleModel || 'ไม่ระบุ',
                description: `ใบจอง ${data.bookNo}`,
                documentType: 'booking',
                referenceSaleOrder: data.bookNo,
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('🔍 [searchSaleDocuments] Booking search failed:', error);
    }

    // 🚀 STRATEGY 2: Search sale vehicles (sections/sales/vehicles)
    try {
      console.log('🔍 [searchSaleDocuments] Searching vehicles...');

      // Search by saleNo
      const vehiclesBySaleNo = await checkCollection(
        'sections/sales/vehicles',
        [
          ...queries,
          ['saleNo', '>=', searchTerm.toUpperCase()],
          ['saleNo', '<=', searchTerm.toUpperCase() + '\uf8ff'],
        ]
      );

      if (vehiclesBySaleNo) {
        vehiclesBySaleNo.forEach((doc) => {
          const data = doc.data();
          results.push({
            id: doc.id,
            saleOrderNumber: data.saleNo,
            customerName: data.firstName || data.customerName || 'ไม่ระบุ',
            customerId: data.customerId || 'N/A',
            amount: data.amtReceived || data.totalAmount || 0,
            date: data.date ? dayjs(data.date).valueOf() : dayjs().valueOf(),
            status: data.status || 'sold',
            provinceId: data.provinceId,
            branchCode: data.branchCode,
            salesPerson: data.salesPerson,
            vehicleModel: data.model || data.vehicleModel || 'ไม่ระบุ',
            description: `ใบขาย ${data.saleNo}`,
            documentType: 'sale',
            referenceSaleOrder: data.bookNo || data.saleNo,
          });
        });
      }

      // Search by customer name
      if (results.length < 20) {
        const vehiclesByCustomer = await checkCollection(
          'sections/sales/vehicles',
          [
            ...queries,
            ['firstName_lower', '>=', searchTermLower],
            ['firstName_lower', '<=', searchTermLower + '\uf8ff'],
          ]
        );

        if (vehiclesByCustomer) {
          vehiclesByCustomer.forEach((doc) => {
            const data = doc.data();
            // Avoid duplicates
            if (!results.find((r) => r.id === doc.id)) {
              results.push({
                id: doc.id,
                saleOrderNumber: data.saleNo,
                customerName: data.firstName || data.customerName || 'ไม่ระบุ',
                customerId: data.customerId || 'N/A',
                amount: data.amtReceived || data.totalAmount || 0,
                date: data.date
                  ? dayjs(data.date).valueOf()
                  : dayjs().valueOf(),
                status: data.status || 'sold',
                provinceId: data.provinceId,
                branchCode: data.branchCode,
                salesPerson: data.salesPerson,
                vehicleModel: data.model || data.vehicleModel || 'ไม่ระบุ',
                description: `ใบขาย ${data.saleNo}`,
                documentType: 'sale',
                referenceSaleOrder: data.bookNo || data.saleNo,
              });
            }
          });
        }
      }

      // 🚀 ENHANCED: Search vehicles by keywords
      if (results.length < 20) {
        console.log(
          '🔍 [searchSaleDocuments] Searching vehicles by keywords...'
        );
        const vehiclesByKeywords = await checkCollection(
          'sections/sales/vehicles',
          [...queries, ['keywords', 'array-contains', searchTermLower]]
        );

        if (vehiclesByKeywords) {
          vehiclesByKeywords.forEach((doc) => {
            const data = doc.data();
            // Avoid duplicates
            if (!results.find((r) => r.id === doc.id)) {
              results.push({
                id: doc.id,
                saleOrderNumber: data.saleNo,
                customerName: data.firstName || data.customerName || 'ไม่ระบุ',
                customerId: data.customerId || 'N/A',
                amount: data.amtReceived || data.totalAmount || 0,
                date: data.date
                  ? dayjs(data.date).valueOf()
                  : dayjs().valueOf(),
                status: data.status || 'sold',
                provinceId: data.provinceId,
                branchCode: data.branchCode,
                salesPerson: data.salesPerson,
                vehicleModel: data.model || data.vehicleModel || 'ไม่ระบุ',
                description: `ใบขาย ${data.saleNo}`,
                documentType: 'sale',
                referenceSaleOrder: data.bookNo || data.saleNo,
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('🔍 [searchSaleDocuments] Vehicle search failed:', error);
    }

    // Sort results by date (newest first)
    results.sort((a, b) => b.date - a.date);

    console.log('🔍 [searchSaleDocuments] Results:', {
      searchTerm,
      totalFound: results.length,
      bookings: results.filter((r) => r.documentType === 'booking').length,
      sales: results.filter((r) => r.documentType === 'sale').length,
    });

    return results.slice(0, 50); // Limit to 50 results
  } catch (error) {
    console.error('🔍 [searchSaleDocuments] Search failed:', error);
    return [];
  }
};

/**
 * 🔧 ENHANCED: Save accounting document with keywords for search
 * Updated to include keywords generation for better search functionality
 */
export const saveAccountingDocument = async (
  values,
  isEdit,
  user,
  firestore,
  api
) => {
  try {
    console.log('💾 [saveAccountingDocument] Saving document', {
      isEdit,
      incomeId: values.incomeId,
    });

    // Prepare document data
    const documentData = {
      ...values,
      updatedAt: dayjs().valueOf(),
      lastModifiedBy: user.uid,
    };

    // ✨ NEW: Generate keywords for search functionality
    const keywords = generateAccountingDocumentKeywords(values);
    if (keywords.length > 0) {
      documentData.keywords = keywords;
      console.log('🔍 Generated keywords for search:', keywords.slice(0, 5));
    }

    // Add customer name variations for better search
    if (values.customerName) {
      documentData.customerName_lower = values.customerName.toLowerCase();

      // Add searchable first name and last name if available
      const nameParts = values.customerName.trim().split(/\s+/);
      if (nameParts.length > 1) {
        documentData.firstName_lower = nameParts[0].toLowerCase();
        documentData.lastName_lower = nameParts
          .slice(1)
          .join(' ')
          .toLowerCase();
      }
    }

    if (!isEdit) {
      documentData.createdAt = dayjs().valueOf();
      documentData.createdBy = user.uid;
      documentData.incomeId = values.incomeId || generateIncomeId();
    }

    // Save to Firestore
    const docRef = isEdit
      ? firestore
          .collection('sections')
          .doc('account')
          .collection('incomes')
          .doc(values.id)
      : firestore
          .collection('sections')
          .doc('account')
          .collection('incomes')
          .doc();

    await docRef.set(documentData, { merge: isEdit });

    console.log('✅ [saveAccountingDocument] Document saved successfully', {
      hasKeywords: keywords.length > 0,
      keywordCount: keywords.length,
    });

    return { success: true, id: docRef.id, data: documentData };
  } catch (error) {
    console.error('❌ [saveAccountingDocument] Save failed:', error);
    throw error;
  }
};

/**
 * Get accounting document by ID
 */
export const getAccountingDocumentById = async (incomeId, firestore) => {
  try {
    console.log('📄 [getAccountingDocumentById] Fetching document:', incomeId);

    const snapshot = await checkCollection('sections/account/incomes', [
      ['incomeId', '==', incomeId],
    ]);

    if (snapshot && !snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();

      console.log('✅ [getAccountingDocumentById] Document found');
      return {
        id: doc.id,
        ...data,
      };
    }

    console.log('❌ [getAccountingDocumentById] Document not found');
    return null;
  } catch (error) {
    console.error('❌ [getAccountingDocumentById] Fetch failed:', error);
    throw error;
  }
};

/**
 * Generate new income ID
 */
export const generateIncomeId = () => {
  const timestamp = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `KBN-ACC-INC-${timestamp}-${random}`;
};
