#!/usr/bin/env node

/**
 * 🔧 FIX NOTIFICATION INDEXES
 *
 * This script adds the missing Firebase indexes that are causing notification system errors:
 *
 * ERROR 1: approvalRequests collection missing index for:
 * - status (ASCENDING) + createdAt (DESCENDING) + __name__ (ASCENDING)
 *
 * ERROR 2: userNotifications collection missing index for:
 * - userId (ASCENDING) + createdAt (DESCENDING) + __name__ (ASCENDING)
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING NOTIFICATION FIREBASE INDEXES...\n');

// Read current indexes
const indexesPath = path.join(__dirname, 'firestore.indexes.json');
let currentIndexes;

try {
  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  currentIndexes = JSON.parse(indexesContent);
  console.log(
    `✅ Current indexes loaded: ${currentIndexes.indexes.length} indexes`
  );
} catch (error) {
  console.error('❌ Error reading current indexes:', error.message);
  process.exit(1);
}

// Define the missing indexes based on the error messages
const missingIndexes = [
  {
    name: 'approvalRequests: status + createdAt + __name__',
    index: {
      collectionGroup: 'approvalRequests',
      queryScope: 'COLLECTION',
      fields: [
        {
          fieldPath: 'status',
          order: 'ASCENDING',
        },
        {
          fieldPath: 'createdAt',
          order: 'DESCENDING',
        },
        {
          fieldPath: '__name__',
          order: 'ASCENDING',
        },
      ],
    },
  },
  {
    name: 'userNotifications: userId + createdAt + __name__',
    index: {
      collectionGroup: 'userNotifications',
      queryScope: 'COLLECTION',
      fields: [
        {
          fieldPath: 'userId',
          order: 'ASCENDING',
        },
        {
          fieldPath: 'createdAt',
          order: 'DESCENDING',
        },
        {
          fieldPath: '__name__',
          order: 'ASCENDING',
        },
      ],
    },
  },
];

// Check which indexes are actually missing
const existingIndexes = currentIndexes.indexes;
const indexesToAdd = [];

console.log('\n🔍 CHECKING FOR MISSING INDEXES...\n');

missingIndexes.forEach(({ name, index }) => {
  const exists = existingIndexes.some((existing) => {
    if (existing.collectionGroup !== index.collectionGroup) return false;
    if (existing.queryScope !== index.queryScope) return false;
    if (existing.fields.length !== index.fields.length) return false;

    return existing.fields.every((field, i) => {
      const expectedField = index.fields[i];
      return (
        field.fieldPath === expectedField.fieldPath &&
        field.order === expectedField.order
      );
    });
  });

  if (exists) {
    console.log(`✅ ${name} - Already exists`);
  } else {
    console.log(`❌ ${name} - MISSING - Will be added`);
    indexesToAdd.push(index);
  }
});

if (indexesToAdd.length === 0) {
  console.log('\n🎉 All required indexes already exist! No changes needed.');
  process.exit(0);
}

// Add missing indexes
console.log(`\n📝 ADDING ${indexesToAdd.length} MISSING INDEXES...\n`);

const updatedIndexes = {
  ...currentIndexes,
  indexes: [...currentIndexes.indexes, ...indexesToAdd],
};

// Create backup
const backupPath = path.join(
  __dirname,
  `firestore.indexes.backup-${Date.now()}.json`
);
fs.writeFileSync(backupPath, JSON.stringify(currentIndexes, null, 2));
console.log(`💾 Backup created: ${path.basename(backupPath)}`);

// Write updated indexes
fs.writeFileSync(indexesPath, JSON.stringify(updatedIndexes, null, 2));
console.log(
  `✅ Updated indexes file: ${updatedIndexes.indexes.length} total indexes`
);

// Create deployment script
const deployScript = `#!/bin/bash

echo "🚀 DEPLOYING NOTIFICATION INDEXES TO FIREBASE..."
echo ""
echo "📋 Indexes being deployed:"
${indexesToAdd.map((index, i) => `echo "   ${i + 1}. ${index.collectionGroup}: ${index.fields.map((f) => f.fieldPath).join(' + ')}"`).join('\n')}
echo ""

echo "🔥 Deploying to kubota-benjapol-test..."
firebase deploy --only firestore:indexes --project kubota-benjapol-test

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ NOTIFICATION INDEXES DEPLOYED SUCCESSFULLY!"
    echo ""
    echo "🧪 TEST THE NOTIFICATION SYSTEM:"
    echo "   1. Refresh your browser"
    echo "   2. Check console for notification errors"
    echo "   3. Test user approval notifications"
    echo ""
    echo "🚀 Ready for production deployment:"
    echo "   firebase deploy --only firestore:indexes --project kubota-benjapol"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED!"
    echo "Check the error messages above and try again."
fi
`;

const deployScriptPath = path.join(__dirname, 'deploy-notification-indexes.sh');
fs.writeFileSync(deployScriptPath, deployScript);
fs.chmodSync(deployScriptPath, '755');

console.log(`\n🚀 DEPLOYMENT READY!`);
console.log(`\n📋 SUMMARY:`);
console.log(`   • Added ${indexesToAdd.length} missing indexes`);
console.log(`   • Total indexes: ${updatedIndexes.indexes.length}`);
console.log(`   • Backup created: ${path.basename(backupPath)}`);
console.log(`   • Deploy script: deploy-notification-indexes.sh`);

console.log(`\n🎯 NEXT STEPS:`);
console.log(`   1. Run: ./deploy-notification-indexes.sh`);
console.log(`   2. Wait for deployment to complete`);
console.log(`   3. Refresh browser and test notifications`);

console.log(`\n🔍 EXPECTED FIXES:`);
console.log(`   ✅ No more "query requires an index" errors`);
console.log(`   ✅ User approval notifications working`);
console.log(`   ✅ Personal notifications loading properly`);
console.log(`   ✅ Real-time notification updates`);

console.log(`\n🎉 NOTIFICATION SYSTEM WILL BE FULLY FUNCTIONAL!`);
