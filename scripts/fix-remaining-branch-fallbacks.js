/**
 * Fix Remaining Hardcoded Branch Fallbacks
 * Handles additional patterns and files that the first script missed
 */

const fs = require('fs');
const path = require('path');

// Files with remaining hardcoded fallbacks that need fixing
const additionalFiles = [
  'src/Modules/Reports/Account/IncomeExpenseSummary/index.js',
  'src/Modules/Reports/Account/IncomeExpenseSummary_bak/index.js', 
  'src/Modules/Reports/Marketing/SourceOfData/index.js',
  'src/Modules/Reports/Warehouses/Vehicles/AllVehicles/index.js',
  'src/Modules/Reports/Warehouses/Vehicles/Stocks/index.js',
  'src/Modules/Reports/Warehouses/SimplePageWithListener/index.js',
  'src/Modules/Reports/Credit/Summary/index.js',
  'src/Modules/Reports/Sales/Canceled/index.js',
  'src/Modules/Reports/Credit/Summary_bak/index.js',
  'src/Modules/Reports/Sales/Summary/index.js',
  'src/Modules/Reports/Sales/Reservation/index.js',
  'src/Modules/Reports/Sales/Assessment/index.js',
  'src/Modules/Reports/Sales/Reservation_bak/index.js',
  'src/Modules/Reports/Sales/Bookings/Cancelled/index.js',
  'src/Modules/Reports/Sales/Bookings/Summary/index.js',
  'src/Modules/HR/Attendance1/index.js',
  'src/Modules/DataManagers/ExportFiles1/index.js',
  'src/Modules/DataManagers/ExportFiles/index.js',
  'src/Modules/Service/Input/GasCost/index.js',
  'src/Modules/HR/Leave/index.js',
  'src/Modules/Warehouses/Parts/Export/ByOther/index.js',
  'src/Modules/Warehouses/Parts/Export/ByOther/api.js',
  'src/Modules/Warehouses/Parts/Export/BySale/api.js',
  'src/Modules/Warehouses/Parts/Export/BySale/index.js',
  'src/Modules/Warehouses/Parts/Export/ByTransfer/api.js',
  'src/Modules/Warehouses/Parts/Export/ByTransfer/index.js',
  'src/Modules/Warehouses/Parts/Import/ByOther/index.js',
  'src/Modules/Warehouses/Parts/Import/ByOther/api.js',
  'src/Modules/Warehouses/Vehicles/Import/ByTransfer/index.js',
  'src/Modules/Warehouses/Parts/Import/ByTransfer/index.js',
  'src/Modules/Warehouses/Parts/Import/ByTransfer/api.js',
  'src/Modules/Warehouses/Giveaways/index.js',
  'src/Modules/Warehouses/Vehicles/Import/ByOther/index.js',
  'src/Modules/Warehouses/PurchasePlan/index.js',
  'src/Modules/Warehouses/Delivery/CustomerDeliver/index.js',
  'src/Modules/Warehouses/Vehicles/TransferSummary/index.js',
  'src/Modules/Warehouses/Vehicles/Export/ByOther/index.js',
  'src/Modules/Warehouses/Vehicles/Export/BySale/index.js'
];

// Additional patterns to replace
const additionalPatterns = [
  // Pattern with params fallback
  {
    pattern: /params\?\.branch \|\| user\?\.branch \|\| '0450'/g,
    replacement: "params?.branch || user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  },
  {
    pattern: /params\?\.branchCode \|\| user\?\.branch \|\| '0450'/g,
    replacement: "params?.branchCode || user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  },
  // Pattern with complex params check
  {
    pattern: /params && params\?\.branchCode \? params\.branchCode : user\?\.branch \|\| '0450'/g,
    replacement: "params && params?.branchCode ? params.branchCode : user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  },
  // Simple setState pattern
  {
    pattern: /useState\(user\?\.branch \|\| '0450'\)/g,
    replacement: "useState(user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450')"
  },
  // Branch property assignment
  {
    pattern: /branchCode: user\?\.branch \|\| '0450'/g,
    replacement: "branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  }
];

function addImportIfNeeded(content) {
  if (content.includes('useGeographicData')) {
    return content;
  }
  
  // Find React import and add after it
  const reactImportMatch = content.match(/import\s+{[^}]*}\s+from\s+['"]react['"];?/);
  if (reactImportMatch) {
    return content.replace(reactImportMatch[0], reactImportMatch[0] + '\nimport { useGeographicData } from \'hooks/useGeographicData\';');
  }
  
  // Find first import and add after it
  const importMatch = content.match(/import[^;]+;/);
  if (importMatch) {
    return content.replace(importMatch[0], importMatch[0] + '\nimport { useGeographicData } from \'hooks/useGeographicData\';');
  }
  
  return content;
}

function addHookDeclaration(content) {
  if (content.includes('getDefaultBranch')) {
    return content;
  }
  
  // Find user selector and add hook after it
  const userSelectorMatch = content.match(/(const\s+{\s*user[^}]*}\s*=\s*useSelector[^;]+;)/);
  if (userSelectorMatch) {
    return content.replace(userSelectorMatch[0], userSelectorMatch[0] + '\n  const { getDefaultBranch } = useGeographicData();');
  }
  
  return content;
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
    const originalContent = content;
    
    // Add import if needed
    content = addImportIfNeeded(content);
    if (content !== originalContent) {
      modified = true;
      console.log(`📦 Added useGeographicData import to: ${filePath}`);
    }
    
    // Add hook declaration if needed
    const afterImport = content;
    content = addHookDeclaration(content);
    if (content !== afterImport) {
      modified = true;
      console.log(`🔧 Added getDefaultBranch hook to: ${filePath}`);
    }
    
    // Apply additional patterns
    additionalPatterns.forEach(({ pattern, replacement }) => {
      const beforePattern = content;
      content = content.replace(pattern, replacement);
      if (content !== beforePattern) {
        modified = true;
        console.log(`✅ Applied pattern fix to: ${filePath}`);
      }
    });
    
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
  console.log('🚀 Starting additional hardcoded branch fallback fixes...\n');
  
  let totalFixed = 0;
  let totalProcessed = 0;
  
  additionalFiles.forEach(file => {
    totalProcessed++;
    if (processFile(file)) {
      totalFixed++;
    }
  });
  
  console.log(`\n📊 Additional fixes summary:`);
  console.log(`   Files processed: ${totalProcessed}`);
  console.log(`   Files modified: ${totalFixed}`);
  console.log(`   Success rate: ${totalProcessed ? Math.round((totalFixed/totalProcessed)*100) : 0}%`);
  
  if (totalFixed > 0) {
    console.log(`\n✅ Successfully fixed additional hardcoded "0450" fallbacks!`);
    console.log(`\n📋 Patterns fixed:`);
    console.log(`   • params?.branch || user?.branch || '0450'`);
    console.log(`   • params?.branchCode || user?.branch || '0450'`);
    console.log(`   • useState(user?.branch || '0450')`);
    console.log(`   • Complex parameter checks with '0450' fallbacks`);
  } else {
    console.log(`\n⚠️  No additional files were modified.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, additionalFiles, additionalPatterns }; 