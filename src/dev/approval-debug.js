/**
 * Approval Status Debug Utility
 * Use this in browser console to debug approval issues
 */

import { app } from '../firebase';

// Debug current user approval status
export const debugApprovalStatus = async () => {
  const user = app.auth().currentUser;
  if (!user) {
    console.log('❌ No user currently signed in');
    return null;
  }

  console.log('🔍 Debugging approval status for user:', user.uid);

  try {
    // Get user document
    const userDoc = await app.firestore()
      .collection('users')
      .doc(user.uid)
      .get();

    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return null;
    }

    const userData = userDoc.data();
    const authStatus = userData.auth || {};
    const statusData = userData.status || {};
    const accessData = userData.access || {};

    const debugInfo = {
      uid: user.uid,
      email: user.email,
      
      // Legacy approval fields
      'auth.isApproved': authStatus.isApproved,
      'auth.isActive': authStatus.isActive,
      'auth.approvalStatus': authStatus.approvalStatus,
      
      // Status fields
      'status.isApproved': statusData.isApproved,
      'status.isActive': statusData.isActive,
      'status.approvalStatus': statusData.approvalStatus,
      
      // Clean Slate RBAC
      'access.authority': accessData.authority,
      hasCleanSlateRBAC: !!accessData.authority,
      
      // Current Redux state (if available)
      reduxAuthState: window.store?.getState?.()?.auth || 'Not available',
      
      // Computed status
      computedApprovalStatus: {
        isApproved: authStatus.isApproved ?? statusData.isApproved ?? false,
        isActive: authStatus.isActive ?? statusData.isActive ?? false,
        approvalStatus: authStatus.approvalStatus || statusData.approvalStatus || 'pending',
        hasCleanSlateRBAC: !!accessData.authority,
        shouldShowPendingPage: (!((authStatus.isApproved ?? statusData.isApproved ?? false) || !!accessData.authority)) || 
                               ((authStatus.approvalStatus || statusData.approvalStatus || 'pending') === 'pending' && !accessData.authority)
      }
    };

    console.table(debugInfo);
    console.log('📄 Full user document:', userData);

    return debugInfo;
  } catch (error) {
    console.error('❌ Error debugging approval status:', error);
    return null;
  }
};

// Quick fix for stuck approval status
export const forceApprovalFix = async () => {
  const user = app.auth().currentUser;
  if (!user) {
    console.log('❌ No user currently signed in');
    return false;
  }

  console.log('🔧 Forcing approval status fix for user:', user.uid);

  try {
    const timestamp = new Date().toISOString();
    
    // Force update all approval fields
    const updates = {
      'auth.isApproved': true,
      'auth.isActive': true,
      'auth.approvalStatus': 'approved',
      'auth.approvedBy': 'dev-force-fix',
      'auth.approvedAt': timestamp,
      'status.isApproved': true,
      'status.isActive': true,
      'status.approvalStatus': 'approved',
      'status.lastStatusUpdate': timestamp
    };

    await app.firestore()
      .collection('users')
      .doc(user.uid)
      .update(updates);

    console.log('✅ Forced approval status update completed');
    console.log('🔄 Reloading page to refresh auth state...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    return true;
  } catch (error) {
    console.error('❌ Error forcing approval fix:', error);
    return false;
  }
};

// Make available globally for console use
if (typeof window !== 'undefined') {
  window.debugApprovalStatus = debugApprovalStatus;
  window.forceApprovalFix = forceApprovalFix;
  
  console.log('🔧 Approval debug utilities loaded:');
  console.log('  - debugApprovalStatus() - Show detailed approval status');
  console.log('  - forceApprovalFix() - Force fix stuck approval status');
}

export default {
  debugApprovalStatus,
  forceApprovalFix
}; 