/**
 * Mapping Utilities for KBN Multi-Province System
 * Converts IDs/codes to full display names
 */

import { DEPARTMENTS } from '../data/permissions';

// Province mappings
export const PROVINCE_MAPPINGS = {
  'nakhon-ratchasima': 'นครราชสีมา',
  'นครราชสีมา': 'นครราชสีมา',
  'nakhon-sawan': 'นครสวรรค์',
  'นครสวรรค์': 'นครสวรรค์',
  'NMA': 'นครราชสีมา',
  'NSN': 'นครสวรรค์',
  // Additional mappings for different variations
  'nakhonsawan': 'นครสวรรค์',
  'nsn': 'นครสวรรค์',
  'nma': 'นครราชสีมา',
  'NAKHON_SAWAN': 'นครสวรรค์',
  'NAKHON_RATCHASIMA': 'นครราชสีมา'
};

// Branch mappings
export const BRANCH_MAPPINGS = {
  // Nakhon Ratchasima branches
  '0450': 'สาขานครราชสีมา สำนักงานใหญ่',
  '0451': 'สาขาบัวใหญ่',
  '0452': 'สาขาจักราช',
  '0453': 'สาขาสีดา',
  '0454': 'สาขาโคกกรวด',
  '0455': 'สาขาหนองบุญมาก',
  '0456': 'สาขาขามสะแกแสง',
  '1004': 'สาขานครราชสีมา คลังสินค้า',
  '0500': 'สาขาฟาร์มหนองบุญมาก',
  
  // Nakhon Sawan branches
  'NSN001': 'สาขานครสวรรค์',
  'NSN002': 'สาขาตาคลี',
  'NSN003': 'สาขาหนองบัว',
  
};

// User type mappings
export const USER_TYPE_MAPPINGS = {
  'existing': 'พนักงานเดิม',
  'new': 'พนักงานใหม่',
  'contractor': 'ผู้รับเหมา',
  'temp': 'พนักงานชั่วคราว'
};

// Department mappings (from permissions.js)
export const DEPARTMENT_MAPPINGS = {
  'accounting': 'บัญชีและการเงิน',
  'sales': 'ขายและลูกค้า',
  'service': 'บริการและซ่อมบำรุง',
  'inventory': 'คลังสินค้าและอะไหล่',
  'hr': 'ทรัพยากรบุคคล',
  'management': 'ผู้บริหาร',
  'admin': 'ระบบและผู้ดูแล',
  'users': 'จัดการผู้ใช้งาน',
  'reports': 'รายงานทั้งหมด',
  'notifications': 'การแจ้งเตือนและเผยแพร่'
};

// Approval level mappings
export const APPROVAL_LEVEL_MAPPINGS = {
  'branch_manager': 'ผู้จัดการสาขา',
  'province_manager': 'ผู้จัดการจังหวัด',
  'executive': 'ผู้บริหาร',
  'super_admin': 'ผู้ดูแลระบบ'
};

// Access level mappings (for RBAC authority levels)
export const ACCESS_LEVEL_MAPPINGS = {
  'SUPER_ADMIN': 'ผู้ดูแลระบบสูงสุด',
  'ADMIN': 'ผู้ดูแลระบบ',
  'PROVINCE_MANAGER': 'ผู้จัดการจังหวัด',
  'BRANCH_MANAGER': 'ผู้จัดการสาขา',
  'MANAGER': 'ผู้จัดการ',
  'STAFF': 'พนักงาน',
  'ACCOUNTING_STAFF': 'พนักงานบัญชี',
  'SALES_STAFF': 'พนักงานขาย',
  'SERVICE_STAFF': 'พนักงานบริการ',
  'INVENTORY_STAFF': 'พนักงานคลัง',
  'VIEWER': 'ผู้ดูข้อมูล'
};

/**
 * Get province full name from any identifier
 * @param {string} provinceId - Province ID, code, or name
 * @returns {string} Full Thai province name
 */
export const getProvinceName = (provinceId) => {
  if (!provinceId) return 'ไม่ระบุ';
  
  // Direct lookup
  const directMapping = PROVINCE_MAPPINGS[provinceId];
  if (directMapping) return directMapping;
  
  // If it's already a Thai name, return as is
  if (typeof provinceId === 'string' && provinceId.includes('นคร')) {
    return provinceId;
  }
  
  return provinceId || 'ไม่ระบุ';
};

/**
 * Get branch full name from branch code
 * @param {string} branchCode - Branch code
 * @returns {string} Full Thai branch name
 */
export const getBranchName = (branchCode) => {
  if (!branchCode) return 'ไม่ระบุ';
  
  const directMapping = BRANCH_MAPPINGS[branchCode];
  if (directMapping) return directMapping;
  
  // If it's already a descriptive name, return as is
  if (typeof branchCode === 'string' && branchCode.includes('สาขา')) {
    return branchCode;
  }
  
  return `สาขา ${branchCode}`;
};

/**
 * Get department full name from department code
 * @param {string} departmentCode - Department code
 * @returns {string} Full Thai department name
 */
export const getDepartmentName = (departmentCode) => {
  if (!departmentCode) return 'ไม่ระบุ';
  
  // Try direct mapping first
  const directMapping = DEPARTMENT_MAPPINGS[departmentCode];
  if (directMapping) return directMapping;
  
  // Try DEPARTMENTS object from permissions
  const departmentObj = Object.values(DEPARTMENTS).find(dept => 
    dept.key === departmentCode || dept.name === departmentCode
  );
  if (departmentObj) return departmentObj.name;
  
  // If it's already a Thai name, return as is
  if (typeof departmentCode === 'string' && (
    departmentCode.includes('บัญชี') || 
    departmentCode.includes('ขาย') ||
    departmentCode.includes('บริการ') ||
    departmentCode.includes('คลัง') ||
    departmentCode.includes('ทรัพยากร')
  )) {
    return departmentCode;
  }
  
  return departmentCode || 'ไม่ระบุ';
};

