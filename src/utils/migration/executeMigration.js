/**
 * Migration Executor for KBN Multi-Province Expansion
 * Execute this to run Phase 1 migration
 */

import { migrateToPhase1 } from './phase1Migration';
import { getDatabaseInfo, validateProductionSwitch, getMigrationSafetyConfig } from '../environmentConfig';

// Migration data for Phase 1
const PHASE_1_MIGRATION_DATA = {
  // Existing province data (ensure correct structure)
  existingProvince: {
    key: 'nakhon-ratchasima',
    name: 'นครราชสีมา',
    nameEn: 'Nakhon Ratchasima',
    code: 'NMA',
    region: 'northeast',
    status: 'active'
  },

  // New province to add
  newProvince: {
    key: 'nakhon-sawan',
    name: 'นครสวรรค์',
    nameEn: 'Nakhon Sawan',
    code: 'NSN',
    region: 'central',
    status: 'active'
  },

  // New branches for Nakhon Sawan
  newBranches: [
    {
      branchCode: 'NSN001',
      branchId: '2001',
      branchName: 'สถานที่ NSN001',
      provinceId: 'nakhon-sawan',  // kebab-case key reference
      locationId: 'location_nsn001',
      warehouseId: 'warehouse_nsn001',
      status: 'active',
      queue: 1,
      remark: ''
    },
    {
      branchCode: 'NSN002',
      branchId: '2002',
      branchName: 'สถานที่ NSN002',
      provinceId: 'nakhon-sawan',  // kebab-case key reference
      locationId: 'location_nsn002',
      warehouseId: 'warehouse_nsn002',
      status: 'active',
      queue: 2,
      remark: ''
    },
    {
      branchCode: 'NSN003',
      branchId: '2003',
      branchName: 'สถานที่ NSN003',
      provinceId: 'nakhon-sawan',  // kebab-case key reference
      locationId: 'location_nsn003',
      warehouseId: 'warehouse_nsn003',
      status: 'active',
      queue: 3,
      remark: ''
    }
  ],

  // Sample users with updated RBAC structure
  sampleUsers: [
    {
      uid: 'admin_001',
      displayName: 'Super Admin',
      email: 'admin@kbn.com',
      accessLevel: 'SUPER_ADMIN',
      permissions: {
        users: { view: true, create: true, edit: true, delete: true, manage: true },
        provinces: { view: true, create: true, edit: true, delete: true, manage: true },
        branches: { view: true, create: true, edit: true, delete: true, manage: true },
        reports: { view: true, create: true, edit: true, export: true },
        settings: { view: true, edit: true },
        rbac: { admin: true }
      },
      allowedProvinces: [], // Super admin has access to all
      allowedBranches: [], // Super admin has access to all
      homeProvince: null,
      homeBranch: null
    },
    {
      uid: 'province_manager_nma',
      displayName: 'ผู้จัดการจังหวัดนครราชสีมา',
      email: 'manager.nma@kbn.com',
      accessLevel: 'PROVINCE_MANAGER',
      permissions: {
        users: { view: true, create: true, edit: true, manage: true },
        provinces: { view: true, edit: true },
        branches: { view: true, create: true, edit: true, manage: true },
        reports: { view: true, create: true, edit: true, export: true },
        settings: { view: true }
      },
      allowedProvinces: ['nakhon-ratchasima'], // kebab-case key
      allowedBranches: [], // Province manager manages all branches in their provinces
      homeProvince: 'nakhon-ratchasima',
      homeBranch: null
    },
    {
      uid: 'province_manager_nsn',
      displayName: 'ผู้จัดการจังหวัดนครสวรรค์',
      email: 'manager.nsn@kbn.com',
      accessLevel: 'PROVINCE_MANAGER',
      permissions: {
        users: { view: true, create: true, edit: true, manage: true },
        provinces: { view: true, edit: true },
        branches: { view: true, create: true, edit: true, manage: true },
        reports: { view: true, create: true, edit: true, export: true },
        settings: { view: true }
      },
      allowedProvinces: ['nakhon-sawan'], // kebab-case key
      allowedBranches: [], // Province manager manages all branches in their provinces
      homeProvince: 'nakhon-sawan',
      homeBranch: null
    }
  ]
};

