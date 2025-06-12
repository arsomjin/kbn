/**
 * 🔍 DEBUG USER DATA
 * Utility to analyze what data users actually contain
 */

import { app } from '../firebase';

/**
 * Extract any available identifying information from user data
 * (Same logic as migration script)
 * @param {Object} user - User object
 * @returns {Object} Extracted data
 */
const extractUserIdentity = (user) => {
  // Try to find email from various locations
  const email = user.email || 
                user.auth?.email || 
                user.auth?.providerData?.[0]?.email ||
                null;
  
  // Try to find display name from various locations
  const displayName = user.displayName || 
                     user.auth?.displayName ||
                     user.auth?.providerData?.[0]?.displayName ||
                     `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                     null;
  
  // Try to find first/last name from various locations
  const firstName = user.firstName || 
                   user.auth?.firstName ||
                   user.givenName ||
                   null;
  
  const lastName = user.lastName || 
                  user.auth?.lastName ||
                  user.familyName ||
                  null;
  
  return {
    email,
    displayName,
    firstName,
    lastName,
    photoURL: user.photoURL || user.auth?.photoURL || user.auth?.providerData?.[0]?.photoURL || null
  };
};

/**
 * Analyze user data structure to understand what fields are available
 * @param {Object} options - Debug options
 * @returns {Promise<Object>} Analysis results
 */
export const debugUserData = async (options = {}) => {
  const { sampleSize = 10, showAllFields = false } = options;
  
  console.log('🔍 DEBUGGING USER DATA STRUCTURE...');
  console.log('='.repeat(50));
  console.log(`Analyzing ${sampleSize} users to understand data structure`);
  console.log('');
  
  const results = {
    totalUsers: 0,
    sampleSize: 0,
    fieldFrequency: {},
    sampleUsers: [],
    commonPatterns: [],
    extractionTest: []
  };
  
  try {
    // Get all users from Firestore
    const usersSnapshot = await app.firestore().collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    results.totalUsers = users.length;
    console.log(`📊 Total users in database: ${users.length}`);
    console.log('');
    
    // Analyze a sample of users
    const sampleUsers = users.slice(0, sampleSize);
    results.sampleSize = sampleUsers.length;
    
    console.log(`🔬 Analyzing ${sampleUsers.length} sample users:`);
    console.log('');
    
    // Track field frequency
    const fieldFreq = {};
    
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i];
      console.log(`User ${i + 1}: ${user.uid}`);
      
      // Get all fields for this user
      const userFields = Object.keys(user);
      console.log(`  Fields (${userFields.length}): ${userFields.join(', ')}`);
      
      // Track which fields this user has
      userFields.forEach(field => {
        fieldFreq[field] = (fieldFreq[field] || 0) + 1;
      });
      
      // Show specific field values for key fields
      const keyFields = ['email', 'displayName', 'firstName', 'lastName', 'accessLevel', 'auth', 'access'];
      console.log(`  Key field values:`);
      keyFields.forEach(field => {
        const value = user[field];
        if (value !== undefined) {
          if (typeof value === 'object') {
            console.log(`    ${field}: [object] ${JSON.stringify(value, null, 2).substring(0, 100)}...`);
          } else {
            console.log(`    ${field}: "${value}"`);
          }
        } else {
          console.log(`    ${field}: [missing]`);
        }
      });
      
      // TEST EXTRACTION LOGIC
      console.log(`  🧪 EXTRACTION TEST:`);
      const extracted = extractUserIdentity(user);
      console.log(`    Extracted email: "${extracted.email || 'NONE'}"`);
      console.log(`    Extracted displayName: "${extracted.displayName || 'NONE'}"`);
      console.log(`    Extracted firstName: "${extracted.firstName || 'NONE'}"`);
      console.log(`    Extracted lastName: "${extracted.lastName || 'NONE'}"`);
      
      // Generate what the migration would create
      const uidShort = user.uid.slice(0, 8);
      const fallbackEmail = extracted.email || `user-${user.uid}@kbn-system.local`;
      const fallbackDisplayName = extracted.displayName || 
                                 `${extracted.firstName || 'User'} ${extracted.lastName || uidShort}`.trim();
      
      console.log(`  🔄 MIGRATION WOULD CREATE:`);
      console.log(`    Final email: "${fallbackEmail}"`);
      console.log(`    Final displayName: "${fallbackDisplayName}"`);
      console.log(`    Would generate fallbacks: ${!extracted.email ? 'email ' : ''}${!extracted.displayName ? 'displayName ' : ''}${!extracted.firstName ? 'firstName ' : ''}${!extracted.lastName ? 'lastName' : ''}`);
      
      // Store extraction test results
      results.extractionTest.push({
        uid: user.uid,
        original: {
          topLevelEmail: user.email,
          authEmail: user.auth?.email,
          topLevelDisplayName: user.displayName,
          authDisplayName: user.auth?.displayName
        },
        extracted: extracted,
        final: {
          email: fallbackEmail,
          displayName: fallbackDisplayName
        },
        wouldGenerateFallbacks: {
          email: !extracted.email,
          displayName: !extracted.displayName,
          firstName: !extracted.firstName,
          lastName: !extracted.lastName
        }
      });
      
      // Store sample data
      results.sampleUsers.push({
        uid: user.uid,
        fields: userFields,
        keyData: {
          email: user.email,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          hasAuth: !!user.auth,
          hasAccess: !!user.access,
          accessLevel: user.accessLevel
        }
      });
      
      console.log('');
    }
    
    // Calculate field frequency
    results.fieldFrequency = Object.entries(fieldFreq)
      .map(([field, count]) => ({
        field,
        count,
        percentage: Math.round((count / sampleUsers.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    
    console.log('📊 FIELD FREQUENCY ANALYSIS:');
    console.log('='.repeat(30));
    results.fieldFrequency.forEach(({ field, count, percentage }) => {
      console.log(`${field.padEnd(20)} ${count}/${sampleUsers.length} (${percentage}%)`);
    });
    console.log('');
    
    // Analyze patterns
    const patterns = {
      hasEmail: results.sampleUsers.filter(u => u.keyData.email).length,
      hasDisplayName: results.sampleUsers.filter(u => u.keyData.displayName).length,
      hasFirstName: results.sampleUsers.filter(u => u.keyData.firstName).length,
      hasLastName: results.sampleUsers.filter(u => u.keyData.lastName).length,
      hasAuthObject: results.sampleUsers.filter(u => u.keyData.hasAuth).length,
      hasAccessObject: results.sampleUsers.filter(u => u.keyData.hasAccess).length,
      hasAnyNameField: results.sampleUsers.filter(u => 
        u.keyData.email || u.keyData.displayName || u.keyData.firstName || u.keyData.lastName
      ).length
    };
    
    console.log('🔍 PATTERN ANALYSIS:');
    console.log('='.repeat(20));
    Object.entries(patterns).forEach(([pattern, count]) => {
      const percentage = Math.round((count / sampleUsers.length) * 100);
      console.log(`${pattern.padEnd(20)} ${count}/${sampleUsers.length} (${percentage}%)`);
    });
    
    // EXTRACTION SUCCESS ANALYSIS
    const extractionSuccess = {
      canExtractEmail: results.extractionTest.filter(t => t.extracted.email).length,
      canExtractDisplayName: results.extractionTest.filter(t => t.extracted.displayName).length,
      wouldSkipOldValidation: results.extractionTest.filter(t => 
        !t.extracted.email && !t.extracted.displayName && !t.extracted.firstName && !t.extracted.lastName
      ).length,
      wouldMigrateNewValidation: results.extractionTest.filter(t => t.uid).length // All with UID
    };
    
    console.log('');
    console.log('🧪 EXTRACTION SUCCESS ANALYSIS:');
    console.log('='.repeat(35));
    Object.entries(extractionSuccess).forEach(([metric, count]) => {
      const percentage = Math.round((count / sampleUsers.length) * 100);
      console.log(`${metric.padEnd(25)} ${count}/${sampleUsers.length} (${percentage}%)`);
    });
    
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    if (extractionSuccess.canExtractEmail > patterns.hasEmail) {
      console.log('✅ GOOD: Extraction finds more emails than top-level fields!');
      console.log(`   Found ${extractionSuccess.canExtractEmail} emails vs ${patterns.hasEmail} top-level emails`);
    }
    
    if (extractionSuccess.wouldSkipOldValidation > extractionSuccess.wouldSkipOldValidation * 0.1) {
      console.log('⚠️  Old validation would skip many users');
      console.log(`✅ New validation will migrate ${extractionSuccess.wouldMigrateNewValidation} users (all with UIDs)`);
    }
    
    if (patterns.hasAuthObject > 0) {
      console.log('📍 Auth objects contain valuable data for extraction');
    }
    
  } catch (error) {
    console.error('💥 Debug failed with error:', error);
    results.error = error.message;
  }
  
  return results;
};

// Browser console function
if (typeof window !== 'undefined') {
  window.DEBUG_USER_DATA = (sampleSize = 20) => {
    console.log('🔍 Starting user data analysis...');
    return debugUserData({ sampleSize, showAllFields: false });
  };
}

export default debugUserData; 