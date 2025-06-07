// Rollback Utility for Phase 1 Migration
// Emergency rollback procedures for production safety

import { app } from '../../firebase';
import { getDatabaseInfo } from '../environmentConfig';

// Rollback data - what to remove/revert if migration needs to be rolled back
const PHASE_1_ROLLBACK_DATA = {
  provinceToRemove: "nakhon-sawan",
  branchesToRemove: ["NSN001", "NSN002", "NSN003"],
  // Additional data to revert
  revertProvinceFields: {
    existingBranches: true,    // Remove provinceId from existing branches
    existingWarehouses: true,  // Remove provinceId from existing warehouses  
    existingLocations: true,   // Remove provinceId from existing locations
    existingUsers: true        // Remove RBAC fields from existing users
  }
};

// Safety check before rollback
const validateRollbackSafety = async () => {
  const dbInfo = getDatabaseInfo();
  
  console.log('🚨 ROLLBACK SAFETY CHECK');
  console.log(`Environment: ${dbInfo.environment}`);
  console.log(`Project: ${dbInfo.projectId}`);
  
  if (dbInfo.isProduction) {
    const confirmation = window.confirm(
      `⚠️ PRODUCTION ROLLBACK WARNING ⚠️\n\n` +
      `You are about to REMOVE data from LIVE production database.\n` +
      `This will delete:\n` +
      `• Nakhon Sawan province\n` +
      `• 3 branches: NSN001, NSN002, NSN003\n\n` +
      `Are you sure you want to proceed?`
    );
    
    if (!confirmation) {
      throw new Error('Rollback cancelled by user');
    }
    
    const finalConfirm = window.prompt(
      'Type "ROLLBACK PRODUCTION" to confirm:'
    );
    
    if (finalConfirm !== 'ROLLBACK PRODUCTION') {
      throw new Error('Rollback confirmation failed');
    }
  }
  
  return dbInfo;
};

// Check if Phase 1 migration exists (safe to rollback)
const checkMigrationExists = async () => {
  const firestore = app.firestore();
  
  try {
    // Check if Nakhon Sawan province exists
    const provinceRef = firestore.collection('data').doc('company').collection('provinces').doc(PHASE_1_ROLLBACK_DATA.provinceToRemove);
    const provinceDoc = await provinceRef.get();
    
    // Check if NSN branches exist
    const branchChecks = await Promise.all(
      PHASE_1_ROLLBACK_DATA.branchesToRemove.map(async (branchCode) => {
        const branchRef = firestore.collection('data').doc('company').collection('branches').doc(branchCode);
        const branchDoc = await branchRef.get();
        return { branchCode, exists: branchDoc.exists };
      })
    );
    
    return {
      provinceExists: provinceDoc.exists,
      branches: branchChecks,
      canRollback: provinceDoc.exists || branchChecks.some(b => b.exists)
    };
  } catch (error) {
    console.error('Error checking migration existence:', error);
    throw error;
  }
};

