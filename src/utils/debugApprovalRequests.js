/**
 * Debug Approval Requests Utility
 * Helps analyze approval request data structure for troubleshooting
 */

import { app } from '../firebase';

/**
 * Debug approval requests collection
 */
export const debugApprovalRequests = async () => {
  console.log('🔍 DEBUGGING APPROVAL REQUESTS...');
  
  try {
    // Get all approval requests
    const snapshot = await app.firestore()
      .collection('approvalRequests')
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`📊 Total approval requests: ${snapshot.docs.length}`);
    
    if (snapshot.empty) {
      console.log('❌ No approval requests found');
      
      // Create a sample approval request for testing
      console.log('🔧 Creating sample approval request for testing...');
      
      const sampleRequest = {
        status: 'pending',
        requestType: 'new_user',
        targetProvince: 'nakhon-sawan',
        targetBranch: 'NSN001',
        createdAt: Date.now(),
        userData: {
          userId: 'sample-user-id',
          email: 'sales.lead@kbn.com',
          displayName: 'Sales Lead NSN001',
          firstName: 'Sales',
          lastName: 'Lead',
          department: 'sales',
          access: {
            authority: 'LEAD',
            departments: ['SALES'],
            geographic: {
              scope: 'BRANCH',
              homeProvince: 'nakhon-sawan',
              homeBranch: 'NSN001'
            }
          }
        }
      };
      
      const docRef = await app.firestore()
        .collection('approvalRequests')
        .add(sampleRequest);
      
      console.log('✅ Sample approval request created:', docRef.id);
      return;
    }
    
    // Analyze existing requests
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📋 APPROVAL REQUESTS ANALYSIS:');
    console.table(requests.map(req => ({
      id: req.id,
      status: req.status,
      type: req.requestType,
      userEmail: req.userData?.email,
      userName: req.userData?.displayName || `${req.userData?.firstName} ${req.userData?.lastName}`,
      department: req.userData?.department || req.userData?.access?.departments?.[0],
      targetProvince: req.targetProvince,
      targetBranch: req.targetBranch,
      hasCleanSlateAccess: !!req.userData?.access,
      createdAt: new Date(req.createdAt).toLocaleString('th-TH')
    })));
    
    // Detailed analysis of first request
    if (requests.length > 0) {
      console.log('🔍 DETAILED ANALYSIS OF FIRST REQUEST:');
      const firstRequest = requests[0];
      console.log('Full request data:', firstRequest);
      console.log('UserData structure:', firstRequest.userData);
      console.log('Access structure:', firstRequest.userData?.access);
    }
    
    // Check for data issues
    const issuesFound = [];
    
    requests.forEach((req, index) => {
      if (!req.userData) {
        issuesFound.push(`Request ${index}: Missing userData`);
      }
      if (!req.userData?.email) {
        issuesFound.push(`Request ${index}: Missing email`);
      }
      if (!req.userData?.displayName && !req.userData?.firstName) {
        issuesFound.push(`Request ${index}: Missing name information`);
      }
      if (!req.targetProvince) {
        issuesFound.push(`Request ${index}: Missing targetProvince`);
      }
      if (!req.targetBranch) {
        issuesFound.push(`Request ${index}: Missing targetBranch`);
      }
    });
    
    if (issuesFound.length > 0) {
      console.warn('⚠️ DATA ISSUES FOUND:');
      issuesFound.forEach(issue => console.warn(`  - ${issue}`));
    } else {
      console.log('✅ No data issues found');
    }
    
    return requests;
    
  } catch (error) {
    console.error('❌ Error debugging approval requests:', error);
    throw error;
  }
};

/**
 * Create sample approval request for testing
 */
export const createSampleApprovalRequest = async () => {
  console.log('🔧 Creating sample approval request...');
  
  const sampleRequests = [
    {
      status: 'pending',
      requestType: 'new_user',
      targetProvince: 'nakhon-sawan',
      targetBranch: 'NSN001',
      createdAt: Date.now(),
      userData: {
        userId: 'sales-lead-nsn001',
        email: 'sales.lead@nsn001.kbn.com',
        displayName: 'ผู้นำทีมขาย NSN001',
        firstName: 'ผู้นำทีม',
        lastName: 'ขาย',
        department: 'sales',
        access: {
          authority: 'LEAD',
          departments: ['SALES'],
          geographic: {
            scope: 'BRANCH',
            homeProvince: 'nakhon-sawan',
            homeBranch: 'NSN001',
            allowedProvinces: ['nakhon-sawan'],
            allowedBranches: ['NSN001']
          }
        }
      }
    },
    {
      status: 'pending',
      requestType: 'role_change',
      targetProvince: 'nakhon-sawan',
      targetBranch: 'NSN002',
      createdAt: Date.now() - 86400000, // 1 day ago
      userData: {
        userId: 'accounting-staff-nsn002',
        email: 'accounting@nsn002.kbn.com',
        displayName: 'เจ้าหน้าที่บัญชี NSN002',
        firstName: 'เจ้าหน้าที่',
        lastName: 'บัญชี',
        department: 'accounting',
        access: {
          authority: 'STAFF',
          departments: ['ACCOUNTING'],
          geographic: {
            scope: 'BRANCH',
            homeProvince: 'nakhon-sawan',
            homeBranch: 'NSN002',
            allowedProvinces: ['nakhon-sawan'],
            allowedBranches: ['NSN002']
          }
        }
      }
    }
  ];
  
  try {
    const promises = sampleRequests.map(request => 
      app.firestore().collection('approvalRequests').add(request)
    );
    
    const results = await Promise.all(promises);
    
    console.log('✅ Sample approval requests created:');
    results.forEach((docRef, index) => {
      console.log(`  - ${docRef.id}: ${sampleRequests[index].userData.email}`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error creating sample requests:', error);
    throw error;
  }
};

export default {
  debugApprovalRequests,
  createSampleApprovalRequest
}; 