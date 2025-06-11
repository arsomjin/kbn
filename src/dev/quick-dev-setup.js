// Quick Dev Setup - Run this once to give yourself full dev access
import { app } from '../firebase';

export const setupDevUser = async () => {
  try {
    const currentUser = app.auth().currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    console.log('Setting up dev access for:', currentUser.uid);

    // Set as dev user with full access
    await app.firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update({
        // Dev flags
        isDev: true,
        isActive: true,
        
        // Auth status
        'auth.isActive': true,
        'auth.isApproved': true,
        'auth.approvalStatus': 'approved',
        
        // Basic RBAC structure
        access: {
          authority: 'ADMIN',
          departments: ['all'],
          permissions: ['*'],
          geographic: {
            assignedProvinces: ['nakhon-ratchasima', 'nakhon-sawan'],
            assignedBranches: ['0450', 'NMA002', 'NMA003', 'NSN001', 'NSN002', 'NSN003'],
            homeProvince: 'nakhon-ratchasima',
            homeBranch: '0450'
          },
          isActive: true,
          lastUpdate: Date.now(),
          updatedBy: 'quick-dev-setup'
        }
      });

    console.log('✅ Dev access setup complete!');
    console.log('You now have full access to everything.');
    console.log('Refresh the page to see changes.');
    
    return true;
  } catch (error) {
    console.error('Error setting up dev access:', error);
    return false;
  }
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  window.setupDevUser = setupDevUser;
  console.log('Run setupDevUser() in console to get full dev access');
} 