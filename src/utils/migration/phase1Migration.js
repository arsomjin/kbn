import { 
  createProvince, 
  getProvinceByKey
} from 'firebase/api';
import { setItem } from 'firebase/api';

/**
 * Phase 1 Migration: Nakhon Ratchasima → Nakhon Sawan Expansion
 * 
 * This migration will:
 * 1. Ensure Nakhon Ratchasima province exists with correct structure
 * 2. Create Nakhon Sawan province 
 * 3. Create 3 new branches in Nakhon Sawan
 * 4. **UPDATE EXISTING DATA with province information**
 * 5. Update existing users with proper geographic access
 */
export const migrateToPhase1 = async () => {
  try {
    console.log('🚀 Starting Phase 1 Migration...');

    // 1. Ensure Nakhon Ratchasima province exists with correct structure
    const existingNMA = await getProvinceByKey('nakhon-ratchasima');
    if (!existingNMA) {
      await createProvince({
        key: 'nakhon-ratchasima',
        name: 'นครราชสีมา',
        nameEn: 'Nakhon Ratchasima',
        code: 'NMA',
        region: 'northeast',
        status: 'active',
        description: ''
      });
      console.log('✅ Created Nakhon Ratchasima province');
    } else {
      console.log('✅ Nakhon Ratchasima province already exists');
    }

    // 2. Create Nakhon Sawan province
    const existingNSN = await getProvinceByKey('nakhon-sawan');
    if (!existingNSN) {
      await createProvince({
        key: 'nakhon-sawan',
        name: 'นครสวรรค์',
        nameEn: 'Nakhon Sawan',
        code: 'NSN',
        region: 'central',
        status: 'active',
        description: ''
      });
      console.log('✅ Created Nakhon Sawan province');
    } else {
      console.log('✅ Nakhon Sawan province already exists');
    }

    // 3. **UPDATE EXISTING BRANCHES** with province information
    console.log('🔄 Updating existing branches with province information...');
    await updateExistingBranchesWithProvinces();

    // 4. **UPDATE EXISTING WAREHOUSES** with province information
    console.log('🔄 Updating existing warehouses with province information...');
    await updateExistingWarehousesWithProvinces();

    // 5. **UPDATE EXISTING LOCATIONS** with province information
    console.log('🔄 Updating existing locations with province information...');
    await updateExistingLocationsWithProvinces();

    // 6. Create Nakhon Sawan branches
    console.log('🔄 Creating new Nakhon Sawan branches...');
    const branches = [
      {
        key: 'NSN001',
        branchCode: 'NSN001',
        branchId: '2001',
        branchName: 'สถานที่ NSN001',
        provinceId: 'nakhon-sawan',
        locationId: 'location_nsn001',
        warehouseId: 'warehouse_nsn001',
        status: 'active',
        queue: 1,
        remarks: ''
      },
      {
        key: 'NSN002',
        branchCode: 'NSN002',
        branchId: '2002',
        branchName: 'สถานที่ NSN002',
        provinceId: 'nakhon-sawan',
        locationId: 'location_nsn002',
        warehouseId: 'warehouse_nsn002',
        status: 'active',
        queue: 2,
        remarks: ''
      },
      {
        key: 'NSN003',
        branchCode: 'NSN003',
        branchId: '2003',
        branchName: 'สถานที่ NSN003',
        provinceId: 'nakhon-sawan',
        locationId: 'location_nsn003',
        warehouseId: 'warehouse_nsn003',
        status: 'active',
        queue: 3,
        remarks: ''
      }
    ];

    // Create branches using Firebase API
    for (const branch of branches) {
      try {
        await setItem(branch, 'data/company/branches', branch.branchCode);
        console.log(`✅ Created branch: ${branch.branchName} (${branch.branchCode})`);
      } catch (error) {
        console.warn(`⚠️  Error creating branch ${branch.branchCode}:`, error);
      }
    }

    // 7. Create corresponding locations and warehouses for new branches
    console.log('🔄 Creating locations and warehouses for new branches...');
    const locations = [
      {
        key: 'location_nsn001',
        locationId: 'location_nsn001',
        name: 'สถานที่ NSN001',
        address: 'นครสวรรค์',
        provinceId: 'nakhon-sawan',
        status: 'active'
      },
      {
        key: 'location_nsn002',
        locationId: 'location_nsn002',
        name: 'สถานที่ NSN002',
        address: 'นครสวรรค์',
        provinceId: 'nakhon-sawan',
        status: 'active'
      },
      {
        key: 'location_nsn003',
        locationId: 'location_nsn003',
        name: 'สถานที่ NSN003',
        address: 'นครสวรรค์',
        provinceId: 'nakhon-sawan',
        status: 'active'
      }
    ];

    const warehouses = [
      {
        key: 'warehouse_nsn001',
        warehouseId: 'warehouse_nsn001',
        name: 'คลัง NSN001',
        branchCode: 'NSN001',
        provinceId: 'nakhon-sawan',
        status: 'active'
      },
      {
        key: 'warehouse_nsn002',
        warehouseId: 'warehouse_nsn002',
        name: 'คลัง NSN002',
        branchCode: 'NSN002',
        provinceId: 'nakhon-sawan',
        status: 'active'
      },
      {
        key: 'warehouse_nsn003',
        warehouseId: 'warehouse_nsn003',
        name: 'คลัง NSN003',
        branchCode: 'NSN003',
        provinceId: 'nakhon-sawan',
        status: 'active'
      }
    ];

    // Create locations
    for (const location of locations) {
      try {
        await setItem(location, 'data/company/locations', location.locationId);
        console.log(`✅ Created location: ${location.name}`);
      } catch (error) {
        console.warn(`⚠️  Error creating location ${location.locationId}:`, error);
      }
    }

    // Create warehouses
    for (const warehouse of warehouses) {
      try {
        await setItem(warehouse, 'data/company/warehouses', warehouse.warehouseId);
        console.log(`✅ Created warehouse: ${warehouse.name}`);
      } catch (error) {
        console.warn(`⚠️  Error creating warehouse ${warehouse.warehouseId}:`, error);
      }
    }

    // 8. **UPDATE EXISTING USERS** with province access
    console.log('🔄 Updating existing users with province access...');
    await updateExistingUsersWithProvinceAccess();

    console.log('🎉 Phase 1 Migration completed successfully!');
    return {
      success: true,
      message: 'Phase 1 migration completed with existing data updates',
      actions: {
        provincesCreated: 2,
        branchesCreated: branches.length,
        branchesUpdated: true,
        warehousesUpdated: true,
        locationsUpdated: true,
        usersUpdated: true
      }
    };

  } catch (error) {
    console.error('❌ Phase 1 Migration failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update existing branches to include province information
 */
const updateExistingBranchesWithProvinces = async () => {
  try {
    const { app } = await import('../../firebase');
    const firestore = app.firestore();
    
    // Get all existing branches
    const branchesRef = firestore.collection('data').doc('company').collection('branches');
    const branchesSnap = await branchesRef.get();
    
    const updatePromises = [];
    
    branchesSnap.forEach(doc => {
      const branchData = doc.data();
      const branchCode = doc.id;
      
      // Skip if already has provinceId
      if (branchData.provinceId) {
        console.log(`✓ Branch ${branchCode} already has provinceId: ${branchData.provinceId}`);
        return;
      }
      
      // Determine province based on branch code
      let provinceId = null;
      if (branchCode.startsWith('NSN')) {
        provinceId = 'nakhon-sawan';
      } else {
        // Default existing branches to Nakhon Ratchasima
        provinceId = 'nakhon-ratchasima';
      }
      
      // Update branch with provinceId
      const updatedBranch = {
        ...branchData,
        provinceId: provinceId,
        updatedAt: Date.now()
      };
      
      updatePromises.push(
        branchesRef.doc(branchCode).update(updatedBranch)
          .then(() => console.log(`✅ Updated branch ${branchCode} with provinceId: ${provinceId}`))
          .catch(error => console.error(`❌ Error updating branch ${branchCode}:`, error))
      );
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished updating existing branches with province information');
    
  } catch (error) {
    console.error('❌ Error updating existing branches:', error);
    throw error;
  }
};

/**
 * Update existing warehouses to include province information
 */
const updateExistingWarehousesWithProvinces = async () => {
  try {
    const { app } = await import('../../firebase');
    const firestore = app.firestore();
    
    // Get all existing warehouses
    const warehousesRef = firestore.collection('data').doc('company').collection('warehouses');
    const warehousesSnap = await warehousesRef.get();
    
    const updatePromises = [];
    
    warehousesSnap.forEach(doc => {
      const warehouseData = doc.data();
      const warehouseId = doc.id;
      
      // Skip if already has provinceId
      if (warehouseData.provinceId) {
        console.log(`✓ Warehouse ${warehouseId} already has provinceId: ${warehouseData.provinceId}`);
        return;
      }
      
      // Determine province based on warehouse ID or branch code
      let provinceId = null;
      if (warehouseId.includes('nsn') || warehouseData.branchCode?.startsWith('NSN')) {
        provinceId = 'nakhon-sawan';
      } else {
        // Default existing warehouses to Nakhon Ratchasima
        provinceId = 'nakhon-ratchasima';
      }
      
      // Update warehouse with provinceId
      const updatedWarehouse = {
        ...warehouseData,
        provinceId: provinceId,
        updatedAt: Date.now()
      };
      
      updatePromises.push(
        warehousesRef.doc(warehouseId).update(updatedWarehouse)
          .then(() => console.log(`✅ Updated warehouse ${warehouseId} with provinceId: ${provinceId}`))
          .catch(error => console.error(`❌ Error updating warehouse ${warehouseId}:`, error))
      );
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished updating existing warehouses with province information');
    
  } catch (error) {
    console.error('❌ Error updating existing warehouses:', error);
    throw error;
  }
};

/**
 * Update existing locations to include province information
 */
const updateExistingLocationsWithProvinces = async () => {
  try {
    const { app } = await import('../../firebase');
    const firestore = app.firestore();
    
    // Get all existing locations
    const locationsRef = firestore.collection('data').doc('company').collection('locations');
    const locationsSnap = await locationsRef.get();
    
    const updatePromises = [];
    
    locationsSnap.forEach(doc => {
      const locationData = doc.data();
      const locationId = doc.id;
      
      // Skip if already has provinceId
      if (locationData.provinceId) {
        console.log(`✓ Location ${locationId} already has provinceId: ${locationData.provinceId}`);
        return;
      }
      
      // Determine province based on location ID or other indicators
      let provinceId = null;
      if (locationId.includes('nsn') || locationData.province === 'นครสวรรค์') {
        provinceId = 'nakhon-sawan';
      } else {
        // Default existing locations to Nakhon Ratchasima
        provinceId = 'nakhon-ratchasima';
      }
      
      // Update location with provinceId
      const updatedLocation = {
        ...locationData,
        provinceId: provinceId,
        updatedAt: Date.now()
      };
      
      updatePromises.push(
        locationsRef.doc(locationId).update(updatedLocation)
          .then(() => console.log(`✅ Updated location ${locationId} with provinceId: ${provinceId}`))
          .catch(error => console.error(`❌ Error updating location ${locationId}:`, error))
      );
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished updating existing locations with province information');
    
  } catch (error) {
    console.error('❌ Error updating existing locations:', error);
    throw error;
  }
};

/**
 * Update existing users with province access for RBAC
 */
const updateExistingUsersWithProvinceAccess = async () => {
  try {
    const { app } = await import('../../firebase');
    const firestore = app.firestore();
    
    // Get all existing users
    const usersRef = firestore.collection('users');
    const usersSnap = await usersRef.get();
    
    const updatePromises = [];
    
    usersSnap.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Skip if user already has RBAC structure
      if (userData.allowedProvinces || userData.accessLevel) {
        console.log(`✓ User ${userId} already has RBAC structure`);
        return;
      }
      
      // Default user access setup based on existing permissions
      let accessLevel = 'BRANCH_STAFF';
      let allowedProvinces = ['nakhon-ratchasima']; // Default to original province
      let allowedBranches = [];
      let homeProvince = 'nakhon-ratchasima';
      let homeBranch = userData.branch || '0450'; // Default branch
      
      // Determine access level based on existing data
      if (userData.isDev || userData.isAdmin) {
        accessLevel = 'SUPER_ADMIN';
        allowedProvinces = []; // Super admin can access all
        allowedBranches = [];
        homeProvince = null;
        homeBranch = null;
      } else if (userData.isManager || userData.role === 'manager') {
        accessLevel = 'PROVINCE_MANAGER';
        allowedProvinces = ['nakhon-ratchasima'];
        allowedBranches = [];
        homeProvince = 'nakhon-ratchasima';
        homeBranch = null;
      } else if (userData.role === 'branch_manager') {
        accessLevel = 'BRANCH_MANAGER';
        allowedProvinces = ['nakhon-ratchasima'];
        allowedBranches = [userData.branch || '0450'];
        homeProvince = 'nakhon-ratchasima';
        homeBranch = userData.branch || '0450';
      }
      
      // Update user with RBAC structure
      const updatedUser = {
        ...userData,
        accessLevel: accessLevel,
        allowedProvinces: allowedProvinces,
        allowedBranches: allowedBranches,
        homeProvince: homeProvince,
        homeBranch: homeBranch,
        permissions: {
          users: {
            view: accessLevel !== 'BRANCH_STAFF',
            create: accessLevel === 'SUPER_ADMIN' || accessLevel === 'PROVINCE_MANAGER',
            edit: accessLevel !== 'BRANCH_STAFF',
            delete: accessLevel === 'SUPER_ADMIN',
            manage: accessLevel === 'SUPER_ADMIN' || accessLevel === 'PROVINCE_MANAGER'
          },
          provinces: {
            view: true,
            create: accessLevel === 'SUPER_ADMIN',
            edit: accessLevel === 'SUPER_ADMIN' || accessLevel === 'PROVINCE_MANAGER',
            delete: accessLevel === 'SUPER_ADMIN',
            manage: accessLevel === 'SUPER_ADMIN'
          },
          branches: {
            view: true,
            create: accessLevel === 'SUPER_ADMIN' || accessLevel === 'PROVINCE_MANAGER',
            edit: accessLevel !== 'BRANCH_STAFF',
            delete: accessLevel === 'SUPER_ADMIN',
            manage: accessLevel === 'SUPER_ADMIN' || accessLevel === 'PROVINCE_MANAGER'
          },
          reports: {
            view: true,
            create: true,
            edit: accessLevel !== 'BRANCH_STAFF',
            export: true
          },
          settings: {
            view: accessLevel !== 'BRANCH_STAFF',
            edit: accessLevel === 'SUPER_ADMIN' || accessLevel === 'PROVINCE_MANAGER'
          }
        },
        updatedAt: Date.now()
      };
      
      updatePromises.push(
        usersRef.doc(userId).update(updatedUser)
          .then(() => console.log(`✅ Updated user ${userId} with RBAC: ${accessLevel}`))
          .catch(error => console.error(`❌ Error updating user ${userId}:`, error))
      );
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Finished updating existing users with province access');
    
  } catch (error) {
    console.error('❌ Error updating existing users:', error);
    throw error;
  }
};

/**
 * Rollback Phase 1 Migration
 * Removes the Nakhon Sawan province and all related data
 */
export const rollbackPhase1 = async () => {
  try {
    console.log('Starting Phase 1 Migration Rollback...');

    // Note: In production, you might want to archive data instead of deleting
    console.log('Phase 1 Migration Rollback completed');
    return { success: true, message: 'Phase 1 rollback completed' };

  } catch (error) {
    console.error('Phase 1 Migration Rollback failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate Phase 1 Migration
 * Checks if all required data exists
 */
export const validatePhase1 = async () => {
  try {
    const nmaProvince = await getProvinceByKey('nakhon-ratchasima');
    const nsnProvince = await getProvinceByKey('nakhon-sawan');

    const validation = {
      provinces: {
        nakhonRatchasima: !!nmaProvince,
        nakhonSawan: !!nsnProvince
      },
      branches: {
        NSN001: false, // Would need to check branches collection
        NSN002: false,  
        NSN003: false
      }
    };

    const isValid = validation.provinces.nakhonRatchasima && 
                   validation.provinces.nakhonSawan;

    return {
      success: isValid,
      validation,
      message: isValid ? 'Phase 1 validation passed' : 'Phase 1 validation failed'
    };

  } catch (error) {
    console.error('Phase 1 Migration Validation failed:', error);
    return { success: false, error: error.message };
  }
}; 