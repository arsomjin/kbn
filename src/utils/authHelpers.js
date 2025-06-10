/**
 * Authentication Helper Utilities
 * Simplifies user status checking and auth flow logic
 */

export const USER_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending', 
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

export const USER_TYPES = {
  NEW: 'new',
  EXISTING: 'existing',
  ADMIN: 'admin'
};

/**
 * Simplified user status checker
 * @param {Object} userData - User data from Firestore
 * @returns {Object} Normalized status information
 */
export const getUserStatus = (userData) => {
  if (!userData) {
    return {
      status: USER_STATUS.REJECTED,
      isActive: false,
      isApproved: false,
      isPending: false,
      message: 'ไม่พบข้อมูลผู้ใช้'
    };
  }

  const authStatus = userData.auth || {};
  const statusData = userData.status || {};
  
  // Get status with fallbacks
  const isApproved = authStatus.isApproved ?? statusData.isApproved ?? false;
  const isActive = authStatus.isActive ?? statusData.isActive ?? false;
  const approvalStatus = authStatus.approvalStatus || statusData.approvalStatus || USER_STATUS.PENDING;

  // Determine final status
  if (isApproved && isActive && approvalStatus === USER_STATUS.APPROVED) {
    return {
      status: USER_STATUS.APPROVED,
      isActive: true,
      isApproved: true,
      isPending: false,
      canAccess: true
    };
  }

  if (!isApproved || approvalStatus === USER_STATUS.PENDING) {
    return {
      status: USER_STATUS.PENDING,
      isActive: false,
      isApproved: false,
      isPending: true,
      canAccess: false,
      userType: authStatus.userType || USER_TYPES.NEW,
      department: authStatus.department || 'ไม่ระบุ',
      homeProvince: authStatus.homeProvince || 'ไม่ระบุ',
      homeBranch: authStatus.homeBranch || 'ไม่ระบุ'
    };
  }

  if (!isActive || approvalStatus === USER_STATUS.REJECTED) {
    return {
      status: USER_STATUS.REJECTED,
      isActive: false,
      isApproved: false,
      isPending: false,
      canAccess: false,
      message: authStatus.rejectionReason || statusData.rejectionReason || 'บัญชีถูกระงับการใช้งาน'
    };
  }

  if (approvalStatus === USER_STATUS.SUSPENDED) {
    const suspensionReason = authStatus.suspensionReason || statusData.suspensionReason || 'ไม่ระบุเหตุผล';
    const suspendedUntil = authStatus.suspendedUntil || statusData.suspendedUntil;
    
    let message = `บัญชีถูกระงับการใช้งานชั่วคราว\nเหตุผล: ${suspensionReason}`;
    if (suspendedUntil) {
      const suspensionDate = new Date(suspendedUntil).toLocaleDateString('th-TH');
      message += `\nระงับจนถึง: ${suspensionDate}`;
    }

    return {
      status: USER_STATUS.SUSPENDED,
      isActive: false,
      isApproved: false,
      isPending: false,
      canAccess: false,
      message
    };
  }

  // Default fallback for unknown status
  return {
    status: USER_STATUS.REJECTED,
    isActive: false,
    isApproved: false,
    isPending: false,
    canAccess: false,
    message: 'สถานะผู้ใช้ไม่ถูกต้อง'
  };
};

/**
 * Create user profile with RBAC defaults
 * @param {Object} firebaseUser - Firebase Auth user
 * @param {Object} userData - Firestore user data
 * @returns {Object} Complete user profile
 */
export const createUserProfile = (firebaseUser, userData) => {
  const authStatus = userData.auth || {};
  const rbacData = userData.rbac || {};
  
  // Legacy fallbacks for RBAC
  const accessLevel = rbacData.accessLevel || authStatus.accessLevel || 'STAFF';
  const homeProvince = rbacData.geographic?.homeProvince || authStatus.homeProvince || 'นครราชสีมา';
  const homeBranch = rbacData.geographic?.homeBranch || authStatus.homeBranch || '0450';

  return {
    // Firebase Auth fields
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    
    // Profile fields with fallbacks
    firstName: authStatus.firstName || userData.profile?.firstName || '',
    lastName: authStatus.lastName || userData.profile?.lastName || '',
    displayName: authStatus.displayName || `${authStatus.firstName || 'User'} ${authStatus.lastName || ''}`,
    
    // RBAC fields with legacy support
    accessLevel,
    permissions: rbacData.permissions || {},
    allowedProvinces: rbacData.geographic?.allowedProvinces || authStatus.allowedProvinces || [homeProvince],
    allowedBranches: rbacData.geographic?.allowedBranches || authStatus.allowedBranches || [homeBranch],
    homeProvince,
    homeBranch,
    department: authStatus.department || 'general',
    
    // Status fields
    isApproved: authStatus.isApproved !== false, // Default true for legacy users
    isActive: authStatus.isActive !== false, // Default true for legacy users  
    approvalStatus: authStatus.approvalStatus || USER_STATUS.APPROVED
  };
};

/**
 * Validate user can access application
 * @param {Object} userStatus - Result from getUserStatus()
 * @returns {boolean} Can user access the application
 */
export const canUserAccess = (userStatus) => {
  return userStatus && userStatus.canAccess === true;
};

/**
 * Get approval level name for display
 * @param {string} approvalLevel - Approval level code
 * @returns {string} Display name
 */
export const getApprovalLevelName = (approvalLevel) => {
  const levels = {
    super_admin: 'ผู้ดูแลระบบสูงสุด',
    province_manager: 'ผู้จัดการจังหวัด', 
    branch_manager: 'ผู้จัดการสาขา',
    department_head: 'หัวหน้าแผนก',
    staff: 'เจ้าหน้าที่'
  };
  return levels[approvalLevel] || 'ไม่ระบุ';
};

/**
 * Check if user needs legacy migration
 * @param {Object} userData - Firestore user data
 * @returns {boolean} Needs migration
 */
export const needsRBACMigration = (userData) => {
  return !userData.rbac || !userData.rbac.accessLevel;
}; 