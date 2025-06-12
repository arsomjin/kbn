/**
 * Clean Slate RBAC Helper Functions
 * Maps legacy user data to orthogonal 4×3×6 structure
 */

import { 
  AUTHORITY_LEVELS, 
  GEOGRAPHIC_SCOPE, 
  DEPARTMENTS,
  createUserAccess 
} from './orthogonal-rbac';

/**
 * Map user's department and requested level to authority
 * @param {string} department - User's department
 * @param {string} requestedLevel - Requested access level
 * @returns {string} Authority level (ADMIN, MANAGER, LEAD, STAFF)
 */
export const mapDepartmentToAuthority = (department, requestedLevel) => {
  const level = (requestedLevel || '').toUpperCase();
  
  // Check for specific authority indicators in requested level
  if (level.includes('SUPER_ADMIN') || level.includes('ADMIN')) return 'ADMIN';
  if (level.includes('EXECUTIVE')) return 'ADMIN';
  if (level.includes('MANAGER')) return 'MANAGER';
  if (level.includes('LEAD') || level.includes('SUPERVISOR')) return 'LEAD';
  
  // Default for new users is STAFF
  return 'STAFF';
};

/**
 * Map location data to geographic scope
 * @param {string} province - Province code/name
 * @param {string} branch - Branch code
 * @returns {string} Geographic scope (ALL, PROVINCE, BRANCH)
 */
export const mapLocationToGeographic = (province, branch) => {
  // If no specific branch, assume province-level access
  if (!branch || branch === 'all') return 'PROVINCE';
  
  // Most new users start at branch level
  return 'BRANCH';
};

/** 
 * Map department string to departments array
 * @param {string} department - Department string
 * @returns {Array} Department array
 */
export const mapDepartmentToDepartments = (department) => {
  const dept = (department || '').toLowerCase();
  
  const deptMap = {
    'accounting': ['ACCOUNTING'],
    'finance': ['ACCOUNTING'],
    'บัญชี': ['ACCOUNTING'],
    'sales': ['SALES'],
    'ขาย': ['SALES'],
    'marketing': ['SALES'],
    'service': ['SERVICE'],
    'บริการ': ['SERVICE'],
    'repair': ['SERVICE'],
    'maintenance': ['SERVICE'],
    'inventory': ['INVENTORY'],
    'คลัง': ['INVENTORY'],
    'warehouse': ['INVENTORY'],
    'parts': ['INVENTORY'],
    'hr': ['HR'],
    'human': ['HR'],
    'บุคคล': ['HR'],
    'personnel': ['HR'],
    'general': ['GENERAL'],
    'ทั่วไป': ['GENERAL']
  };
  
  return deptMap[dept] || ['GENERAL'];
};

/**
 * Create Clean Slate user structure for new registration
 * @param {Object} userData - User registration data
 * @returns {Object} Clean Slate user structure
 */
export const createCleanSlateUser = (userData) => {
  const {
    uid,
    email,
    firstName,
    lastName,
    displayName,
    department,
    accessLevel,
    province,
    branch,
    userType
  } = userData;

  // Map to orthogonal structure
  const authority = mapDepartmentToAuthority(department, accessLevel);
  const geographic = mapLocationToGeographic(province, branch);
  const departments = mapDepartmentToDepartments(department);

  // Create comprehensive access structure with explicit geographic assignments
  const accessStructure = createUserAccess(
    authority,
    geographic,
    departments,
    {
      provinces: province ? [province] : [],
      branches: branch ? [branch] : [],
      homeBranch: branch
    }
  );

  return {
    uid,
    email,
    displayName: displayName || `${firstName} ${lastName}`,
    firstName,
    lastName,
    userType: userType || 'employee',
    
    // Clean Slate orthogonal access structure (PRIMARY)
    access: accessStructure,
    
    
    // Status fields
    isActive: false, // Requires approval
    isApproved: false,
    approvalStatus: 'pending',
    
    // Metadata
    createdAt: new Date().toISOString(),
    migrationType: 'clean_slate_registration'
  };
};

/**
 * Create approval request for Clean Slate user
 * @param {Object} cleanSlateUser - Clean Slate user structure
 * @param {Object} registrationData - Original registration data
 * @returns {Object} Approval request structure
 */