// Production Safety Validator
const validateProductionMigration = async () => {
  const dbInfo = getDatabaseInfo();
  const validation = validateProductionSwitch();
  const safetyConfig = getMigrationSafetyConfig();
  
  console.log('🔍 Database Environment Check:');
  console.log(`   Environment: ${dbInfo.environment}`);
  console.log(`   Project ID: ${dbInfo.projectId}`);
  console.log(`   Is Production: ${dbInfo.isProduction}`);
  
  if (dbInfo.isProduction) {
    console.log('🔴 PRODUCTION DATABASE DETECTED');
    console.log('🔴 PROCEED WITH EXTREME CAUTION');
    console.log('🔴 Ensure the following:');
    console.log('   ✓ Full database backup completed');
    console.log('   ✓ Migration tested on test database');
    console.log('   ✓ Rollback plan prepared');
    console.log('   ✓ Stakeholders notified');
    
    // In production, require explicit confirmation
    const userConfirmation = window.confirm(
      `⚠️ PRODUCTION DATABASE MIGRATION ⚠️\n\n` +
      `You are about to migrate LIVE PRODUCTION data.\n` +
      `Project: ${dbInfo.projectId}\n\n` +
      `Have you:\n` +
      `✓ Completed full database backup?\n` +
      `✓ Tested migration on test environment?\n` +
      `✓ Prepared rollback plan?\n\n` +
      `Type 'MIGRATE PRODUCTION' below to confirm:`
    );
    
    if (!userConfirmation) {
      throw new Error('Production migration cancelled by user');
    }
    
    const finalConfirm = window.prompt(
      'Type "MIGRATE PRODUCTION" to confirm:'
    );
    
    if (finalConfirm !== 'MIGRATE PRODUCTION') {
      throw new Error('Production migration confirmation failed');
    }
  }
  
  return { dbInfo, safetyConfig };
};

/**
 * Enhanced migration executor with existing data safety checks
 */
export const executePhase1Migration = async () => {
  try {
    console.log('🚀 Starting Phase 1 Migration...');
    
    // Safety check
    const dbInfo = await validateProductionMigration();
    const safetyConfig = getMigrationSafetyConfig(dbInfo.environment);
    
    console.log(`Environment: ${dbInfo.environment}`);
    console.log(`Project: ${dbInfo.projectId}`);
    console.log(`Safety Config:`, safetyConfig);
    
    // Check for existing NSN data before migration
    const existingDataCheck = await checkExistingNSNData();
    if (existingDataCheck.hasExistingData) {
      console.log('⚠️  Existing NSN data detected:');
      console.log(`  Provinces: ${existingDataCheck.provinces.join(', ')}`);
      console.log(`  Branches: ${existingDataCheck.branches.join(', ')}`);
      console.log(`  Warehouses: ${existingDataCheck.warehouses.join(', ')}`);
      console.log(`  Locations: ${existingDataCheck.locations.join(', ')}`);
      
      // In production, ask for confirmation about existing data
      if (dbInfo.isProduction) {
        const proceed = window.confirm(
          `⚠️ EXISTING DATA DETECTED\n\n` +
          `Found existing NSN data in production:\n` +
          `• ${existingDataCheck.branches.length} branches\n` +
          `• ${existingDataCheck.warehouses.length} warehouses\n` +
          `• ${existingDataCheck.locations.length} locations\n\n` +
          `Migration will update/merge with existing data.\n` +
          `Do you want to continue?`
        );
        
        if (!proceed) {
          throw new Error('Migration cancelled due to existing data');
        }
      }
    }
    
    // Execute migration with enhanced safety
    const result = await migrateToPhase1(safetyConfig);
    
    console.log('✅ Phase 1 Migration completed successfully!');
    return {
      success: true,
      message: 'Phase 1 migration completed successfully',
      environment: dbInfo.environment,
      projectId: dbInfo.projectId,
      existingDataHandled: existingDataCheck.hasExistingData,
      result
    };
    
  } catch (error) {
    console.error('❌ Phase 1 Migration failed:', error);
    
    if (error.message.includes('production')) {
      console.error('🚨 PRODUCTION MIGRATION FAILED - Check logs and consider rollback');
    }
    
    throw error;
  }
};

/**
 * Check for existing NSN data before migration
 */
