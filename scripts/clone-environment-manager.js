#!/usr/bin/env node

/**
 * 🧪 CLONE ENVIRONMENT MANAGER
 * Utility for managing production clone environment for LIVE deployment testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'blue') => {
  console.log(
    `${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`
  );
};

const success = (message) => log(`✅ ${message}`, 'green');
const warning = (message) => log(`⚠️ ${message}`, 'yellow');
const error = (message) => log(`❌ ${message}`, 'red');

class CloneEnvironmentManager {
  constructor() {
    this.rootDir = process.cwd();
    this.envFile = path.join(this.rootDir, '.env');
    this.firebaseRcFile = path.join(this.rootDir, '.firebaserc');
    this.cloneEnvFile = path.join(this.rootDir, '.env.clone');
    this.cloneFirebaseRcFile = path.join(this.rootDir, '.firebaserc.clone');
  }

  // Switch to clone environment
  switchToClone() {
    log('🔄 Switching to clone environment...');

    try {
      // Backup current environment
      if (fs.existsSync(this.envFile)) {
        fs.copyFileSync(this.envFile, `${this.envFile}.backup`);
        log('Current .env backed up');
      }

      if (fs.existsSync(this.firebaseRcFile)) {
        fs.copyFileSync(this.firebaseRcFile, `${this.firebaseRcFile}.backup`);
        log('Current .firebaserc backed up');
      }

      // Switch to clone configuration
      if (fs.existsSync(this.cloneEnvFile)) {
        fs.copyFileSync(this.cloneEnvFile, this.envFile);
        success('Switched to clone .env');
      } else {
        error('Clone .env file not found. Run enhanced-prod-clone.sh first.');
        return false;
      }

      if (fs.existsSync(this.cloneFirebaseRcFile)) {
        fs.copyFileSync(this.cloneFirebaseRcFile, this.firebaseRcFile);
        success('Switched to clone .firebaserc');
      } else {
        error(
          'Clone .firebaserc file not found. Run enhanced-prod-clone.sh first.'
        );
        return false;
      }

      success('Successfully switched to clone environment');
      return true;
    } catch (err) {
      error(`Failed to switch to clone environment: ${err.message}`);
      return false;
    }
  }

  // Switch back to original environment
  switchToOriginal() {
    log('🔄 Switching back to original environment...');

    try {
      // Restore from backup
      if (fs.existsSync(`${this.envFile}.backup`)) {
        fs.copyFileSync(`${this.envFile}.backup`, this.envFile);
        success('Restored original .env');
      }

      if (fs.existsSync(`${this.firebaseRcFile}.backup`)) {
        fs.copyFileSync(`${this.firebaseRcFile}.backup`, this.firebaseRcFile);
        success('Restored original .firebaserc');
      }

      success('Successfully switched back to original environment');
      return true;
    } catch (err) {
      error(`Failed to switch back to original environment: ${err.message}`);
      return false;
    }
  }

  // Validate clone connection
  validateCloneConnection() {
    log('🔍 Validating clone environment connection...');

    try {
      // Read current environment
      const envContent = fs.readFileSync(this.envFile, 'utf8');
      const projectIdMatch = envContent.match(
        /REACT_APP_FIREBASE_PROJECT_ID=(.+)/
      );

      if (!projectIdMatch) {
        error('Firebase project ID not found in .env');
        return false;
      }

      const projectId = projectIdMatch[1].trim();
      log(`Current project ID: ${projectId}`);

      // Check if it's a clone project
      if (!projectId.includes('clone')) {
        warning('Not connected to clone environment');
        return false;
      }

      // Test Firebase connection
      try {
        const firebaseRc = JSON.parse(
          fs.readFileSync(this.firebaseRcFile, 'utf8')
        );
        log(`Firebase project: ${firebaseRc.projects.default}`);

        // Test gcloud connection
        const result = execSync(
          `gcloud firestore databases list --project=${projectId}`,
          {
            encoding: 'utf8',
            stdio: 'pipe',
          }
        );

        if (result.includes('(default)')) {
          success('Clone Firestore database accessible');
        } else {
          warning('Clone Firestore database not found');
        }

        success('Clone environment validation successful');
        return true;
      } catch (cmdError) {
        error(`Firebase connection test failed: ${cmdError.message}`);
        return false;
      }
    } catch (err) {
      error(`Clone validation failed: ${err.message}`);
      return false;
    }
  }

  // Validate clone integrity
  validateCloneIntegrity() {
    log('🔍 Validating clone data integrity...');

    try {
      const envContent = fs.readFileSync(this.envFile, 'utf8');
      const projectIdMatch = envContent.match(
        /REACT_APP_FIREBASE_PROJECT_ID=(.+)/
      );
      const projectId = projectIdMatch[1].trim();

      // Test basic collections exist
      const collections = [
        'users',
        'branches',
        'provinces',
        'customers',
        'sales',
        'services',
        'parts',
        'warehouses',
      ];

      let validCollections = 0;

      for (const collection of collections) {
        try {
          const result = execSync(
            `gcloud firestore collections list --project=${projectId} --filter="collectionIds:${collection}"`,
            { encoding: 'utf8', stdio: 'pipe' }
          );

          if (result.trim()) {
            validCollections++;
            log(`✓ Collection '${collection}' found`);
          } else {
            warning(`Collection '${collection}' not found`);
          }
        } catch (cmdError) {
          warning(
            `Could not check collection '${collection}': ${cmdError.message}`
          );
        }
      }

      const integrityPercentage = (validCollections / collections.length) * 100;

      if (integrityPercentage >= 80) {
        success(
          `Clone integrity: ${integrityPercentage.toFixed(1)}% (${validCollections}/${collections.length} collections)`
        );
        return true;
      } else {
        error(
          `Clone integrity too low: ${integrityPercentage.toFixed(1)}% (${validCollections}/${collections.length} collections)`
        );
        return false;
      }
    } catch (err) {
      error(`Clone integrity validation failed: ${err.message}`);
      return false;
    }
  }

  // Generate baseline snapshot
  generateBaselineSnapshot() {
    log('📊 Generating baseline snapshot...');

    try {
      const envContent = fs.readFileSync(this.envFile, 'utf8');
      const projectIdMatch = envContent.match(
        /REACT_APP_FIREBASE_PROJECT_ID=(.+)/
      );
      const projectId = projectIdMatch[1].trim();

      const timestamp = new Date().toISOString();
      const snapshotData = {
        timestamp,
        projectId,
        type: 'baseline_snapshot',
        collections: {},
        metadata: {
          purpose: 'Pre-migration baseline for LIVE deployment testing',
          createdBy: 'clone-environment-manager',
          version: '1.0.0',
        },
      };

      // Get collection counts
      const collections = [
        'users',
        'branches',
        'provinces',
        'customers',
        'sales',
        'services',
        'parts',
      ];

      for (const collection of collections) {
        try {
          const result = execSync(
            `gcloud firestore collections list --project=${projectId} --filter="collectionIds:${collection}" --format="value(collectionIds)"`,
            { encoding: 'utf8', stdio: 'pipe' }
          );

          if (result.trim()) {
            // Get document count (simplified - in real implementation you'd query the collection)
            snapshotData.collections[collection] = {
              exists: true,
              status: 'accessible',
              lastChecked: timestamp,
            };
          }
        } catch (cmdError) {
          snapshotData.collections[collection] = {
            exists: false,
            error: cmdError.message,
            lastChecked: timestamp,
          };
        }
      }

      // Save snapshot
      const snapshotFile = `baseline-snapshot-${Date.now()}.json`;
      fs.writeFileSync(snapshotFile, JSON.stringify(snapshotData, null, 2));

      success(`Baseline snapshot saved: ${snapshotFile}`);
      return snapshotFile;
    } catch (err) {
      error(`Failed to generate baseline snapshot: ${err.message}`);
      return null;
    }
  }

  // Show current environment status
  showStatus() {
    log('📊 Current Environment Status');
    console.log('================================');

    try {
      if (fs.existsSync(this.envFile)) {
        const envContent = fs.readFileSync(this.envFile, 'utf8');
        const projectIdMatch = envContent.match(
          /REACT_APP_FIREBASE_PROJECT_ID=(.+)/
        );
        const environmentMatch = envContent.match(/REACT_APP_ENVIRONMENT=(.+)/);

        if (projectIdMatch) {
          const projectId = projectIdMatch[1].trim();
          const environment = environmentMatch
            ? environmentMatch[1].trim()
            : 'unknown';

          console.log(`Project ID: ${projectId}`);
          console.log(`Environment: ${environment}`);

          if (projectId.includes('clone')) {
            success('Connected to CLONE environment ✅');
          } else if (projectId.includes('test')) {
            warning('Connected to TEST environment ⚠️');
          } else {
            error('Connected to PRODUCTION environment ❌');
          }
        }
      } else {
        error('No .env file found');
      }

      // Check backup files
      if (fs.existsSync(`${this.envFile}.backup`)) {
        log('Original .env backup available');
      }
      if (fs.existsSync(`${this.firebaseRcFile}.backup`)) {
        log('Original .firebaserc backup available');
      }
    } catch (err) {
      error(`Failed to show status: ${err.message}`);
    }
  }
}

// CLI interface
const manager = new CloneEnvironmentManager();
const command = process.argv[2];

switch (command) {
  case 'switch-to-clone':
    manager.switchToClone();
    break;
  case 'switch-to-original':
    manager.switchToOriginal();
    break;
  case 'validate-connection':
    manager.validateCloneConnection();
    break;
  case 'validate-integrity':
    manager.validateCloneIntegrity();
    break;
  case 'generate-baseline':
    manager.generateBaselineSnapshot();
    break;
  case 'status':
    manager.showStatus();
    break;
  default:
    console.log(`
🧪 Clone Environment Manager

Usage: node scripts/clone-environment-manager.js <command>

Commands:
  switch-to-clone      Switch to clone environment
  switch-to-original   Switch back to original environment
  validate-connection  Test clone environment connection
  validate-integrity   Validate clone data integrity
  generate-baseline    Generate pre-migration baseline snapshot
  status              Show current environment status

Examples:
  npm run switch-to-clone
  npm run validate-clone-connection
  npm run validate-clone-integrity
  npm run generate-baseline-snapshot
    `);
}
