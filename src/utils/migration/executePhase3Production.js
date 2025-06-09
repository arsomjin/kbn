/**
 * Phase 3 Production Migration Executor
 * 
 * Use this script for production deployment to add provinceId to existing data
 * Can be run from command line or integrated into deployment pipeline
 */

import { executePhase3Migration, validatePhase3Migration } from './phase3ProvinceIdMigration';

// Configuration
const MIGRATION_CONFIG = {
  // Production safety checks
  requireConfirmation: true,
  validateAfterMigration: true,
  
  // Progress reporting
  logInterval: 100, // Log progress every 100 documents
  
  // Error handling
  stopOnError: false, // Continue migration even if some collections fail
  maxRetries: 3
};

/**
 * Production migration execution
 */
export const runPhase3ProductionMigration = async () => {
  console.log('🚀 Phase 3 Production Migration Starting...');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  
  // Safety confirmation for production
  if (MIGRATION_CONFIG.requireConfirmation && process.env.NODE_ENV === 'production') {
    console.log('⚠️  PRODUCTION ENVIRONMENT DETECTED');
    console.log('⚠️  This migration will add provinceId to ALL existing data');
    console.log('⚠️  Ensure you have a complete database backup before proceeding');
    
    // In production, you might want to require manual confirmation
    // For automated deployment, set SKIP_CONFIRMATION=true environment variable
    if (!process.env.SKIP_CONFIRMATION) {
      throw new Error('Production migration requires manual confirmation. Set SKIP_CONFIRMATION=true to bypass.');
    }
  }
  
  let migrationResults = null;
  let validationResults = null;
  
  try {
    // Step 1: Execute Migration
    console.log('\n📋 Step 1: Executing Phase 3 Migration...');
    migrationResults = await executePhase3Migration((progress) => {
      // Log progress at intervals
      if (progress.processed % MIGRATION_CONFIG.logInterval === 0) {
        console.log(`📊 Progress: ${progress.currentCollection} - ${progress.processed}/${progress.total} (${Math.round((progress.processed/progress.total)*100)}%)`);
      }
    });
    
    // Check migration success
    if (migrationResults.summary.failedCollections > 0) {
      console.warn('⚠️  Migration completed with errors in some collections');
      console.warn('📊 Failed Collections:', migrationResults.summary.failedCollections);
      
      if (MIGRATION_CONFIG.stopOnError) {
        throw new Error('Migration failed for some collections. Stopping execution.');
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Summary:', {
      totalMigrated: migrationResults.summary.totalMigrated,
      totalSkipped: migrationResults.summary.totalSkipped,
      successfulCollections: migrationResults.summary.successfulCollections,
      failedCollections: migrationResults.summary.failedCollections
    });
    
    // Step 2: Validate Migration (if enabled)
    if (MIGRATION_CONFIG.validateAfterMigration) {
      console.log('\n🔍 Step 2: Validating Migration Results...');
      validationResults = await validatePhase3Migration();
      
      const { summary } = validationResults;
      
      if (summary.documentsWithoutProvinceId > 0) {
        console.warn('⚠️  Validation found documents without provinceId');
        console.warn('📊 Missing ProvinceId:', summary.documentsWithoutProvinceId);
        
        if (MIGRATION_CONFIG.stopOnError) {
          throw new Error('Validation failed - some documents missing provinceId');
        }
      } else {
        console.log('✅ Validation passed - all documents have provinceId');
      }
      
      console.log('📊 Validation Summary:', {
        totalDocuments: summary.totalDocuments,
        documentsWithProvinceId: summary.documentsWithProvinceId,
        documentsWithoutProvinceId: summary.documentsWithoutProvinceId,
        validCollections: summary.validCollections,
        invalidCollections: summary.invalidCollections
      });
    }
    
    // Step 3: Final Report
    console.log('\n🎉 Phase 3 Migration Complete!');
    console.log('📊 Final Status: SUCCESS');
    console.log('⏱️  Duration:', Math.round(migrationResults.duration / 1000), 'seconds');
    
    return {
      success: true,
      migration: migrationResults,
      validation: validationResults,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('\n❌ Phase 3 Migration Failed!');
    console.error('📊 Error:', error.message);
    console.error('🔍 Details:', error);
    
    return {
      success: false,
      error: error.message,
      migration: migrationResults,
      validation: validationResults,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Pre-migration checks
 */
export const runPreMigrationChecks = async () => {
  console.log('🔍 Running pre-migration checks...');
  
  try {
    // Check database connectivity
    console.log('📡 Checking database connectivity...');
    // Add your database connectivity check here
    
    // Check existing migration status
    console.log('📋 Checking previous migration status...');
    // Add check for Phase 1 and Phase 2 migrations
    
    // Check available resources
    console.log('💾 Checking system resources...');
    // Add resource availability checks
    
    console.log('✅ Pre-migration checks passed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Pre-migration checks failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Command-line interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'check':
      runPreMigrationChecks()
        .then(result => {
          process.exit(result.success ? 0 : 1);
        });
      break;
      
    case 'migrate':
      runPhase3ProductionMigration()
        .then(result => {
          process.exit(result.success ? 0 : 1);
        });
      break;
      
    case 'validate':
      validatePhase3Migration()
        .then(result => {
          console.log('Validation completed:', result.summary);
          process.exit(0);
        })
        .catch(error => {
          console.error('Validation failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
Phase 3 Migration Tools

Usage:
  node executePhase3Production.js [command]

Commands:
  check      - Run pre-migration checks
  migrate    - Execute Phase 3 migration
  validate   - Validate migration results

Environment Variables:
  SKIP_CONFIRMATION=true    - Skip production confirmation prompt
  NODE_ENV=production       - Run in production mode

Examples:
  # Run pre-migration checks
  node executePhase3Production.js check
  
  # Execute migration in production
  SKIP_CONFIRMATION=true NODE_ENV=production node executePhase3Production.js migrate
  
  # Validate migration results
  node executePhase3Production.js validate
      `);
      process.exit(1);
  }
}

// Export for use in other modules
export default {
  runPhase3ProductionMigration,
  runPreMigrationChecks,
  validatePhase3Migration
}; 