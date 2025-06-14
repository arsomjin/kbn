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

// Unified province data structure for forms
export const STATIC_PROVINCES = {
  'nakhon-ratchasima': { 
    name: 'นครราชสีมา', 
    nameTh: 'นครราชสีมา',
    nameEn: 'Nakhon Ratchasima',
    code: 'NMA',
    isActive: true
  },
  'nakhon-sawan': { 
    name: 'นครสวรรค์', 
    nameTh: 'นครสวรรค์',
    nameEn: 'Nakhon Sawan',
    code: 'NSN',
    isActive: true
  }
};

// Unified branch data structure for forms (organized by province)
export const DEFAULT_BRANCHES = {
  'nakhon-ratchasima': [
    { branchCode: '0450', branchName: 'สาขานครราชสีมา สำนักงานใหญ่', branchNameEn: 'Head Office', provinceId: 'nakhon-ratchasima', isActive: true, isDefault: true },
    { branchCode: '0451', branchName: 'สาขาบัวใหญ่', branchNameEn: 'Bua Yai Branch', provinceId: 'nakhon-ratchasima', isActive: true },
    { branchCode: '0452', branchName: 'สาขาจักราช', branchNameEn: 'Chakkarat Branch', provinceId: 'nakhon-ratchasima', isActive: true },
    { branchCode: '0453', branchName: 'สาขาสีดา', branchNameEn: 'Sida Branch', provinceId: 'nakhon-ratchasima', isActive: true },
    { branchCode: '0454', branchName: 'สาขาโคกกรวด', branchNameEn: 'Kok Kruat Branch', provinceId: 'nakhon-ratchasima', isActive: true },
    { branchCode: '0455', branchName: 'สาขาหนองบุญมาก', branchNameEn: 'Nong Bumrung Branch', provinceId: 'nakhon-ratchasima', isActive: true },
    { branchCode: '0456', branchName: 'สาขาขามสะแกแสง', branchNameEn: 'Kham Sa Kaeo Branch', provinceId: 'nakhon-ratchasima', isActive: true },
    { branchCode: '0500', branchName: 'สาขาฟาร์มหนองบุญมาก', branchNameEn: 'Farm Nong Bumrung', provinceId: 'nakhon-ratchasima', isActive: true },
  ],
  'nakhon-sawan': [
    { branchCode: 'NSN001', branchName: 'สาขานครสวรรค์', branchNameEn: 'Nakhon Sawan Branch', provinceId: 'nakhon-sawan', isActive: true },
    { branchCode: 'NSN002', branchName: 'สาขาตาคลี', branchNameEn: 'Takli Branch', provinceId: 'nakhon-sawan', isActive: true },
    { branchCode: 'NSN003', branchName: 'สาขาหนองบัว', branchNameEn: 'Nong Bua Branch', provinceId: 'nakhon-sawan', isActive: true }
  ]
};

