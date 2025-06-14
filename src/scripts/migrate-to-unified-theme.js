#!/usr/bin/env node

/**
 * KBN Unified Theme Migration Script
 * 
 * This script migrates all components from old styling patterns to the new unified theme system:
 * - Updates Stepper components to use nature-stepper classes
 * - Replaces bg-light with nature-bg-light
 * - Updates other legacy CSS classes to unified theme equivalents
 * 
 * Usage: node src/scripts/migrate-to-unified-theme.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Migration patterns
const MIGRATION_PATTERNS = [
  // Stepper component styling
  {
    name: 'Stepper bg-light to nature-stepper',
    pattern: /className="bg-light"(\s+steps=)/g,
    replacement: 'className="nature-stepper nature-steps-compact"$1',
    filePattern: '**/*.js'
  },
  
  // Page header styling
  {
    name: 'Page header bg-light to nature-bg-light',
    pattern: /className="([^"]*\s+)?bg-light(\s+[^"]*)?"/g,
    replacement: (match, before = '', after = '') => {
      const beforeClean = before.replace(/\s+$/, '');
      const afterClean = after.replace(/^\s+/, '');
      const beforePart = beforeClean ? `${beforeClean} ` : '';
      const afterPart = afterClean ? ` ${afterClean}` : '';
      return `className="${beforePart}nature-bg-light${afterPart}"`;
    },
    filePattern: '**/*.js'
  },
  
  // Card styling updates
  {
    name: 'Bootstrap card classes to nature equivalents',
    pattern: /className="([^"]*\s+)?card(\s+[^"]*)?"/g,
    replacement: (match, before = '', after = '') => {
      const beforeClean = before.replace(/\s+$/, '');
      const afterClean = after.replace(/^\s+/, '');
      const beforePart = beforeClean ? `${beforeClean} ` : '';
      const afterPart = afterClean ? ` ${afterClean}` : '';
      return `className="${beforePart}ant-card${afterPart}"`;
    },
    filePattern: '**/*.js'
  }
];

// Additional specific component patterns
const COMPONENT_SPECIFIC_PATTERNS = [
  // BranchDateHeader updates
  {
    file: 'src/components/branch-date-header.js',
    patterns: [
      {
        from: 'className="bg-light"',
        to: 'className="nature-stepper nature-steps-compact"'
      }
    ]
  },
  
  // Common Stepper usage patterns
  {
    file: '**/**/index.js',
    patterns: [
      {
        from: /<Stepper\s+className="bg-light"/g,
        to: '<Stepper className="nature-stepper nature-steps-compact"'
      }
    ]
  }
];

/**
 * Get all files matching the pattern
 */
function getFiles(pattern, exclude = []) {
  const files = glob.sync(pattern, {
    cwd: process.cwd(),
    ignore: [
      'node_modules/**',
      'build/**',
      'dist/**',
      '.git/**',
      '**/*.min.js',
      '**/*.test.js',
      '**/*.spec.js',
      ...exclude
    ]
  });
  return files;
}

/**
 * Apply migration pattern to file content
 */
function applyPattern(content, pattern) {
  if (typeof pattern.replacement === 'function') {
    return content.replace(pattern.pattern, pattern.replacement);
  } else {
    return content.replace(pattern.pattern, pattern.replacement);
  }
}

/**
 * Migrate a single file
 */
function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changesApplied = [];

  // Apply general migration patterns
  MIGRATION_PATTERNS.forEach(pattern => {
    const beforeChange = content;
    content = applyPattern(content, pattern);
    
    if (content !== beforeChange) {
      changesApplied.push(pattern.name);
    }
  });

  // Apply component-specific patterns
  COMPONENT_SPECIFIC_PATTERNS.forEach(componentPattern => {
    if (glob.minimatch(filePath, componentPattern.file)) {
      componentPattern.patterns.forEach(pattern => {
        const beforeChange = content;
        content = content.replace(pattern.from, pattern.to);
        
        if (content !== beforeChange) {
          changesApplied.push(`Component-specific: ${pattern.from} -> ${pattern.to}`);
        }
      });
    }
  });

  // Write file if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    changesApplied.forEach(change => console.log(`   - ${change}`));
    return true;
  }

  return false;
}

/**
 * Migrate all files
 */
function migrateAllFiles() {
  console.log('🚀 Starting KBN Unified Theme Migration...\n');

  const srcFiles = getFiles('src/**/*.js', [
    'src/scripts/**',
    'src/**/*.min.js',
    'src/**/*.test.js'
  ]);

  console.log(`Found ${srcFiles.length} JavaScript files to check\n`);

  let filesUpdated = 0;
  let filesChecked = 0;

  srcFiles.forEach(file => {
    filesChecked++;
    const wasUpdated = migrateFile(file);
    if (wasUpdated) {
      filesUpdated++;
    }
  });

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Files checked: ${filesChecked}`);
  console.log(`   Files updated: ${filesUpdated}`);
  console.log(`   Files unchanged: ${filesChecked - filesUpdated}`);

  if (filesUpdated > 0) {
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Test the application to ensure all components display correctly`);
    console.log(`   2. Check for any remaining styling inconsistencies`);
    console.log(`   3. Run linter to fix any code style issues`);
    console.log(`   4. Remove any unused CSS classes from legacy files`);
  } else {
    console.log(`\n💡 No files needed migration - all components are already up to date!`);
  }
}

/**
 * Rollback migration (restore from backup)
 */
function rollbackMigration() {
  // This would require implementing backup functionality
  console.log('⚠️  Rollback functionality not implemented yet.');
  console.log('   Please use version control (git) to restore previous state if needed.');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    rollbackMigration();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
KBN Unified Theme Migration Script

Usage:
  node src/scripts/migrate-to-unified-theme.js [options]

Options:
  --help, -h     Show this help message
  --rollback     Rollback migration (restore backup)
  --dry-run      Preview changes without applying them (not implemented)

Description:
  This script migrates all React components from legacy styling patterns
  to the new KBN unified theme system. It updates:
  
  - Stepper components: bg-light → nature-stepper nature-steps-compact
  - Page headers: bg-light → nature-bg-light  
  - Card components: card → ant-card
  - Other legacy Bootstrap classes to Ant Design equivalents

Examples:
  node src/scripts/migrate-to-unified-theme.js
  node src/scripts/migrate-to-unified-theme.js --rollback
`);
  } else {
    migrateAllFiles();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  migrateAllFiles,
  migrateFile,
  MIGRATION_PATTERNS,
  COMPONENT_SPECIFIC_PATTERNS
}; 