// Execute rollback - remove Phase 1 migration data AND revert existing data changes
const executeRollback = async () => {
  const firestore = app.firestore();
  const batch = firestore.batch();
  
  try {
    console.log('🔄 Starting rollback...');
    
    // 1. Remove Nakhon Sawan province
    const provinceRef = firestore.collection('data').doc('company').collection('provinces').doc(PHASE_1_ROLLBACK_DATA.provinceToRemove);
    batch.delete(provinceRef);
    console.log(`Queued province deletion: ${PHASE_1_ROLLBACK_DATA.provinceToRemove}`);
    
    // 2. Remove NSN branches
    for (const branchCode of PHASE_1_ROLLBACK_DATA.branchesToRemove) {
      const branchRef = firestore.collection('data').doc('company').collection('branches').doc(branchCode);
      batch.delete(branchRef);
      console.log(`Queued branch deletion: ${branchCode}`);
    }
    
    // Execute batch deletion first
    await batch.commit();
    console.log('✅ Deleted new data successfully');
    
    // 3. Revert province information from existing data
    if (PHASE_1_ROLLBACK_DATA.revertProvinceFields.existingBranches) {
      console.log('🔄 Reverting province information from existing branches...');
      await revertExistingBranchesProvinceInfo();
    }
    
    if (PHASE_1_ROLLBACK_DATA.revertProvinceFields.existingWarehouses) {
      console.log('🔄 Reverting province information from existing warehouses...');
      await revertExistingWarehousesProvinceInfo();
    }
    
    if (PHASE_1_ROLLBACK_DATA.revertProvinceFields.existingLocations) {
      console.log('🔄 Reverting province information from existing locations...');
      await revertExistingLocationsProvinceInfo();
    }
    
    if (PHASE_1_ROLLBACK_DATA.revertProvinceFields.existingUsers) {
      console.log('🔄 Reverting RBAC information from existing users...');
      await revertExistingUsersRBACInfo();
    }
    
    console.log('✅ Rollback completed successfully');
    
    return {
      success: true,
      message: 'Rollback completed successfully - new data deleted and existing data reverted',
      deletedProvince: PHASE_1_ROLLBACK_DATA.provinceToRemove,
      deletedBranches: PHASE_1_ROLLBACK_DATA.branchesToRemove,
      revertedFields: PHASE_1_ROLLBACK_DATA.revertProvinceFields
    };
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

/**
 * Revert province information from existing branches
 */
const revertExistingBranchesProvinceInfo = async () => {
  try {
    const firestore = app.firestore();
    const branchesRef = firestore.collection('data').doc('company').collection('branches');
    const branchesSnap = await branchesRef.get();
    
    const updatePromises = [];
    
    branchesSnap.forEach(doc => {
      const branchData = doc.data();
      const branchCode = doc.id;
      
      // Skip NSN branches (they should be deleted already)
      if (branchCode.startsWith('NSN')) {
        return;
      }
      
      // Only revert if it has provinceId field
      if (branchData.provinceId) {
        const updatedBranch = { ...branchData };
        delete updatedBranch.provinceId;
        updatedBranch.updatedAt = Date.now();
        
        updatePromises.push(
          branchesRef.doc(branchCode).update(updatedBranch)
            .then(() => console.log(`✅ Reverted province info from branch ${branchCode}`))
            .catch(error => console.error(`❌ Error reverting branch ${branchCode}:`, error))
        );
      }
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished reverting existing branches province information');
    
  } catch (error) {
    console.error('❌ Error reverting existing branches:', error);
    throw error;
  }
};

/**
 * Revert province information from existing warehouses
 */
const revertExistingWarehousesProvinceInfo = async () => {
  try {
    const firestore = app.firestore();
    const warehousesRef = firestore.collection('data').doc('company').collection('warehouses');
    const warehousesSnap = await warehousesRef.get();
    
    const updatePromises = [];
    
    warehousesSnap.forEach(doc => {
      const warehouseData = doc.data();
      const warehouseId = doc.id;
      
      // Skip NSN warehouses (they should be deleted already)
      if (warehouseId.includes('nsn')) {
        return;
      }
      
      // Only revert if it has provinceId field
      if (warehouseData.provinceId) {
        const updatedWarehouse = { ...warehouseData };
        delete updatedWarehouse.provinceId;
        updatedWarehouse.updatedAt = Date.now();
        
        updatePromises.push(
          warehousesRef.doc(warehouseId).update(updatedWarehouse)
            .then(() => console.log(`✅ Reverted province info from warehouse ${warehouseId}`))
            .catch(error => console.error(`❌ Error reverting warehouse ${warehouseId}:`, error))
        );
      }
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished reverting existing warehouses province information');
    
  } catch (error) {
    console.error('❌ Error reverting existing warehouses:', error);
    throw error;
  }
};

/**
 * Revert province information from existing locations
 */
const revertExistingLocationsProvinceInfo = async () => {
  try {
    const firestore = app.firestore();
    const locationsRef = firestore.collection('data').doc('company').collection('locations');
    const locationsSnap = await locationsRef.get();
    
    const updatePromises = [];
    
    locationsSnap.forEach(doc => {
      const locationData = doc.data();
      const locationId = doc.id;
      
      // Skip NSN locations (they should be deleted already)
      if (locationId.includes('nsn')) {
        return;
      }
      
      // Only revert if it has provinceId field
      if (locationData.provinceId) {
        const updatedLocation = { ...locationData };
        delete updatedLocation.provinceId;
        updatedLocation.updatedAt = Date.now();
        
        updatePromises.push(
          locationsRef.doc(locationId).update(updatedLocation)
            .then(() => console.log(`✅ Reverted province info from location ${locationId}`))
            .catch(error => console.error(`❌ Error reverting location ${locationId}:`, error))
        );
      }
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished reverting existing locations province information');
    
  } catch (error) {
    console.error('❌ Error reverting existing locations:', error);
    throw error;
  }
};

/**
 * Revert RBAC information from existing users
 */
const revertExistingUsersRBACInfo = async () => {
  try {
    const firestore = app.firestore();
    const usersRef = firestore.collection('users');
    const usersSnap = await usersRef.get();
    
    const updatePromises = [];
    
    usersSnap.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Only revert if user has RBAC fields
      if (userData.accessLevel || userData.allowedProvinces || userData.allowedBranches) {
        const updatedUser = { ...userData };
        
        // Remove RBAC fields added by migration
        delete updatedUser.accessLevel;
        delete updatedUser.allowedProvinces;
        delete updatedUser.allowedBranches;
        delete updatedUser.homeProvince;
        delete updatedUser.homeBranch;
        delete updatedUser.permissions;
        updatedUser.updatedAt = Date.now();
        
        updatePromises.push(
          usersRef.doc(userId).update(updatedUser)
            .then(() => console.log(`✅ Reverted RBAC info from user ${userId}`))
            .catch(error => console.error(`❌ Error reverting user ${userId}:`, error))
        );
      }
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished reverting existing users RBAC information');
    
  } catch (error) {
    console.error('❌ Error reverting existing users:', error);
    throw error;
  }
};

// Main rollback function
export const executePhase1Rollback = async () => {
  try {
    console.log('🚨 Phase 1 Migration Rollback Started');
    
    // Step 1: Safety validation
    const dbInfo = await validateRollbackSafety();
    
    // Step 2: Check what exists to rollback
    const migrationStatus = await checkMigrationExists();
    
    if (!migrationStatus.canRollback) {
      console.log('ℹ️ No Phase 1 migration data found to rollback');
      return {
        success: true,
        message: 'No rollback needed - migration data not found',
        details: migrationStatus
      };
    }
    
    console.log('📋 Rollback Status:');
    console.log(`  Province exists: ${migrationStatus.provinceExists ? '✅' : '❌'}`);
    migrationStatus.branches.forEach(b => {
      console.log(`  Branch ${b.branchCode}: ${b.exists ? '✅' : '❌'}`);
    });
    
    // Step 3: Execute rollback
    const rollbackResult = await executeRollback();
    
    // Step 4: Verify rollback
    const verificationStatus = await checkMigrationExists();
    if (verificationStatus.canRollback) {
      console.warn('⚠️ Some data may still exist after rollback');
    } else {
      console.log('✅ Rollback verification passed - all data removed');
    }
    
    console.log('🎯 Phase 1 Rollback Completed Successfully');
    
    if (dbInfo.isProduction) {
      console.log('🔴 PRODUCTION ROLLBACK COMPLETED');
      console.log('🔴 Please verify system functionality');
    }
    
    return rollbackResult;
    
  } catch (error) {
    console.error('❌ Rollback Error:', error);
    
    if (getDatabaseInfo().isProduction) {
      console.error('🔴 PRODUCTION ROLLBACK FAILED');
      console.error('🔴 Manual intervention may be required');
    }
    
    throw error;
  }
};

// Verification utility - check current state
export const verifyCurrentState = async () => {
  try {
    console.log('🔍 Verifying current database state...');
    
    const firestore = app.firestore();
    
    // Check provinces
    const provincesRef = firestore.collection('data').doc('company').collection('provinces');
    const provincesSnap = await provincesRef.get();
    
    const provinces = {};
    provincesSnap.forEach(doc => {
      provinces[doc.id] = doc.data();
    });
    
    // Check branches
    const branchesRef = firestore.collection('data').doc('company').collection('branches');
    const branchesSnap = await branchesRef.get();
    
    const branches = {};
    branchesSnap.forEach(doc => {
      branches[doc.id] = doc.data();
    });
    
    // Analyze structure
    const analysis = {
      provinces: Object.keys(provinces),
      branches: Object.keys(branches),
      nakhonRatchasimaExists: 'nakhon-ratchasima' in provinces,
      nakhonSawanExists: 'nakhon-sawan' in provinces,
      nsnBranches: Object.keys(branches).filter(code => code.startsWith('NSN')),
      totalProvinces: Object.keys(provinces).length,
      totalBranches: Object.keys(branches).length
    };
    
    console.log('📊 Current Database State:');
    console.log(`  Total Provinces: ${analysis.totalProvinces}`);
    console.log(`  Total Branches: ${analysis.totalBranches}`);
    console.log(`  Nakhon Ratchasima: ${analysis.nakhonRatchasimaExists ? '✅' : '❌'}`);
    console.log(`  Nakhon Sawan: ${analysis.nakhonSawanExists ? '✅' : '❌'}`);
    console.log(`  NSN Branches: ${analysis.nsnBranches.length} (${analysis.nsnBranches.join(', ')})`);
    
    return {
      success: true,
      provinces,
      branches,
      analysis
    };
    
  } catch (error) {
    console.error('❌ State verification failed:', error);
    throw error;
  }
};

// Development environment check
if (process.env.NODE_ENV === 'development') {
  // Export for development testing
  window.KBN_ROLLBACK = {
    executePhase1Rollback,
    verifyCurrentState,
    checkMigrationExists
  };
} 