/**
 * Get user type full name
 * @param {string} userType - User type code
 * @returns {string} Full Thai user type name
 */
export const getUserTypeName = (userType) => {
  if (!userType) return 'ไม่ระบุ';
  
  const directMapping = USER_TYPE_MAPPINGS[userType];
  if (directMapping) return directMapping;
  
  return userType || 'ไม่ระบุ';
};

/**
 * Get approval level full name
 * @param {string} approvalLevel - Approval level code
 * @returns {string} Full Thai approval level name
 */
export const getApprovalLevelName = (approvalLevel) => {
  if (!approvalLevel) return 'ไม่ระบุ';
  
  const directMapping = APPROVAL_LEVEL_MAPPINGS[approvalLevel];
  if (directMapping) return directMapping;
  
  return approvalLevel || 'ไม่ระบุ';
};

/**
 * Get access level full name (for RBAC authority levels)
 * @param {string} accessLevel - Access level/authority code
 * @returns {string} Full Thai access level name
 */
export const getAccessLevelName = (accessLevel) => {
  if (!accessLevel) return 'ไม่ระบุ';
  
  const directMapping = ACCESS_LEVEL_MAPPINGS[accessLevel];
  if (directMapping) return directMapping;
  
  // Fallback to approval level mapping
  const approvalMapping = APPROVAL_LEVEL_MAPPINGS[accessLevel];
  if (approvalMapping) return approvalMapping;
  
  return accessLevel || 'ไม่ระบุ';
};

/**
 * Get contact information based on approval level and geographic location
 * @param {string} approvalLevel - Approval level
 * @param {string} province - Province name/code
 * @param {string} branch - Branch code
 * @returns {object} Contact information object
 */
export const getContactInfo = (approvalLevel, province, branch) => {
  const provinceName = getProvinceName(province);
  const branchName = getBranchName(branch);
  
  if (approvalLevel === 'branch_manager') {
    return {
      title: 'ติดต่อผู้จัดการสาขา',
      description: `หากต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อผู้จัดการ${branchName}`,
      phone: getPhoneByBranch(branch),
      email: getEmailByBranch(branch)
    };
  } else {
    return {
      title: 'ติดต่อผู้จัดการจังหวัด',
      description: `หากต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อผู้จัดการจังหวัด${provinceName}`,
      phone: getPhoneByProvince(province),
      email: getEmailByProvince(province)
    };
  }
};

/**
 * Get phone number by branch code
 * @param {string} branchCode - Branch code
 * @returns {string} Phone number
 */
export const getPhoneByBranch = (branchCode) => {
  const branchPhones = {
    // Nakhon Ratchasima branches - using first phone number
    '0450': '081-2897775',
    '0451': '081-2897775',
    '0452': '081-2897775',
    '0453': '081-2897775',
    '0454': '081-2897775',
    '0455': '081-2897775',
    '0456': '081-2897775',
    '1004': '081-2897775',
    '0500': '081-2897775',
    'NMA002': '081-2897775',
    'NMA003': '081-2897775',
    '1003': '081-2897775',
    
    // Nakhon Sawan branches
    'NSN001': '061-593-2229',
    'NSN002': '061-593-2229',
    'NSN003': '061-593-2229'
  };
  
  return branchPhones[branchCode] || '081-2897775';
};

/**
 * Get email by branch code
 * @param {string} branchCode - Branch code
 * @returns {string} Email address
 */
export const getEmailByBranch = (branchCode) => {
  if (branchCode?.startsWith('NSN')) {
    return 'kbn14.nakhonsawan@gmail.com';
  }
  return 'info@kbn.co.th'; // Default email for Nakhon Ratchasima branches
};

/**
 * Get phone number by province
 * @param {string} province - Province name/code
 * @returns {string} Phone number
 */
export const getPhoneByProvince = (province) => {
  const provincePhones = {
    'nakhon-ratchasima': '081-2897775',
    'นครราชสีมา': '081-2897775',
    'NMA': '081-2897775',
    'nakhon-sawan': '061-593-2229',
    'นครสวรรค์': '061-593-2229',
    'NSN': '061-593-2229'
  };
  
  return provincePhones[province] || '081-2897775';
};

/**
 * Get email by province
 * @param {string} province - Province name/code
 * @returns {string} Email address
 */
export const getEmailByProvince = (province) => {
  const provinceName = getProvinceName(province);
  
  if (provinceName.includes('นครสวรรค์')) {
    return 'kbn14.nakhonsawan@gmail.com';
  }
  
  return 'info@kbn.co.th'; // Default email for Nakhon Ratchasima
};

/**
 * Get additional phone numbers for provinces (for display purposes)
 * @param {string} province - Province name/code
 * @returns {string[]} Array of phone numbers
 */
export const getAdditionalPhoneNumbers = (province) => {
  const provinceName = getProvinceName(province);
  
  if (provinceName.includes('นครราชสีมา')) {
    return ['081-2897775', '063-535-8888'];
  }
  
  if (provinceName.includes('นครสวรรค์')) {
    return ['061-593-2229'];
  }
  
  return ['081-2897775'];
}; 