export const createApprovalRequest = (cleanSlateUser, registrationData) => {
  const { access } = cleanSlateUser;
  const { department, userType, employeeId } = registrationData;

  return {
    userId: cleanSlateUser.uid,
    requestType: userType === 'existing' ? 'existing_employee_registration' : 'new_employee_registration',
    userData: cleanSlateUser,
    
    // Request details
    status: 'pending',
    priority: userType === 'existing' ? 'high' : 'normal',
    department,
    employeeId: employeeId || null,
    
    // Clean Slate context
    requestedAccess: {
      authority: access.authority,
      geographic: access.geographic,
      departments: access.departments
    },
    
    // Approval routing
    approvalLevel: userType === 'existing' ? 'branch_manager' : 'province_manager',
    targetProvince: access.geographic.allowedProvinces[0],
    targetBranch: access.geographic.homeBranch,
    
    // Metadata
    createdAt: new Date().toISOString(),
    registrationSource: 'web',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  };
};

/**
 * Validate Clean Slate user structure
 * @param {Object} user - User object to validate
 * @returns {Object} Validation result
 */
export const validateCleanSlateUser = (user) => {
  const errors = [];
  
  // Check required fields
  if (!user.uid) errors.push('Missing uid');
  if (!user.email) errors.push('Missing email');
  if (!user.access) errors.push('Missing access property');
  
  if (user.access) {
    const { authority, geographic, departments } = user.access;
    
    // Validate authority
    if (!authority || !AUTHORITY_LEVELS[authority]) {
      errors.push(`Invalid authority: ${authority}`);
    }
    
    // Validate geographic (Clean Slate structure has nested geographic object)
    if (!geographic || typeof geographic !== 'object') {
      errors.push(`Missing or invalid geographic object: ${geographic}`);
    } else if (!geographic.scope || !GEOGRAPHIC_SCOPE[geographic.scope]) {
      errors.push(`Invalid geographic scope: ${geographic.scope}`);
    }
    
    // Validate departments
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      errors.push('Missing or invalid departments array');
    } else {
      const validDepartments = Object.keys(DEPARTMENTS);
      const invalidDepts = departments.filter(d => !validDepartments.includes(d));
      if (invalidDepts.length > 0) {
        errors.push(`Invalid departments: ${invalidDepts.join(', ')}`);
      }
    }
    
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Legacy role to Clean Slate mapping (for backwards compatibility)
 * @param {string} legacyRole - Legacy role name
 * @returns {Object} Clean Slate mapping
 */
export const mapLegacyRoleToCleanSlate = (legacyRole) => {
  const roleMap = {
    'SUPER_ADMIN': { authority: 'ADMIN', geographic: 'ALL', departments: ['GENERAL'] },
    'EXECUTIVE': { authority: 'ADMIN', geographic: 'ALL', departments: ['ACCOUNTING', 'SALES', 'SERVICE', 'INVENTORY'] },
    'PROVINCE_MANAGER': { authority: 'MANAGER', geographic: 'PROVINCE', departments: ['GENERAL'] },
    'BRANCH_MANAGER': { authority: 'MANAGER', geographic: 'BRANCH', departments: ['GENERAL'] },
    'ACCOUNTING_STAFF': { authority: 'STAFF', geographic: 'BRANCH', departments: ['ACCOUNTING'] },
    'SALES_STAFF': { authority: 'STAFF', geographic: 'BRANCH', departments: ['SALES'] },
    'SERVICE_STAFF': { authority: 'STAFF', geographic: 'BRANCH', departments: ['SERVICE'] },
    'INVENTORY_STAFF': { authority: 'STAFF', geographic: 'BRANCH', departments: ['INVENTORY'] },
    'HR_STAFF': { authority: 'STAFF', geographic: 'BRANCH', departments: ['HR'] }
  };
  
  return roleMap[legacyRole] || { authority: 'STAFF', geographic: 'BRANCH', departments: ['GENERAL'] };
};

export default {
  mapDepartmentToAuthority,
  mapLocationToGeographic,
  mapDepartmentToDepartments,
  createCleanSlateUser,
  createApprovalRequest,
  validateCleanSlateUser,
  mapLegacyRoleToCleanSlate
}; 