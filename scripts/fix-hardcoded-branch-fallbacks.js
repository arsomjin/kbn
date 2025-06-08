/**
 * Fix Hardcoded Branch Fallbacks Script
 * Replaces hardcoded "0450" branch fallbacks with proper RBAC-based defaults
 */

const fs = require('fs');
const path = require('path');

// Files to fix with their specific replacement patterns
const filesToFix = [
  // Employee Details
  {
    file: 'src/Modules/Employees/components/EmployeeDetails.js',
    changes: [
      {
        search: `import { showLog } from 'utils';
import { useSelector } from 'react-redux';`,
        replace: `import { showLog } from 'utils';
import { useSelector } from 'react-redux';
import { useGeographicData } from 'hooks/useGeographicData';`
      },
      {
        search: `const { user } = useSelector((state) => state.auth);`,
        replace: `const { user } = useSelector((state) => state.auth);
  const { getDefaultBranch } = useGeographicData();`
      },
      {
        search: `branch: selectedEmployee.branch || '0450',`,
        replace: `branch: selectedEmployee.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',`
      }
    ]
  },

  // Service Reports
  {
    file: 'src/Modules/Reports/Services/Daily/List/index.js',
    changes: [
      {
        search: `import { useSelector } from 'react-redux';`,
        replace: `import { useSelector } from 'react-redux';
import { useGeographicData } from 'hooks/useGeographicData';`
      },
      {
        search: `const { user } = useSelector((state) => state.auth);`,
        replace: `const { user } = useSelector((state) => state.auth);
  const { getDefaultBranch } = useGeographicData();`
      },
      {
        search: `branchCode: user?.branch || '0450',`,
        replace: `branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',`
      }
    ]
  },

  // Income Daily - Vehicles Component
  {
    file: 'src/Modules/Account/screens/Income/IncomeDaily/components/IncomeVehicles/index.js',
    changes: [
      {
        search: `import { useSelector } from 'react-redux';`,
        replace: `import { useSelector } from 'react-redux';
import { useGeographicData } from 'hooks/useGeographicData';`
      },
      {
        search: `const { user } = useSelector((state) => state.auth);`,
        replace: `const { user } = useSelector((state) => state.auth);
  const { getDefaultBranch } = useGeographicData();`
      },
      {
        search: `branchCode: mOrder?.branchCode || user.branch || '0450',`,
        replace: `branchCode: mOrder?.branchCode || user.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',`
      },
      {
        search: `branchCode: order?.branchCode || user.branch || '0450'`,
        replace: `branchCode: order?.branchCode || user.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'`
      }
    ]
  },

  // Common Page Header
  {
    file: 'src/components/common/PageHeader.js',
    changes: [
      {
        search: `import { useSelector } from 'react-redux';`,
        replace: `import { useSelector } from 'react-redux';
import { useGeographicData } from 'hooks/useGeographicData';`
      },
      {
        search: `const { user } = useSelector((state) => state.auth);`,
        replace: `const { user } = useSelector((state) => state.auth);
  const { getDefaultBranch } = useGeographicData();`
      },
      {
        search: `branch: defaultBranch || user?.branch || '0450',`,
        replace: `branch: defaultBranch || user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',`
      }
    ]
  }
];

