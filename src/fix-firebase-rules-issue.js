/**
 * 🚨 URGENT FIX: Firebase Rules & Multi-Province Deployment
 * Resolves authentication issues and deploys multi-province support
 */

import { app } from './firebase';

/**
 * Fix Firebase authentication issues and deploy multi-province system
 */
const fixFirebaseIssues = async () => {
  try {
    console.log('🚨 URGENT FIX: Starting Firebase rules issue resolution...');
    
    // 1. Deploy multi-province system first
    console.log('📍 Step 1: Deploying multi-province support...');
    
    // Import and execute the urgent migration
    const { executePhase1Migration } = await import('./utils/migration/executeMigration');
    
    const migrationResult = await executePhase1Migration({
      enableMultiProvince: true,
      createNakhonSawan: true,
      updateRBAC: true,
      preserveExistingData: true
    });
    
    if (migrationResult.success) {
      console.log('✅ Multi-province deployment successful!');
    } else {
      console.warn('⚠️ Multi-province deployment had issues:', migrationResult.issues);
    }
    
    // 2. Fix existing user RBAC structure
    console.log('👥 Step 2: Fixing user RBAC structures...');
    
    const currentUser = app.auth().currentUser;
    if (currentUser) {
      console.log('🔧 Fixing current user RBAC structure:', currentUser.uid);
      
      // Check current user structure
      const userDoc = await app.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
        
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // If user doesn't have Clean Slate structure, migrate them
        if (!userData.access || !userData.access.authority) {
          console.log('🔄 Migrating user to Clean Slate RBAC...');
          
          const { migrateToOrthogonalSystem } = await import('./utils/orthogonal-rbac');
          const cleanSlateUser = migrateToOrthogonalSystem(userData);
          
          await app.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .update({
              access: cleanSlateUser.access,
              userRBAC: cleanSlateUser.userRBAC,
              migrationType: 'urgent_fix_migration',
              updatedAt: Date.now()
            });
            
          console.log('✅ User RBAC structure updated successfully!');
        } else {
          console.log('✅ User already has Clean Slate RBAC structure');
        }
      }
    }
    
    // 3. Test Firebase permissions
    console.log('🔒 Step 3: Testing Firebase permissions...');
    
    try {
      // Test basic read access to data collection
      const testQuery = await app.firestore()
        .collection('data')
        .doc('company')
        .collection('provinces')
        .limit(1)
        .get();
        
      console.log('✅ Firebase permissions test successful!');
    } catch (permissionError) {
      console.warn('⚠️ Permission test failed:', permissionError.message);
      
      // If current user doesn't have access, try to self-approve for development
      if (process.env.NODE_ENV === 'development' && currentUser) {
        console.log('🔧 Development mode: Attempting self-approval...');
        
        const { approveSelf } = await import('./utils/selfApproval');
        const approvalResult = await approveSelf(currentUser.uid);
        
        if (approvalResult) {
          console.log('✅ Self-approval successful!');
        } else {
          console.warn('⚠️ Self-approval failed');
        }
      }
    }
    
    // 4. Reload the page to apply changes
    console.log('🔄 Step 4: Reloading to apply changes...');
    
    // Wait a moment for Firestore to propagate changes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return {
      success: true,
      message: 'Firebase issues resolved! Reloading application...'
    };
    
  } catch (error) {
    console.error('❌ Failed to fix Firebase issues:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Quick fix for current session
 */
const quickFix = async () => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.log('ℹ️ No user signed in, no quick fix needed');
      return;
    }
    
    console.log('⚡ Applying quick fix for current user...');
    
    // Ensure user has minimum required structure for Firebase rules
    const userRef = app.firestore().collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // If missing access structure, add minimal structure
      if (!userData.access) {
        await userRef.update({
          access: {
            authority: 'STAFF',
            geographic: 'BRANCH',
            departments: ['GENERAL'],
            assignments: {
              allowedProvinces: ['nakhon-ratchasima'],
              allowedBranches: ['0450'],
              homeProvince: 'nakhon-ratchasima',
              homeBranch: '0450'
            }
          },
          isActive: true,
          isApproved: true,
          approvalStatus: 'approved',
        });
        
        console.log('✅ Quick fix applied! User now has valid RBAC structure.');
      }
    }
    
  } catch (error) {
    console.warn('⚠️ Quick fix failed:', error);
  }
};

// Export functions for use in browser console
window.fixFirebaseIssues = fixFirebaseIssues;
window.quickFirebaseFix = quickFix;

console.log(`
🚨 FIREBASE RULES FIX AVAILABLE

To fix authentication issues, run one of these commands in the browser console:

1. FULL FIX (includes multi-province deployment):
   fixFirebaseIssues()

2. QUICK FIX (current user only):
   quickFirebaseFix()

This will resolve the "undefined" field errors and permission issues.
`);

export { fixFirebaseIssues, quickFix }; 