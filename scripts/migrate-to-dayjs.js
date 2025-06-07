#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting moment-timezone to dayjs migration...\n');

// Get all files that use moment-timezone
const findMomentFiles = () => {
  try {
    const result = execSync('grep -r "moment-timezone" src/ --include="*.js" --include="*.jsx" -l', { encoding: 'utf8' });
    return result.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.log('No moment-timezone files found or grep error');
    return [];
  }
};

// Process a single file
const processFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace import statements
    const originalContent = content;
    content = content.replace(
      /import moment from ['"]moment-timezone['"];?/g,
      `import dayjs from 'dayjs';`
    );

    // Replace moment() calls with dayjs()
    content = content.replace(/moment\(/g, 'dayjs(');

    if (content !== originalContent) {
      modified = true;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main migration function
const runMigration = () => {
  const momentFiles = findMomentFiles();
  
  if (momentFiles.length === 0) {
    console.log('✨ No moment-timezone files found to migrate!');
    return;
  }

  console.log(`📁 Found ${momentFiles.length} files using moment-timezone:\n`);
  
  let migratedCount = 0;
  momentFiles.forEach(file => {
    if (processFile(file)) {
      migratedCount++;
    }
  });

  console.log(`\n🎉 Migration complete!`);
  console.log(`📊 Migrated ${migratedCount} out of ${momentFiles.length} files`);
};

// Run the migration
runMigration(); 