/**
 * Centralized User-Friendly Display Mappings
 * For consistent UX across all components
 */

// Role mappings with Thai names and colors
export const getRoleInfo = (accessLevel) => {
  const roleConfig = {
    SUPER_ADMIN: { 
      color: 'red', 
      text: 'ผู้ดูแลระบบสูงสุด', 
      short: 'Super Admin',
      description: 'มีสิทธิ์เข้าถึงทุกระบบและฟังก์ชัน' 
    },
    EXECUTIVE: { 
      color: 'purple', 
      text: 'ผู้บริหาร', 
      short: 'Executive',
      description: 'ผู้บริหารระดับสูง มีสิทธิ์อนุมัติและควบคุม' 
    },
    PROVINCE_MANAGER: { 
      color: 'blue', 
      text: 'ผู้จัดการจังหวัด', 
      short: 'Province Manager',
      description: 'จัดการการดำเนินงานในระดับจังหวัด' 
    },
    BRANCH_MANAGER: { 
      color: 'green', 
      text: 'ผู้จัดการสาขา', 
      short: 'Branch Manager',
      description: 'จัดการการดำเนินงานในระดับสาขา' 
    },
    ACCOUNTING_STAFF: { 
      color: 'orange', 
      text: 'เจ้าหน้าที่บัญชี', 
      short: 'Accounting Staff',
      description: 'รับผิดชอบงานด้านการเงินและบัญชี' 
    },
    SALES_STAFF: { 
      color: 'cyan', 
      text: 'เจ้าหน้าที่ขาย', 
      short: 'Sales Staff',
      description: 'รับผิดชอบงานขายและดูแลลูกค้า' 
    },
    SERVICE_STAFF: { 
      color: 'lime', 
      text: 'เจ้าหน้าที่บริการ', 
      short: 'Service Staff',
      description: 'รับผิดชอบงานบริการหลังการขาย' 
    },
    INVENTORY_STAFF: { 
      color: 'gold', 
      text: 'เจ้าหน้าที่คลังสินค้า', 
      short: 'Inventory Staff',
      description: 'รับผิดชอบงานคลังสินค้าและการจัดส่ง' 
    }
  };

  return roleConfig[accessLevel] || { 
    color: 'default', 
    text: accessLevel, 
    short: accessLevel,
    description: 'ไม่ระบุบทบาท' 
  };
};

// Department mappings with Thai names and colors
export const getDepartmentInfo = (department) => {
  const departmentConfig = {
    accounting: { 
      text: 'บัญชี', 
      color: 'orange',
      icon: '💰',
      description: 'แผนกการเงินและบัญชี' 
    },
    sales: { 
      text: 'ขาย', 
      color: 'blue',
      icon: '🛒',
      description: 'แผนกขายและการตลาด' 
    },
    service: { 
      text: 'บริการ', 
      color: 'green',
      icon: '🔧',
      description: 'แผนกบริการหลังการขาย' 
    },
    inventory: { 
      text: 'คลังสินค้า', 
      color: 'purple',
      icon: '📦',
      description: 'แผนกคลังสินค้าและโลจิสติกส์' 
    },
    management: { 
      text: 'จัดการ', 
      color: 'red',
      icon: '👔',
      description: 'แผนกบริหารจัดการ' 
    }
  };

  return departmentConfig[department] || { 
    text: department, 
    color: 'default',
    icon: '📋',
    description: 'ไม่ระบุแผนก' 
  };
};

