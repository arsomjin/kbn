#!/usr/bin/env node

/**
 * Migration Script: Update Modules to use usePermissions
 * This script systematically updates all modules to use the new usePermissions hook
 * instead of the deprecated useGeographicData hook
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP = !process.argv.includes('--no-backup');

console.log('🔄 RBAC Module Migration Script');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE UPDATE'}`);
console.log(`Backup: ${BACKUP ? 'Enabled' : 'Disabled'}`);
console.log('');

// Files to update (modules that use useGeographicData)
const filesToUpdate = [
  'src/Modules/**/*.js',
  'src/dev/screens/**/*.js'
];

// Transformation patterns
const transformations = [
  {
    name: 'Update import statement',
    pattern: /import\s*{\s*([^}]*\buseGeographicData\b[^}]*)\s*}\s*from\s*['"]hooks\/useGeographicData['"];?/g,
    replacement: (match, imports) => {
      // Replace useGeographicData with usePermissions in the import list
      const newImports = imports.replace(/\buseGeographicData\b/, 'usePermissions');
      return `import { ${newImports} } from 'hooks/usePermissions';`;
    }
  },
  {
    name: 'Update hook destructuring',
    pattern: /const\s*{\s*([^}]*\buseGeographicData\b[^}]*)\s*}\s*=\s*useGeographicData\(\);?/g,
    replacement: (match, destructuring) => {
      // Replace useGeographicData with usePermissions in destructuring
      const newDestructuring = destructuring.replace(/\buseGeographicData\b/, 'usePermissions');
      return `const { ${newDestructuring} } = usePermissions();`;
    }
  },
  {
    name: 'Fix direct useGeographicData call',
    pattern: /\buseGeographicData\(\)/g,
    replacement: 'usePermissions()'
  }
];

// Backup function
function createBackup(filePath) {
  if (!BACKUP) return;
  
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`  📁 Backup created: ${path.relative(process.cwd(), backupPath)}`);
}

// Process a single file
function processFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Apply transformations
    transformations.forEach(({ name, pattern, replacement }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        console.log(`  🔧 ${name}: ${matches.length} match(es)`);
        newContent = newContent.replace(pattern, replacement);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      if (!DRY_RUN) {
        createBackup(filePath);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`  ✅ Updated: ${relativePath}`);
      } else {
        console.log(`  🔍 Would update: ${relativePath}`);
      }
      return true;
    } else {
      console.log(`  ⏭️  No changes needed: ${relativePath}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${relativePath}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  let totalFiles = 0;
  let updatedFiles = 0;
  
  for (const pattern of filesToUpdate) {
    console.log(`\n📂 Processing pattern: ${pattern}`);
    
    const files = glob.sync(pattern, { ignore: ['**/node_modules/**', '**/*.backup.*'] });
    
    if (files.length === 0) {
      console.log('  No files found');
      continue;
    }
    
    for (const file of files) {
      totalFiles++;
      
      // Check if file actually contains useGeographicData
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('useGeographicData')) {
        continue;
      }
      
      console.log(`\n📄 Processing: ${path.relative(process.cwd(), file)}`);
      
      if (processFile(file)) {
        updatedFiles++;
      }
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`Total files checked: ${totalFiles}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log(`Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else if (updatedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('🔍 Please test the updated modules to ensure they work correctly');
    
    if (BACKUP) {
      console.log('🔙 Backup files created - you can restore if needed');
    }
  }
}

// Run the script
main().catch(console.error); 