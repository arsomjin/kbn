/**
 * 🧪 TEST SEARCH MECHANISM
 *
 * Simple test to verify the search functionality is working
 */

import { searchAccountingDocuments } from '../Modules/Account/screens/Income/IncomeDaily/api';

// Test function that can be called from browser console
export const testSearch = async (searchTerm = 'KBN') => {
  console.log('🧪 TESTING SEARCH MECHANISM');
  console.log('='.repeat(50));

  try {
    // Get Firebase instance
    const firebase = window.firebase;
    const firestore = firebase.firestore();

    // Mock user RBAC for testing
    const mockUserRBAC = {
      authority: 'STAFF',
      allowedProvinces: ['NMA'], // Nakhon Ratchasima
      allowedBranches: ['0450', 'NMA002', 'NMA003'],
      isDev: false,
    };

    console.log('🔍 Testing search with term:', searchTerm);
    console.log('👤 Mock user RBAC:', mockUserRBAC);
    console.log('');

    // Test the search function
    const results = await searchAccountingDocuments(
      searchTerm,
      mockUserRBAC,
      firestore
    );

    console.log('📊 SEARCH RESULTS:');
    console.log(`✅ Found ${results.length} documents`);

    if (results.length > 0) {
      console.log('📋 Sample results:');
      results.slice(0, 5).forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.saleOrderNumber} - ${result.customerName}`
        );
        console.log(
          `   Province: ${result.provinceId}, Branch: ${result.branchCode}`
        );
        console.log(
          `   Amount: ${result.amount}, Date: ${new Date(result.date).toLocaleDateString()}`
        );
        console.log('');
      });
    } else {
      console.log('❌ No results found');
      console.log('💡 Try different search terms like:');
      console.log('   - "KBN" (for document IDs)');
      console.log('   - Customer names');
      console.log('   - Vehicle models');
    }

    return results;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return [];
  }
};

// Test with admin permissions
export const testSearchAdmin = async (searchTerm = 'KBN') => {
  console.log('🧪 TESTING SEARCH WITH ADMIN PERMISSIONS');
  console.log('='.repeat(50));

  try {
    const firebase = window.firebase;
    const firestore = firebase.firestore();

    // Mock admin user
    const adminUserRBAC = {
      authority: 'ADMIN',
      isDev: true,
      allowedProvinces: [], // Admin has access to all
      allowedBranches: [],
    };

    console.log('🔍 Testing admin search with term:', searchTerm);

    const results = await searchAccountingDocuments(
      searchTerm,
      adminUserRBAC,
      firestore
    );

    console.log('📊 ADMIN SEARCH RESULTS:');
    console.log(`✅ Found ${results.length} documents`);

    if (results.length > 0) {
      console.log('📋 Sample results:');
      results.slice(0, 3).forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.saleOrderNumber} - ${result.customerName}`
        );
      });
    }

    return results;
  } catch (error) {
    console.error('❌ Admin test failed:', error);
    return [];
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testSearch = testSearch;
  window.testSearchAdmin = testSearchAdmin;

  console.log('🧪 Test functions loaded! Use in browser console:');
  console.log('- testSearch("your-search-term")');
  console.log('- testSearchAdmin("your-search-term")');
}
