/**
 * Shared User Management Utilities
 * Functions shared between PermissionManagement and CleanSlatePermissionsDemo
 * to ensure 100% accuracy and maintainability
 */

import { message } from 'antd';
import { app } from '../firebase';

/**
 * Fetch all users with Clean Slate RBAC structure validation
 * @param {Object} options - Configuration options
 * @returns {Array} Array of users with Clean Slate validation
 */
export const fetchUsersWithCleanSlate = async (options = {}) => {
  const { includeDebug = false } = options;
  
  try {
    const snapshot = await app.firestore().collection('users').get();
    
    const usersData = snapshot.docs.map((doc) => {
      const userData = doc.data();
      
      // CLEAN SLATE RBAC ONLY - No fallback support
      // This enforces migration to Clean Slate format
      
      // Clean Slate RBAC structure (REQUIRED)
      const cleanSlateAccess = userData.access;
      
      if (!cleanSlateAccess) {
        console.warn('⚠️ User without Clean Slate RBAC structure found:', doc.id);
        console.warn('🔄 User needs migration - returning minimal data');
        
        return {
          uid: doc.id,
          displayName: userData.displayName || userData.email || 'ไม่ระบุชื่อ',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          accessLevel: 'NEEDS_MIGRATION',
          department: 'NEEDS_MIGRATION',
          departments: ['NEEDS_MIGRATION'],
          permissions: {},
          homeProvince: 'UNKNOWN',
          homeBranch: 'UNKNOWN',
          isActive: false,
          isApproved: false,
          _hasCleanSlate: false,
          _needsMigration: true
        };
      }
      
      // Extract data from Clean Slate structure ONLY
      const authority = cleanSlateAccess.authority || 'STAFF';
      const departments = cleanSlateAccess.departments || ['general'];
      const permissions = cleanSlateAccess.permissions || {};
      const homeProvince = cleanSlateAccess.geographic?.homeProvince;
      const homeBranch = cleanSlateAccess.geographic?.homeBranch;
      
      return {
        uid: doc.id,
        displayName: userData.displayName || 
                    `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                    'ไม่ระบุชื่อ',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        
        // Clean Slate data ONLY
        accessLevel: authority,
        department: departments[0], // Primary department
        departments: departments,   // All departments
        permissions: permissions,
        homeProvince: homeProvince,
        homeBranch: homeBranch,
        
        // Include full access structure for scope and geographic info
        access: cleanSlateAccess,
        
        // Status fields
        isActive: userData.isActive !== false, // Default to true unless explicitly false
        isApproved: userData.isApproved,
        
        // Migration tracking
        _hasCleanSlate: true,
        _hasEnhancedRBAC: false, // Not supported anymore
        _hasLegacyAuth: false,   // Not supported anymore
        
        // Store raw structure for debugging (remove in production)
        ...(includeDebug && process.env.NODE_ENV === 'development' && {
          _debug: {
            cleanSlateAccess,
            rawUserData: userData
          }
        })
      };
    });

    // Log migration status in development
    if (process.env.NODE_ENV === 'development') {
      const migrationStats = usersData.reduce((stats, user) => {
        if (user._needsMigration) stats.needsMigration++;
        else stats.cleanSlate++;
        return stats;
      }, { cleanSlate: 0, needsMigration: 0 });
      
      console.log('👥 User RBAC Status (Clean Slate Only):', migrationStats);
      
      if (migrationStats.needsMigration > 0) {
        console.warn(`⚠️ ${migrationStats.needsMigration} users need migration to Clean Slate RBAC`);
      }
    }

    return usersData;
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

/**
 * Update user role using Clean Slate RBAC structure ONLY
 * @param {Object} params - Update parameters
 * @returns {Promise} Update promise
 */
export const updateUserRoleCleanSlate = async ({ 
  selectedUser, 
  values, 
  currentUser,
  validateRoleAssignment 
}) => {
  try {
    // CLEAN SLATE RBAC ONLY - No fallback updates
    if (!selectedUser._hasCleanSlate) {
      console.error('🚨 Cannot update user without Clean Slate RBAC structure');
      const error = new Error('User needs Clean Slate RBAC migration');
      error.needsMigration = true;
      throw error;
    }
    
    const oldRole = selectedUser.accessLevel;
    const newRole = values.accessLevel;
    const oldAdditionalPerms = selectedUser.additionalPermissions || [];
    const newAdditionalPerms = values.additionalPermissions || [];
    
    // Validate role assignment if validator provided
    if (validateRoleAssignment) {
      const validation = validateRoleAssignment(newRole, currentUser.accessLevel);
      if (!validation.valid) {
        const error = new Error(validation.reason);
        error.validationFailed = true;
        throw error;
      }
    }

    // Import Clean Slate helpers
    const { createUserAccess } = await import('./orthogonal-rbac');
    const { 
      mapDepartmentToAuthority, 
      mapLocationToGeographic, 
      mapDepartmentToDepartments 
    } = await import('./clean-slate-helpers');

    // Map legacy values to Clean Slate structure
    const authority = mapDepartmentToAuthority(values.department, newRole);
    const geographic = mapLocationToGeographic(values.homeProvince, values.homeBranch);
    const departments = mapDepartmentToDepartments(values.department);

    // Create Clean Slate access structure
    const cleanSlateAccess = createUserAccess(
      authority,
      geographic,
      departments,
      {
        provinces: values.allowedProvinces || [values.homeProvince],
        branches: values.allowedBranches || [values.homeBranch],
        homeBranch: values.homeBranch
      }
    );

    // Clean Slate updates (remove all legacy fields)
    const updates = {
      // Clean Slate structure ONLY
      access: cleanSlateAccess,
      
      // User metadata
      department: values.department,
      
      // Status tracking
      isActive: true,
      isApproved: true,
      approvalStatus: 'approved',
      
      // System metadata
      updatedAt: Date.now(),
      updatedBy: currentUser.uid,
      migrationType: 'admin_update',
      
      // REMOVE legacy fields (clean up existing users)
      'auth.accessLevel': null,
      'auth.department': null,
      'auth.homeProvince': null,
      'auth.homeBranch': null,
      'auth.allowedProvinces': null,
      'auth.allowedBranches': null,
      'userRBAC': null,
      'rbac': null,
      'accessLevel': null,
      'homeProvince': null,
      'homeBranch': null,
      'allowedProvinces': null,
      'allowedBranches': null,
      'role': null,
      'permissions': null
    };

    await app.firestore()
      .collection('users')
      .doc(selectedUser.uid)
      .update(updates);

    // Create audit log for role changes
    if (oldRole !== newRole || JSON.stringify(oldAdditionalPerms) !== JSON.stringify(newAdditionalPerms)) {
      const { createRoleChangeAuditLog } = await import('./rbac-enhanced');
      
      const auditLog = createRoleChangeAuditLog(
        selectedUser.uid,
        oldRole,
        newRole,
        oldAdditionalPerms,
        newAdditionalPerms,
        currentUser.uid,
        `Updated via shared utilities to Clean Slate by ${currentUser.displayName}`
      );
      
      await app.firestore()
        .collection('auditLogs')
        .add(auditLog);
    }

    return { success: true, message: 'อัปเดตข้อมูลผู้ใช้เป็น Clean Slate เรียบร้อยแล้ว' };
    
  } catch (error) {
    console.error('❌ Error updating user to Clean Slate:', error);
    
    if (error.needsMigration) {
      throw new Error('ผู้ใช้นี้ยังไม่ได้อพเยพข้อมูลเป็นรูปแบบ Clean Slate RBAC กรุณาอพเยพข้อมูลก่อน');
    }
    
    if (error.validationFailed) {
      throw error;
    }
    
    throw new Error('ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
  }
};

/**
 * Toggle user status using Clean Slate structure
 * @param {Object} params - Toggle parameters
 * @returns {Promise} Toggle promise
 */
export const toggleUserStatusCleanSlate = async ({ userId, currentStatus, currentUser }) => {
  try {
    const newStatus = !currentStatus;
    
    await app.firestore()
      .collection('users')
      .doc(userId)
      .update({
        // Clean Slate status fields
        isActive: newStatus,
        lastStatusUpdate: Date.now(),
        statusUpdatedBy: currentUser.uid,
        updatedAt: Date.now(),
        
        // Clear legacy status fields if they exist
        'auth.isActive': null,
        'auth.lastStatusUpdate': null,
        'auth.statusUpdatedBy': null
      });

    return { 
      success: true, 
      message: `${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ผู้ใช้เรียบร้อยแล้ว` 
    };
    
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    throw new Error('ไม่สามารถอัปเดตสถานะผู้ใช้ได้');
  }
};

/**
 * Delete (soft delete) user using Clean Slate structure
 * @param {Object} params - Delete parameters
 * @returns {Promise} Delete promise
 */
export const deleteUserCleanSlate = async ({ userId, currentUser }) => {
  try {
    // Mark as deleted using Clean Slate structure
    await app.firestore()
      .collection('users')
      .doc(userId)
      .update({
        // Clean Slate status fields
        isDeleted: true,
        isActive: false,
        approvalStatus: 'deleted',
        deletedAt: Date.now(),
        deletedBy: currentUser.uid,
        updatedAt: Date.now(),
        
        // Clear legacy fields if they exist
        'auth.isDeleted': null,
        'auth.isActive': null,
        'auth.deletedAt': null,
        'auth.deletedBy': null
      });

    return { success: true, message: 'ลบผู้ใช้เรียบร้อยแล้ว' };
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw new Error('ไม่สามารถลบผู้ใช้ได้');
  }
};

/**
 * Create a test user with Clean Slate RBAC structure
 * @param {Object} testUserConfig - Test user configuration
 * @param {Object} currentUser - Current user performing the action
 * @returns {Promise} Created user data
 */
export const createTestUserCleanSlate = async (testUserConfig, currentUser) => {
  try {
    const { createUserAccess } = await import('./orthogonal-rbac');
    
    // Create Clean Slate access structure
    const cleanSlateAccess = createUserAccess(
      testUserConfig.authority,
      {
        scope: testUserConfig.authority === 'ADMIN' ? 'ALL' : 
               testUserConfig.authority === 'MANAGER' ? 'PROVINCE' : 'BRANCH',
        allowedProvinces: testUserConfig.provinces || [],
        allowedBranches: testUserConfig.branches || [],
        homeProvince: testUserConfig.provinces?.[0],
        homeBranch: testUserConfig.branches?.[0]
      },
      [testUserConfig.department],
      {
        provinces: testUserConfig.provinces || [],
        branches: testUserConfig.branches || [],
        homeBranch: testUserConfig.branches?.[0]
      }
    );

    // Set specific permissions for this test user
    if (testUserConfig.permissions && cleanSlateAccess.permissions) {
      // Map permissions to Clean Slate structure
      testUserConfig.permissions.forEach(permission => {
        const [dept, action] = permission.split('.');
        if (cleanSlateAccess.permissions.departments[dept]) {
          cleanSlateAccess.permissions.departments[dept][action] = true;
        }
      });
    }

    const testUserData = {
      // Clean Slate RBAC structure ONLY
      access: cleanSlateAccess,
      
      // Basic user info
      uid: `test_${testUserConfig.department}_${Date.now()}`,
      email: `test.${testUserConfig.department}@test.kbn.com`,
      displayName: testUserConfig.name,
      
      // User metadata  
      department: testUserConfig.department,
      isActive: true,
      isApproved: true,
      approvalStatus: 'approved',
      
      // Test metadata
      isTestUser: true,
      testConfig: testUserConfig,
      
      // System metadata
      createdAt: Date.now(),
      createdBy: currentUser.uid,
      migrationType: 'test_user_creation'
    };

    return testUserData;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw new Error('ไม่สามารถสร้างผู้ใช้ทดสอบได้');
  }
};

/**
 * Validate Clean Slate RBAC structure
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 */
export const validateCleanSlateStructure = (userData) => {
  if (!userData) {
    return { valid: false, reason: 'No user data provided' };
  }

  if (!userData.access) {
    return { valid: false, reason: 'Missing Clean Slate access structure' };
  }

  if (!userData.access.authority) {
    return { valid: false, reason: 'Missing authority in access structure' };
  }

  if (!userData.access.geographic) {
    return { valid: false, reason: 'Missing geographic access configuration' };
  }

  if (!userData.access.departments || !Array.isArray(userData.access.departments)) {
    return { valid: false, reason: 'Missing or invalid departments configuration' };
  }

  return { valid: true, reason: 'Valid Clean Slate RBAC structure' };
};

/**
 * Get user display information for UI components
 * @param {Object} userData - User data
 * @returns {Object} Display information
 */
export const getUserDisplayInfo = (userData) => {
  const validation = validateCleanSlateStructure(userData);
  
  if (!validation.valid) {
    return {
      displayName: userData.displayName || 'Unknown User',
      status: 'needs_migration',
      statusText: 'ต้องการอพเยพข้อมูล',
      statusColor: 'orange',
      rbacStatus: validation.reason
    };
  }

  return {
    displayName: userData.displayName,
    status: userData.isActive ? 'active' : 'inactive',
    statusText: userData.isActive ? 'ใช้งานได้' : 'ไม่ใช้งาน',
    statusColor: userData.isActive ? 'green' : 'red',
    rbacStatus: 'Clean Slate ✅',
    authority: userData.access.authority,
    department: userData.access.departments?.[0] || 'Unknown',
    homeProvince: userData.access.geographic?.homeProvince,
    homeBranch: userData.access.geographic?.homeBranch
  };
};

/**
 * Shared error handler for user management operations
 * @param {Error} error - Error object
 * @param {string} operation - Operation name for context
 */
export const handleUserManagementError = (error, operation = 'operation') => {
  console.error(`❌ Error in ${operation}:`, error);
  
  if (error.needsMigration) {
    message.error({
      content: 'ผู้ใช้นี้ยังไม่ได้อพเยพข้อมูลเป็นรูปแบบ Clean Slate RBAC กรุณาอพเยพข้อมูลก่อน',
      duration: 4.5
    });
    return;
  }
  
  if (error.validationFailed) {
    message.error({
      content: error.message,
      duration: 4.5
    });
    return;
  }
  
  message.error({
    content: error.message || `เกิดข้อผิดพลาดในการ${operation} กรุณาลองใหม่อีกครั้ง`,
    duration: 4.5
  });
}; 