// Generic replacement patterns for files that follow similar patterns
const genericPatterns = [
  // Pattern 1: branchCode: user?.branch || '0450'
  {
    pattern: /branchCode:\s*user\?\.branch\s*\|\|\s*'0450'/g,
    replacement: "branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  },
  
  // Pattern 2: branchCode: user.branch || '0450'
  {
    pattern: /branchCode:\s*user\.branch\s*\|\|\s*'0450'/g,
    replacement: "branchCode: user.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  },
  
  // Pattern 3: branch: user?.branch || '0450'  
  {
    pattern: /branch:\s*user\?\.branch\s*\|\|\s*'0450'/g,
    replacement: "branch: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450'"
  },
  
  // Pattern 4: useState(user?.branch || '0450')
  {
    pattern: /useState\(user\?\.branch\s*\|\|\s*'0450'\)/g,
    replacement: "useState(user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450')"
  }
];

// Files that need useGeographicData import added
const filesToAddImport = [
  'src/Modules/Reports/Services/Daily/List/index.js',
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
  'src/Modules/Reports/Account/IncomeExpenseSummary/index.js',
  'src/Modules/Reports/Account/BankDeposit_V1/index.js',
  'src/Modules/Reports/Account/IncomeExpenseSummary_bak/index.js',
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

function addImportIfNeeded(filePath, content) {
  // Check if file already has useGeographicData import
  if (content.includes('useGeographicData')) {
    return content;
  }
  
  // Check if file has React hooks imports
  const reactImportMatch = content.match(/import\s+{[^}]*}\s+from\s+['"]react['"];?/);
  if (reactImportMatch) {
    const importLine = reactImportMatch[0];
    return content.replace(importLine, importLine + '\nimport { useGeographicData } from \'hooks/useGeographicData\';');
  }
  
  // Check if file has other imports
  const importMatch = content.match(/import[^;]+;/);
  if (importMatch) {
    const firstImport = importMatch[0];
    return content.replace(firstImport, firstImport + '\nimport { useGeographicData } from \'hooks/useGeographicData\';');
  }
  
  return content;
}

function addHookDeclaration(content) {
  // Check if hook is already declared
  if (content.includes('getDefaultBranch')) {
    return content;
  }
  
  // Find user selector and add hook after it
  const userSelectorMatch = content.match(/(const\s+{\s*user[^}]*}\s*=\s*useSelector[^;]+;)/);
  if (userSelectorMatch) {
    const userSelector = userSelectorMatch[0];
    return content.replace(userSelector, userSelector + '\n  const { getDefaultBranch } = useGeographicData();');
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
    
    // Add import if needed
    if (filesToAddImport.includes(filePath)) {
      const originalContent = content;
      content = addImportIfNeeded(filePath, content);
      if (content !== originalContent) {
        modified = true;
        console.log(`📦 Added useGeographicData import to: ${filePath}`);
      }
    }
    
    // Add hook declaration if needed
    if (filesToAddImport.includes(filePath)) {
      const originalContent = content;
      content = addHookDeclaration(content);
      if (content !== originalContent) {
        modified = true;
        console.log(`🔧 Added getDefaultBranch hook to: ${filePath}`);
      }
    }
    
    // Apply generic patterns
    genericPatterns.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      if (content !== originalContent) {
        modified = true;
        console.log(`✅ Applied pattern fix to: ${filePath}`);
      }
    });
    
    // Apply specific file changes
    const fileConfig = filesToFix.find(config => config.file === filePath);
    if (fileConfig) {
      fileConfig.changes.forEach(({ search, replace }) => {
        if (content.includes(search)) {
          content = content.replace(search, replace);
          modified = true;
          console.log(`🎯 Applied specific fix to: ${filePath}`);
        }
      });
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
  console.log('🚀 Starting hardcoded branch fallback fixes...\n');
  
  let totalFixed = 0;
  let totalProcessed = 0;
  
  // Process specific files
  filesToFix.forEach(({ file }) => {
    totalProcessed++;
    if (processFile(file)) {
      totalFixed++;
    }
  });
  
  // Process files that need imports
  filesToAddImport.forEach(file => {
    if (!filesToFix.some(config => config.file === file)) {
      totalProcessed++;
      if (processFile(file)) {
        totalFixed++;
      }
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${totalProcessed}`);  
  console.log(`   Files modified: ${totalFixed}`);
  console.log(`   Success rate: ${totalProcessed ? Math.round((totalFixed/totalProcessed)*100) : 0}%`);
  
  if (totalFixed > 0) {
    console.log(`\n✅ Successfully replaced hardcoded "0450" fallbacks with RBAC-based defaults!`);
    console.log(`\n📋 What was changed:`);
    console.log(`   • Added useGeographicData imports where needed`);
    console.log(`   • Added getDefaultBranch() hook declarations`);
    console.log(`   • Replaced "0450" fallbacks with proper hierarchy:`);
    console.log(`     1. user?.branch (existing logic)`);
    console.log(`     2. getDefaultBranch() (RBAC default)`);
    console.log(`     3. user?.homeBranch (user's home branch)`);
    console.log(`     4. user?.allowedBranches?.[0] (first allowed branch)`);
    console.log(`     5. "0450" (final fallback for backward compatibility)`);
  } else {
    console.log(`\n⚠️  No files were modified. This might mean:`);
    console.log(`   • Files have already been fixed (good!)`);
    console.log(`   • Files were not found or have different patterns`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, filesToFix, genericPatterns }; 