/**
 * 🚨 FIX CORRUPTED USER DATA
 * User: Phichayanan Suk (U17lNRYmMZRKM87OZH3OVlnyR1p1)
 * Issue: Mixed legacy and Clean Slate structures causing auth failures
 */

import { app } from './firebase';

const USER_ID = 'U17lNRYmMZRKM87OZH3OVlnyR1p1';

/**
 * Fix corrupted user data by creating proper Clean Slate structure
 */
const fixCorruptedUserData = async () => {
  console.log('🚨 Fixing corrupted user data...');
  console.log('User ID:', USER_ID);
  console.log('User: Phichayanan Suk');
  
  try {
    // Get current user data
    const userRef = app.firestore().collection('users').doc(USER_ID);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User document not found');
    }
    
    const currentData = userDoc.data();
    console.log('📋 Current corrupted data keys:', Object.keys(currentData));
    
    // Create proper Clean Slate structure
    const cleanSlateUser = {
      // Essential user data
      uid: USER_ID,
      email: 'phichayanan@happyinnovation.net',
      displayName: 'Phichayanan Suk',
      firstName: 'Phichayanan',
      lastName: 'Suk',
      
      // Clean Slate RBAC structure
      access: {
        authority: 'STAFF',
        geographic: {
          scope: 'BRANCH',
          allowedProvinces: ['nakhon-sawan'],
          allowedBranches: ['NSN001'],
          homeProvince: 'nakhon-sawan',
          homeBranch: 'NSN001'
        },
        departments: ['sales']
      },
      
      // Status - APPROVED for testing
      isActive: true,
      isApproved: true,
      approvalStatus: 'approved',
      
      // System metadata
      isDev: false,
      userType: 'staff',
      created: currentData.created || Date.now(),
      updatedAt: Date.now(),
      lastLogin: Date.now(),
      
      // Migration tracking
      migratedAt: Date.now(),
      migrationType: 'corruption-fix'
    };
    
    console.log('✅ Clean Slate structure created:', {
      uid: cleanSlateUser.uid,
      authority: cleanSlateUser.access.authority,
      geographic: cleanSlateUser.access.geographic.scope,
      departments: cleanSlateUser.access.departments,
      isActive: cleanSlateUser.isActive,
      isApproved: cleanSlateUser.isApproved
    });
    
    // Replace the corrupted data with clean structure
    await userRef.set(cleanSlateUser, { merge: false });
    
    console.log('🎉 User data fixed successfully!');
    console.log('✅ User can now sign in properly');
    
    return cleanSlateUser;
    
  } catch (error) {
    console.error('❌ Error fixing user data:', error);
    throw error;
  }
};

// Export for manual execution
window.fixCorruptedUserData = fixCorruptedUserData;

// Auto-execute in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Corrupted user data fix utility loaded');
  console.log('Run: fixCorruptedUserData() to fix the user');
}

export default fixCorruptedUserData; 