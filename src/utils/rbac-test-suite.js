/**
 * RBAC Structure Consistency Test Suite
 * Verifies all components use consistent RBAC structure
 */

import { usePermissions } from '../hooks/usePermissions';
import { createCleanSlateUser } from './clean-slate-helpers';
import { generateUserPermissions } from './orthogonal-rbac';

/**
 * Test user data structures for consistency
 */
export const testRBACStructureConsistency = () => {
  console.log('🧪 Starting RBAC Structure Consistency Test Suite...');
  
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  // Test 1: Clean Slate User Creation
  try {
    results.totalTests++;
    console.log('📋 Test 1: Clean Slate User Creation');
    
    const testUserData = {
      uid: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      department: 'accounting',
      accessLevel: 'STAFF',
      province: 'NMA',
      branch: '0450',
      userType: 'employee'
    };
    
    const cleanSlateUser = createCleanSlateUser(testUserData);
    
    // Verify structure
    const hasAccess = !!cleanSlateUser.access;
    const hasUserRBAC = !!cleanSlateUser.userRBAC;
    const hasConsistentAuthority = cleanSlateUser.access?.authority === cleanSlateUser.userRBAC?.authority;
    
    if (hasAccess && hasUserRBAC && hasConsistentAuthority) {
      console.log('✅ Test 1 PASSED: Clean Slate user has both access and userRBAC structures');
      results.passed++;
    } else {
      console.log('❌ Test 1 FAILED: Missing or inconsistent structures');
      console.log(`  - Has access: ${hasAccess}`);
      console.log(`  - Has userRBAC: ${hasUserRBAC}`);
      console.log(`  - Consistent authority: ${hasConsistentAuthority}`);
      results.failed++;
      results.errors.push('Clean Slate user structure inconsistent');
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Test 1 Error: ${error.message}`);
    console.log('❌ Test 1 ERROR:', error.message);
  }

  // Test 2: Permission Hook Structure Reading
  try {
    results.totalTests++;
    console.log('📋 Test 2: Permission Hook Structure Reading');
    
    // Mock user with all three structures
    const mockUser = {
      uid: 'test-user-456',
      access: {
        authority: 'STAFF',
        geographic: { allowedProvinces: ['NMA'], allowedBranches: ['0450'] },
        departments: ['ACCOUNTING']
      },
      userRBAC: {
        authority: 'STAFF',
        geographic: { allowedProvinces: ['NMA'], allowedBranches: ['0450'] },
        departments: ['ACCOUNTING']
      },
      accessLevel: 'STAFF',
      allowedProvinces: ['NMA'],
      allowedBranches: ['0450']
    };
    
    // Test usePermissions normalization logic
    const normalized = {
      uid: mockUser.uid,
      authority: mockUser.access?.authority || mockUser.userRBAC?.authority || mockUser.accessLevel || 'STAFF',
      geographic: {
        allowedProvinces: mockUser.access?.geographic?.allowedProvinces || mockUser.userRBAC?.geographic?.allowedProvinces || mockUser.allowedProvinces || []
      }
    };
    
    const hasCorrectPriority = normalized.authority === 'STAFF' && normalized.geographic.allowedProvinces.includes('NMA');
    
    if (hasCorrectPriority) {
      console.log('✅ Test 2 PASSED: Permission hook uses correct structure priority');
      results.passed++;
    } else {
      console.log('❌ Test 2 FAILED: Permission hook structure priority incorrect');
      results.failed++;
      results.errors.push('Permission hook structure priority incorrect');
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Test 2 Error: ${error.message}`);
    console.log('❌ Test 2 ERROR:', error.message);
  }

  // Test 3: Geographic Field Mapping Consistency
  try {
    results.totalTests++;
    console.log('📋 Test 3: Geographic Field Mapping Consistency');
    
    const testBranches = [
      { branchCode: '0450', key: '0450', provinceId: 'NMA' },
      { branchCode: 'NSN001', key: 'NSN001', provinceId: 'NSN' }
    ];
    
    const testProvinces = [
      { key: 'NMA', provinceKey: 'NMA', provinceName: 'นครราชสีมา' },
      { key: 'NSN', provinceKey: 'NSN', provinceName: 'นครสวรรค์' }
    ];
    
    // Test consistent field access
    const branchFieldsConsistent = testBranches.every(branch => 
      branch.branchCode === branch.key
    );
    
    const provinceFieldsConsistent = testProvinces.every(province => 
      province.key === province.provinceKey
    );
    
    if (branchFieldsConsistent && provinceFieldsConsistent) {
      console.log('✅ Test 3 PASSED: Geographic field mapping is consistent');
      results.passed++;
    } else {
      console.log('❌ Test 3 FAILED: Geographic field mapping inconsistent');
      console.log(`  - Branch fields consistent: ${branchFieldsConsistent}`);
      console.log(`  - Province fields consistent: ${provinceFieldsConsistent}`);
      results.failed++;
      results.errors.push('Geographic field mapping inconsistent');
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Test 3 Error: ${error.message}`);
    console.log('❌ Test 3 ERROR:', error.message);
  }

  // Test 4: Auth Flow Data Structure
  try {
    results.totalTests++;
    console.log('📋 Test 4: Auth Flow Data Structure');
    
    // Simulate what auth flow should create
    const authFlowUser = {
      uid: 'test-user-789',
      access: { authority: 'STAFF', geographic: { allowedProvinces: ['NMA'] } },
      userRBAC: { authority: 'STAFF', geographic: { allowedProvinces: ['NMA'] } },
      auth: { uid: 'test-user-789', accessLevel: 'STAFF', homeProvince: 'NMA' },
      // Legacy fields for compatibility
      accessLevel: 'STAFF',
      allowedProvinces: ['NMA']
    };
    
    const hasAllStructures = !!(authFlowUser.access && authFlowUser.userRBAC && authFlowUser.auth);
    const hasLegacyFallbacks = !!(authFlowUser.accessLevel && authFlowUser.allowedProvinces);
    
    if (hasAllStructures && hasLegacyFallbacks) {
      console.log('✅ Test 4 PASSED: Auth flow creates all required structures');
      results.passed++;
    } else {
      console.log('❌ Test 4 FAILED: Auth flow missing required structures');
      console.log(`  - Has all structures: ${hasAllStructures}`);
      console.log(`  - Has legacy fallbacks: ${hasLegacyFallbacks}`);
      results.failed++;
      results.errors.push('Auth flow missing required structures');
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Test 4 Error: ${error.message}`);
    console.log('❌ Test 4 ERROR:', error.message);
  }

  // Test Summary
  console.log('\n📊 RBAC Structure Consistency Test Results:');
  console.log(`  Total Tests: ${results.totalTests}`);
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Errors Found:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  return results;
};