// Province and Branch mappings with Thai names
export const getLocationInfo = (provinceCode, branchCode) => {
  const provinceNames = {
    'nakhon-ratchasima': 'นครราชสีมา',
    'nakhon-sawan': 'นครสวรรค์'
  };

  const branchNames = {
    '0450': '0450 (สำนักงานใหญ่)',
    'NMA002': 'NMA002 (สาขา)',
    'NMA003': 'NMA003 (สาขา)',
    'NSN001': 'NSN001 (สาขา)',
    'NSN002': 'NSN002 (สาขา)',
    'NSN003': 'NSN003 (สาขา)'
  };

  const branchDetails = {
    '0450': { name: '0450 (สำนักงานใหญ่)', province: 'nakhon-ratchasima', type: 'main' },
    'NMA002': { name: 'NMA002 (สาขา)', province: 'nakhon-ratchasima', type: 'branch' },
    'NMA003': { name: 'NMA003 (สาขา)', province: 'nakhon-ratchasima', type: 'branch' },
    'NSN001': { name: 'NSN001 (สาขา)', province: 'nakhon-sawan', type: 'branch' },
    'NSN002': { name: 'NSN002 (สาขา)', province: 'nakhon-sawan', type: 'branch' },
    'NSN003': { name: 'NSN003 (สาขา)', province: 'nakhon-sawan', type: 'branch' }
  };

  return {
    provinceName: provinceNames[provinceCode] || provinceCode,
    branchName: branchNames[branchCode] || branchCode,
    branchDetails: branchDetails[branchCode] || null,
    provinceNames,
    branchNames
  };
};

// Status mappings with Thai names and colors
export const getStatusInfo = (status) => {
  const statusConfig = {
    active: { 
      color: 'green', 
      text: 'ใช้งานได้', 
      icon: '✅',
      description: 'บัญชีผู้ใช้สามารถใช้งานได้ปกติ' 
    },
    pending: { 
      color: 'orange', 
      text: 'รออนุมัติ', 
      icon: '⏳',
      description: 'บัญชีผู้ใช้รอการอนุมัติจากผู้ดูแล' 
    },
    rejected: { 
      color: 'red', 
      text: 'ถูกปฏิเสธ', 
      icon: '❌',
      description: 'บัญชีผู้ใช้ถูกปฏิเสธไม่อนุญาตให้ใช้งาน' 
    },
    inactive: { 
      color: 'default', 
      text: 'ไม่ใช้งาน', 
      icon: '⭕',
      description: 'บัญชีผู้ใช้ถูกระงับการใช้งาน' 
    }
  };

  return statusConfig[status] || statusConfig.inactive;
};

// Get all roles for dropdown options
export const getAllRoles = () => {
  return [
    'SUPER_ADMIN',
    'EXECUTIVE', 
    'PROVINCE_MANAGER',
    'BRANCH_MANAGER',
    'ACCOUNTING_STAFF',
    'SALES_STAFF',
    'SERVICE_STAFF',
    'INVENTORY_STAFF'
  ].map(role => ({
    value: role,
    label: getRoleInfo(role).text,
    ...getRoleInfo(role)
  }));
};

// Get all departments for dropdown options
export const getAllDepartments = () => {
  return [
    'accounting',
    'sales',
    'service', 
    'inventory',
    'management'
  ].map(dept => ({
    value: dept,
    label: getDepartmentInfo(dept).text,
    ...getDepartmentInfo(dept)
  }));
};

// Get all provinces for dropdown options
export const getAllProvinces = () => {
  return [
    { value: 'nakhon-ratchasima', label: 'นครราชสีมา' },
    { value: 'nakhon-sawan', label: 'นครสวรรค์' }
  ];
};

// Get all branches for dropdown options
export const getAllBranches = () => {
  return [
    { value: '0450', label: '0450 (สำนักงานใหญ่)', province: 'nakhon-ratchasima' },
    { value: 'NMA002', label: 'NMA002 (สาขา)', province: 'nakhon-ratchasima' },
    { value: 'NMA003', label: 'NMA003 (สาขา)', province: 'nakhon-ratchasima' },
    { value: 'NSN001', label: 'NSN001 (สาขา)', province: 'nakhon-sawan' },
    { value: 'NSN002', label: 'NSN002 (สาขา)', province: 'nakhon-sawan' },
    { value: 'NSN003', label: 'NSN003 (สาขา)', province: 'nakhon-sawan' }
  ];
};