// Enhanced branch mappings (unified from BRANCH_MAPPINGS_NEW)
export const BRANCH_DETAILS = {
  '0450': {
    branchCode: '0450',
    branchName: 'สำนักงานใหญ่',
    branchNameFull: 'สาขานครราชสีมา สำนักงานใหญ่',
    branchNameEn: 'Head Office',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true,
    isDefault: true
  },
  '0451': {
    branchCode: '0451',
    branchName: 'บัวใหญ่',
    branchNameFull: 'สาขาบัวใหญ่',
    branchNameEn: 'Bua Yai',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  '0452': {
    branchCode: '0452',
    branchName: 'จักราช',
    branchNameFull: 'สาขาจักราช',
    branchNameEn: 'Chakkarat',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  '0453': {
    branchCode: '0453',
    branchName: 'สีดา',
    branchNameFull: 'สาขาสีดา',
    branchNameEn: 'Sida',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  '0454': {
    branchCode: '0454',
    branchName: 'โคกกรวด',
    branchNameFull: 'สาขาโคกกรวด',
    branchNameEn: 'Kok Kruat',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  '0455': {
    branchCode: '0455',
    branchName: 'หนองบุญมาก',
    branchNameFull: 'สาขาหนองบุญมาก',
    branchNameEn: 'Nong Bumrung',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  '0456': {
    branchCode: '0456',
    branchName: 'ขามสะแกแสง',
    branchNameFull: 'สาขาขามสะแกแสง',
    branchNameEn: 'Kham Sa Kaeo',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  '0500': {
    branchCode: '0500',
    branchName: 'ฟาร์มหนองบุญมาก',
    branchNameFull: 'สาขาฟาร์มหนองบุญมาก',
    branchNameEn: 'Farm Nong Bumrung',
    provinceId: 'nakhon-ratchasima',
    province: 'นครราชสีมา',
    provinceName: 'นครราชสีมา',
    isActive: true
  },
  // Nakhon Sawan branches
  'NSN001': {
    branchCode: 'NSN001',
    branchName: 'นครสวรรค์',
    branchNameFull: 'สาขานครสวรรค์',
    branchNameEn: 'Nakhon Sawan',
    provinceId: 'nakhon-sawan',
    province: 'นครสวรรค์',
    provinceName: 'นครสวรรค์',
    isActive: true
  },
  'NSN002': {
    branchCode: 'NSN002',
    branchName: 'ตาคลี',
    branchNameFull: 'สาขาตาคลี',
    branchNameEn: 'Takli',
    provinceId: 'nakhon-sawan',
    province: 'นครสวรรค์',
    provinceName: 'นครสวรรค์',
    isActive: true
  },
  'NSN003': {
    branchCode: 'NSN003',
    branchName: 'หนองบัว',
    branchNameFull: 'สาขาหนองบัว',
    branchNameEn: 'Nong Bua',
    provinceId: 'nakhon-sawan',
    province: 'นครสวรรค์',
    provinceName: 'นครสวรรค์',
    isActive: true
  }
}
  

// User type mappings
export const USER_TYPE_MAPPINGS = {
  'existing': 'พนักงานเดิม',
  'new': 'พนักงานใหม่',
  'contractor': 'ผู้รับเหมา',
  'temp': 'พนักงานชั่วคราว'
};

// Department mappings (Clean Slate RBAC departments)
export const DEPARTMENT_MAPPINGS = {
  'accounting': 'บัญชีการเงิน',
  'sales': 'ขายและลูกค้า',
  'service': 'บริการซ่อม',
  'inventory': 'คลังสินค้า',
  'hr': 'ทรัพยากรบุคคล',
  'general': 'ทั่วไป',  // General department for staff without specific department
  // Legacy mappings (still supported)
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

// Access level mappings (Clean Slate RBAC authorities + legacy support)
export const ACCESS_LEVEL_MAPPINGS = {
  // Clean Slate RBAC authorities (primary)
  'ADMIN': 'ผู้ดูแลระบบ',
  'MANAGER': 'ผู้จัดการ',
  'LEAD': 'หัวหน้าแผนก',
  'STAFF': 'เจ้าหน้าที่',
  
  // Legacy mappings (still supported for backward compatibility)
  'SUPER_ADMIN': 'ผู้ดูแลระบบสูงสุด',
  'PROVINCE_MANAGER': 'ผู้จัดการจังหวัด',
  'BRANCH_MANAGER': 'ผู้จัดการสาขา',
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

/**
 * Get unified province data for forms
 * @returns {object} Static provinces object
 */
export const getStaticProvinces = () => STATIC_PROVINCES;

/**
 * Get unified branch data for forms
 * @param {string} provinceKey - Province key (e.g., 'nakhon-ratchasima')
 * @returns {array} Array of branches for the province
 */
export const getDefaultBranches = (provinceKey) => {
  return provinceKey ? DEFAULT_BRANCHES[provinceKey] || [] : [];
};

/**
 * Get all branches as a flat array
 * @returns {array} All branches from all provinces
 */
export const getAllBranches = () => {
  return Object.values(DEFAULT_BRANCHES).flat();
};

/**
 * Get branch details by code
 * @param {string} branchCode - Branch code
 * @returns {object|null} Branch details object or null
 */
export const getBranchDetails = (branchCode) => {
  return BRANCH_DETAILS[branchCode] || null;
};

/**
 * Normalize province identifier to standard key
 * @param {string} province - Province identifier (Thai name, English, code, etc.)
 * @returns {string} Normalized province key
 */
export const normalizeProvinceKey = (province) => {
  if (!province) return 'nakhon-sawan'; // Default
  
  // Direct key match
  if (STATIC_PROVINCES[province]) return province;
  
  // Thai name matching
  if (province === 'นครราชสีมา' || province === 'NMA' || province === 'nma') {
    return 'nakhon-ratchasima';
  }
  if (province === 'นครสวรรค์' || province === 'NSN' || province === 'nsn') {
    return 'nakhon-sawan';
  }
  
  // English name matching
  if (province.toLowerCase().includes('ratchasima')) {
    return 'nakhon-ratchasima';
  }
  if (province.toLowerCase().includes('sawan')) {
    return 'nakhon-sawan';
  }
  
  return 'nakhon-sawan'; // Default fallback
}; 