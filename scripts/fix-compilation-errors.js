/**
 * Fix Compilation Errors Script
 * Fixes duplicate imports and missing hook declarations
 */

const fs = require('fs');
const path = require('path');

// Files that likely have duplicate imports or missing hook declarations
const filesToCheck = [
  'src/Modules/Reports/Services/ServiceType/index.js',
  'src/Modules/Reports/Services/ServiceMechanic/index.js',
  'src/Modules/Reports/Services/ServiceCustomers/index.js',
  'src/Modules/Reports/Services/Daily/DailyIncome/index.js',
  'src/Modules/Reports/Services/ServiceAmount/index.js',
  'src/Modules/Reports/Account/ExpenseSummary_bak/index.js',
  'src/Modules/Reports/Account/MonthlyMoneySummary/index.js',
  'src/Modules/Reports/Account/BankDeposit_V2/index.js',
  'src/Modules/Reports/Account/DailyMoneySummary/index.js',
  'src/Modules/Reports/Account/IncomeSummary/index.js',
  'src/Modules/Reports/Account/ExpenseSummaryMonthly/index.js',
  'src/Modules/Reports/Account/BankDeposit/index.js',
  'src/Modules/Reports/Account/IncomeSummaryMonthly/index.js',
  'src/Modules/Reports/Account/BankDeposit_V1/index.js',
  'src/Modules/Reports/Account/ExpenseSummary/index.js',
  'src/Modules/Reports/Account/IncomePersonalLoanReport/index.js',
  'src/Modules/Reports/HR/Leaving/index_of_daily.js',
  'src/Modules/Reports/HR/Leaving/index.js',
  'src/Modules/Reports/Parts/Income/index.js',
  'src/Modules/Reports/Marketing/SourceOfData/index.js',
  'src/Modules/Reports/Marketing/Customers/index.js',
  'src/Modules/Reports/Sales/Canceled/index.js',
  'src/Modules/Reports/Warehouses/Vehicles/TransferIn/index.js',
  'src/Modules/Reports/Warehouses/Vehicles/TransferOut/index.js'
];

function fixDuplicateImports(content) {
  // Find all useGeographicData imports
  const importRegex = /import\s*{\s*useGeographicData\s*}\s*from\s*['"]hooks\/useGeographicData['"];?\s*/g;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 1) {
    // Remove all duplicates except the first one
    for (let i = 1; i < matches.length; i++) {
      content = content.replace(matches[i][0], '');
    }
    return { content, fixed: true };
  }
  
  return { content, fixed: false };
}

function addMissingHookDeclaration(content) {
  // Check if getDefaultBranch is used but not declared
  const usesGetDefaultBranch = content.includes('getDefaultBranch()');
  const hasHookDeclaration = content.includes('getDefaultBranch } = useGeographicData');
  
  if (usesGetDefaultBranch && !hasHookDeclaration) {
    // Find user selector and add hook after it
    const userSelectorMatch = content.match(/(const\s*{\s*user[^}]*}\s*=\s*useSelector[^;]+;)/);
    if (userSelectorMatch) {
      const replacement = userSelectorMatch[0] + '\n  const { getDefaultBranch } = useGeographicData();';
      content = content.replace(userSelectorMatch[0], replacement);
      return { content, fixed: true };
    }
  }
  
  return { content, fixed: false };
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Fix duplicate imports
    const { content: contentAfterImports, fixed: importFixed } = fixDuplicateImports(content);
    content = contentAfterImports;
    if (importFixed) {
      modified = true;
      console.log(`🔧 Fixed duplicate imports in: ${filePath}`);
    }
    
    // Add missing hook declaration
    const { content: contentAfterHook, fixed: hookFixed } = addMissingHookDeclaration(content);
    content = contentAfterHook;
    if (hookFixed) {
      modified = true;
      console.log(`🎯 Added missing hook declaration in: ${filePath}`);
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting compilation error fixes...\n');
  
  let totalFixed = 0;
  let totalProcessed = 0;
  
  filesToCheck.forEach(file => {
    totalProcessed++;
    if (processFile(file)) {
      totalFixed++;
    }
  });
  
  console.log(`\n📊 Compilation fix summary:`);
  console.log(`   Files processed: ${totalProcessed}`);
  console.log(`   Files modified: ${totalFixed}`);
  console.log(`   Success rate: ${totalProcessed ? Math.round((totalFixed/totalProcessed)*100) : 0}%`);
  
  if (totalFixed > 0) {
    console.log(`\n✅ Successfully fixed compilation errors!`);
    console.log(`\n📋 Issues fixed:`);
    console.log(`   • Duplicate useGeographicData imports`);
    console.log(`   • Missing getDefaultBranch hook declarations`);
  } else {
    console.log(`\n⚠️  No compilation errors found in checked files.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, fixDuplicateImports, addMissingHookDeclaration }; 