const checkExistingNSNData = async () => {
  try {
    // Import Firebase instance
    const { app } = await import('../../firebase');
    const firestore = app.firestore();
    
    // Check provinces
    const provincesRef = firestore.collection('data').doc('company').collection('provinces');
    const nsnProvinceDoc = await provincesRef.doc('nakhon-sawan').get();
    
    // Check branches
    const branchesRef = firestore.collection('data').doc('company').collection('branches');
    const nsnBranches = ['NSN001', 'NSN002', 'NSN003'];
    const branchChecks = await Promise.all(
      nsnBranches.map(async (code) => {
        const doc = await branchesRef.doc(code).get();
        return { code, exists: doc.exists };
      })
    );
    
    // Check warehouses
    const warehousesRef = firestore.collection('data').doc('company').collection('warehouses');
    const nsnWarehouses = ['warehouse_nsn001', 'warehouse_nsn002', 'warehouse_nsn003'];
    const warehouseChecks = await Promise.all(
      nsnWarehouses.map(async (id) => {
        const doc = await warehousesRef.doc(id).get();
        return { id, exists: doc.exists };
      })
    );
    
    // Check locations
    const locationsRef = firestore.collection('data').doc('company').collection('locations');
    const nsnLocations = ['location_nsn001', 'location_nsn002', 'location_nsn003'];
    const locationChecks = await Promise.all(
      nsnLocations.map(async (id) => {
        const doc = await locationsRef.doc(id).get();
        return { id, exists: doc.exists };
      })
    );
    
    const existingBranches = branchChecks.filter(b => b.exists).map(b => b.code);
    const existingWarehouses = warehouseChecks.filter(w => w.exists).map(w => w.id);
    const existingLocations = locationChecks.filter(l => l.exists).map(l => l.id);
    
    return {
      hasExistingData: nsnProvinceDoc.exists || existingBranches.length > 0 || existingWarehouses.length > 0 || existingLocations.length > 0,
      provinces: nsnProvinceDoc.exists ? ['nakhon-sawan'] : [],
      branches: existingBranches,
      warehouses: existingWarehouses,
      locations: existingLocations
    };
    
  } catch (error) {
    console.error('Error checking existing NSN data:', error);
    return {
      hasExistingData: false,
      provinces: [],
      branches: [],
      warehouses: [],
      locations: []
    };
  }
};

/**
 * Validate migration data structure
 */
const validateMigrationData = (data) => {
  const errors = [];

  // Check new province structure
  if (!data.newProvince.key || !data.newProvince.name || !data.newProvince.code) {
    errors.push('New province missing required fields');
  }

  // Check new branches structure
  data.newBranches.forEach((branch, index) => {
    if (!branch.branchCode || !branch.branchName || !branch.provinceId) {
      errors.push(`Branch ${index + 1} missing required fields`);
    }
    if (branch.provinceId !== data.newProvince.key) {
      errors.push(`Branch ${index + 1} provinceId doesn't match new province key`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Development/testing function to run migration from console
 */
export const runMigrationFromConsole = async () => {
  console.log('🔧 Running migration from development console...');
  const result = await executePhase1Migration();
  
  if (result.success) {
    console.log('✅ Migration completed successfully!');
    console.log('You can now test the multi-province functionality.');
  } else {
    console.error('❌ Migration failed:', result.error);
  }
  
  return result;
};

// Pre-production validation utility
export const validatePreProductionReadiness = async () => {
  console.log('🔍 Pre-Production Readiness Check...');
  
  const checks = {
    environmentConfig: false,
    migrationData: false,
    backupVerified: false,
    rollbackPlan: false
  };
  
  try {
    // Check environment configuration
    const dbInfo = getDatabaseInfo();
    checks.environmentConfig = !!dbInfo.projectId;
    console.log(`   Environment Config: ${checks.environmentConfig ? '✅' : '❌'}`);
    
    // Check migration data
    checks.migrationData = PHASE_1_MIGRATION_DATA.newBranches.length === 3;
    console.log(`   Migration Data: ${checks.migrationData ? '✅' : '❌'}`);
    
    // Manual checks (require user confirmation)
    checks.backupVerified = window.confirm(
      'Have you completed and verified a full database backup?'
    );
    console.log(`   Backup Verified: ${checks.backupVerified ? '✅' : '❌'}`);
    
    checks.rollbackPlan = window.confirm(
      'Do you have a tested rollback plan ready?'
    );
    console.log(`   Rollback Plan: ${checks.rollbackPlan ? '✅' : '❌'}`);
    
    const allChecksPass = Object.values(checks).every(check => check);
    
    console.log(`🎯 Pre-Production Readiness: ${allChecksPass ? '✅ READY' : '❌ NOT READY'}`);
    
    return {
      ready: allChecksPass,
      checks,
      recommendations: allChecksPass ? [] : [
        !checks.environmentConfig && 'Fix environment configuration',
        !checks.migrationData && 'Verify migration data completeness',
        !checks.backupVerified && 'Complete and verify database backup',
        !checks.rollbackPlan && 'Prepare and test rollback procedure'
      ].filter(Boolean)
    };
    
  } catch (error) {
    console.error('❌ Readiness check failed:', error);
    return {
      ready: false,
      checks,
      error: error.message
    };
  }
};

// Development environment check
if (process.env.NODE_ENV === 'development') {
  // Export for development testing
  window.KBN_MIGRATION = {
    executePhase1Migration,
    validatePreProductionReadiness,
    getDatabaseInfo,
    validateProductionSwitch
  };
} 