// Request type mappings with Thai names
export const getRequestTypeInfo = (requestType) => {
  const requestTypeConfig = {
    new_registration: { 
      color: 'blue', 
      text: 'ลงทะเบียนพนักงานใหม่', 
      icon: '👤',
      description: 'คำขอลงทะเบียนสำหรับพนักงานใหม่' 
    },
    new_employee_registration: { 
      color: 'blue', 
      text: 'ลงทะเบียนพนักงานใหม่', 
      icon: '👤',
      description: 'คำขอลงทะเบียนสำหรับพนักงานใหม่' 
    },
    existing_employee_registration: { 
      color: 'green', 
      text: 'ลงทะเบียนพนักงานเดิม', 
      icon: '👥',
      description: 'คำขอลงทะเบียนสำหรับพนักงานที่มีอยู่แล้ว' 
    },
    access_request: { 
      color: 'purple', 
      text: 'ขอสิทธิ์เข้าใช้งาน', 
      icon: '🔑',
      description: 'คำขอสิทธิ์การเข้าถึงระบบ' 
    },
    role_change_request: { 
      color: 'orange', 
      text: 'ขอเปลี่ยนบทบาท', 
      icon: '🔄',
      description: 'คำขอเปลี่ยนแปลงบทบาทหรือสิทธิ์' 
    },
    department_transfer: { 
      color: 'cyan', 
      text: 'โอนย้ายแผนก', 
      icon: '🏢',
      description: 'คำขอโอนย้ายระหว่างแผนก' 
    },
    branch_transfer: { 
      color: 'geekblue', 
      text: 'โอนย้ายสาขา', 
      icon: '🏪',
      description: 'คำขอโอนย้ายระหว่างสาขา' 
    }
  };

  return requestTypeConfig[requestType] || { 
    color: 'default', 
    text: requestType, 
    icon: '📄',
    description: 'ประเภทคำขอไม่ระบุ' 
  };
};

// Approval action mappings
export const getApprovalActionInfo = (action) => {
  const actionConfig = {
    'approve': { 
      color: 'green', 
      text: 'อนุมัติ', 
      icon: '✅',
      description: 'อนุมัติคำขอ' 
    },
    'reject': { 
      color: 'red', 
      text: 'ปฏิเสธ', 
      icon: '❌',
      description: 'ปฏิเสธคำขอ' 
    },
    'pending': { 
      color: 'orange', 
      text: 'รอดำเนินการ', 
      icon: '⏳',
      description: 'รอการพิจารณา' 
    },
    'review': { 
      color: 'blue', 
      text: 'ตรวจสอบ', 
      icon: '🔍',
      description: 'กำลังตรวจสอบ' 
    }
  };

  return actionConfig[action] || { 
    color: 'default', 
    text: action, 
    icon: '📋',
    description: 'การดำเนินการไม่ระบุ' 
  };
};

// Permission level mappings
export const getPermissionInfo = (permission) => {
  const permissionConfig = {
    'view': { text: 'ดู', color: 'blue', icon: '👁️' },
    'edit': { text: 'แก้ไข', color: 'orange', icon: '✏️' },
    'create': { text: 'สร้าง', color: 'green', icon: '➕' },
    'delete': { text: 'ลบ', color: 'red', icon: '🗑️' },
    'approve': { text: 'อนุมัติ', color: 'purple', icon: '✅' },
    'manage': { text: 'จัดการ', color: 'gold', icon: '⚙️' }
  };

  return permissionConfig[permission] || { 
    text: permission, 
    color: 'default', 
    icon: '📋' 
  };
};

export default {
  getRoleInfo,
  getDepartmentInfo,
  getLocationInfo,
  getStatusInfo,
  getRequestTypeInfo,
  getApprovalActionInfo,
  getAllRoles,
  getAllDepartments,
  getAllProvinces,
  getAllBranches,
  getPermissionInfo
}; 