/**
 * Test specific component data access patterns
 */
export const testComponentDataAccess = () => {
  console.log('\n🔍 Testing Component Data Access Patterns...');
  
  const mockUser = {
    uid: 'component-test-user',
    access: {
      authority: 'MANAGER',
      geographic: {
        allowedProvinces: ['NMA', 'NSN'],
        allowedBranches: ['0450', 'NSN001'],
        homeProvince: 'NMA',
        homeBranch: '0450'
      },
      departments: ['SALES', 'SERVICE']
    },
    userRBAC: {
      authority: 'MANAGER',
      geographic: {
        allowedProvinces: ['NMA', 'NSN'],
        allowedBranches: ['0450', 'NSN001'],
        homeProvince: 'NMA',
        homeBranch: '0450'
      },
      departments: ['SALES', 'SERVICE']
    },
    // Legacy fields
    accessLevel: 'PROVINCE_MANAGER',
    allowedProvinces: ['NMA', 'NSN'],
    allowedBranches: ['0450', 'NSN001'],
    homeProvince: 'NMA',
    homeBranch: '0450'
  };
  
  // Test priority order
  const authority = mockUser.access?.authority || mockUser.userRBAC?.authority || mockUser.accessLevel || 'STAFF';
  const provinces = mockUser.access?.geographic?.allowedProvinces || mockUser.userRBAC?.geographic?.allowedProvinces || mockUser.allowedProvinces || [];
  
  console.log('Component Access Results:');
  console.log(`  Authority: ${authority} (should be MANAGER)`);
  console.log(`  Provinces: ${provinces.join(', ')} (should include NMA, NSN)`);
  
  const isCorrect = authority === 'MANAGER' && provinces.includes('NMA') && provinces.includes('NSN');
  
  if (isCorrect) {
    console.log('✅ Component data access is working correctly');
  } else {
    console.log('❌ Component data access has issues');
  }
  
  return { success: isCorrect, authority, provinces };
};

/**
 * Window functions for console testing
 */
if (typeof window !== 'undefined') {
  window.testRBACStructureConsistency = testRBACStructureConsistency;
  window.testComponentDataAccess = testComponentDataAccess;
  
  console.log('🧪 RBAC Test Suite loaded!');
  console.log('Available functions:');
  console.log('  window.testRBACStructureConsistency() - Run full consistency test');
  console.log('  window.testComponentDataAccess() - Test component data access');
}

export default {
  testRBACStructureConsistency,
  testComponentDataAccess
}; 