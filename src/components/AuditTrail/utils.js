import dayjs from 'dayjs';
import './types'; // Import JSDoc types

/**
 * Creates a new audit trail entry with RBAC geographic context
 * @param {string} uid - User ID
 * @param {'create'|'update'|'delete'|'approve'|'reject'|'submit'|'cancel'} action - Action type
 * @param {UserInfo} userInfo - User information
 * @param {Object} [changes] - Changes made
 * @param {DocumentInfo} [documentInfo] - Document information
 * @param {GeographicContext} [geographic] - Geographic context
 * @param {number|null} [step] - Step number
 * @param {string} [notes] - Notes
 * @returns {AuditTrailEntry} Audit trail entry
 */
export const createAuditTrailEntry = (
  uid,
  action,
  userInfo,
  changes = undefined,
  documentInfo = undefined,
  geographic = undefined,
  step = null,
  notes = undefined
) => {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    uid,
    time: Date.now(),
    timestamp: Date.now(),
    action,
    step,
    changes,
    userInfo,
    documentInfo,
    geographic,
    notes,
    metadata: {
      userAgent: navigator?.userAgent,
      ipAddress: null, // Would be set server-side
      createdAt: Date.now()
    }
  };
};

/**
 * Creates a status history entry with RBAC geographic context
 * @param {string} uid - User ID
 * @param {string} status - Status value
 * @param {UserInfo} userInfo - User information
 * @param {string} [comment] - Comment
 * @param {GeographicContext} [geographic] - Geographic context
 * @param {string} [documentId] - Document ID
 * @param {string} [documentType] - Document type
 * @returns {StatusHistoryEntry} Status history entry
 */
export const createStatusHistoryEntry = (
  uid,
  status,
  userInfo,
  comment = undefined,
  geographic = undefined,
  documentId = undefined,
  documentType = undefined
) => {
  return {
    id: `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status,
    time: Date.now(),
    timestamp: Date.now(),
    uid,
    userInfo,
    comment,
    notes: comment,
    geographic,
    documentId,
    documentType
  };
};

/**
 * Compares two objects and returns the differences with enhanced formatting
 * @param {Object} oldObj - Old object
 * @param {Object} newObj - New object
 * @param {string[]} [excludeFields] - Fields to exclude
 * @returns {Object} Changes object
 */
export const getObjectDifferences = (
  oldObj,
  newObj,
  excludeFields = ['updatedAt', 'modifiedAt', 'timestamp']
) => {
  const changes = {};

  // Check for added or modified properties
  Object.keys(newObj).forEach(key => {
    if (!excludeFields.includes(key)) {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        changes[key] = {
          old: oldObj[key],
          new: newObj[key],
          type: determineChangeType(oldObj[key], newObj[key])
        };
      }
    }
  });

  // Check for removed properties
  Object.keys(oldObj).forEach(key => {
    if (!excludeFields.includes(key) && !(key in newObj)) {
      changes[key] = {
        old: oldObj[key],
        new: null,
        type: 'removed'
      };
    }
  });

  return changes;
};

/**
 * Determines the type of change between two values
 * @param {*} oldValue - Old value
 * @param {*} newValue - New value
 * @returns {string} Change type
 */
const determineChangeType = (oldValue, newValue) => {
  if (oldValue === null || oldValue === undefined) return 'added';
  if (newValue === null || newValue === undefined) return 'removed';
  if (Array.isArray(oldValue) && Array.isArray(newValue)) return 'array_change';
  if (typeof oldValue === 'object' && typeof newValue === 'object') return 'object_change';
  return 'field_change';
};

/**
 * Formats a change object for display with Thai language support
 * @param {string} key - Field key
 * @param {Object} change - Change object with old, new, and type properties
 * @returns {string} Formatted change string
 */
export const formatChange = (key, change) => {
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'ไม่มีข้อมูล';
    if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่ใช่';
    if (typeof value === 'object') {
      if (Array.isArray(value)) return `[${value.length} รายการ]`;
      if (value._isAMomentObject || value.$d) return dayjs(value).format('DD/MM/YYYY');
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'number') return value.toLocaleString('th-TH');
    return String(value);
  };

  const fieldName = getFieldDisplayName(key);
  return `${fieldName}: ${formatValue(change.old)} → ${formatValue(change.new)}`;
};

/**
 * Get Thai display name for field keys
 * @param {string} fieldKey - Field key
 * @returns {string} Display name in Thai
 */
export const getFieldDisplayName = (fieldKey) => {
  const fieldNames = {
    // Common fields
    'name': 'ชื่อ',
    'description': 'รายละเอียด',
    'status': 'สถานะ',
    'total': 'ยอดรวม',
    'amount': 'จำนวนเงิน',
    'quantity': 'จำนวน',
    'date': 'วันที่',
    'createdBy': 'สร้างโดย',
    'updatedBy': 'แก้ไขโดย',
    'approvedBy': 'อนุมัติโดย',
    'employeeCode': 'รหัสพนักงาน',
    'branchCode': 'รหัสสาขา',
    'provinceId': 'รหัสจังหวัด',
    
    // Document specific
    'documentNumber': 'เลขที่เอกสาร',
    'documentType': 'ประเภทเอกสาร',
    'customerName': 'ชื่อลูกค้า',
    'vendorName': 'ชื่อผู้ขาย',
    'items': 'รายการสินค้า',
    
    // Financial
    'price': 'ราคา',
    'discount': 'ส่วนลด',
    'tax': 'ภาษี',
    'netAmount': 'ยอดสุทธิ',
    
    // Inventory
    'stockQuantity': 'จำนวนคงคลัง',
    'unitPrice': 'ราคาต่อหน่วย',
    'partNumber': 'รหัสชิ้นส่วน',
    
    // Service
    'serviceType': 'ประเภทบริการ',
    'technicianCode': 'รหัสช่าง',
    'workOrderNumber': 'เลขที่ใบสั่งงาน'
  };

  return fieldNames[fieldKey] || fieldKey;
};

/**
 * Generate change history from old and new data with enhanced detection
 * @param {Object} oldData - Old data
 * @param {Object} newData - New data
 * @param {string[]} [excludeFields] - Fields to exclude
 * @returns {ChangeDetail[]} Array of change details
 */
export const generateChangeHistory = (
  oldData,
  newData,
  excludeFields = ['updatedAt', 'modifiedAt', 'timestamp']
) => {
  const changes = [];
  const differences = getObjectDifferences(oldData, newData, excludeFields);

  Object.entries(differences).forEach(([field, change]) => {
    changes.push({
      field,
      oldValue: change.old,
      newValue: change.new,
      type: change.type || 'field_change'
    });
  });

  return changes;
};

/**
 * Format user display name with employee code support
 * @param {UserInfo} userInfo - User information
 * @param {Object} [employees] - Employees data
 * @returns {string} Formatted display name
 */
export const formatUserDisplayName = (userInfo, employees = {}) => {
  if (!userInfo) return 'ไม่ทราบผู้ใช้';

  // Try to get employee information
  if (userInfo.employeeCode && employees) {
    const employee = Object.values(employees).find(
      (emp) => emp.employeeCode === userInfo.employeeCode
    );
    if (employee) {
      return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    }
  }

  // Try different user info fields
  return (
    userInfo.displayName ||
    userInfo.fullName ||
    userInfo.name ||
    userInfo.email ||
    'ไม่ทราบผู้ใช้'
  );
};

/**
 * Format geographic context for display
 * @param {GeographicContext} [geographic] - Geographic context
 * @param {Object} [branches] - Branches data
 * @returns {string} Formatted geographic info
 */
export const formatGeographicContext = (geographic, branches = {}) => {
  if (!geographic) return '';

  const parts = [];

  if (geographic.branchCode) {
    const branch = branches[geographic.branchCode];
    const branchName = branch?.branchName || geographic.branchCode;
    parts.push(`สาขา: ${branchName}`);
  }

  if (geographic.provinceId) {
    parts.push(`จังหวัด: ${geographic.provinceId}`);
  }

  return parts.join(' • ');
};

/**
 * Get status color for Ant Design components
 * @param {string} status - Status value
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'draft': '#d9d9d9',
    'submitted': '#faad14',
    'reviewed': '#1890ff',
    'approved': '#52c41a',
    'rejected': '#ff4d4f',
    'cancelled': '#8c8c8c'
  };

  return statusColors[status] || '#d9d9d9';
};

/**
 * Get action color for audit trail actions
 * @param {string} action - Action type
 * @returns {string} Color code
 */
export const getActionColor = (action) => {
  const actionColors = {
    'create': '#52c41a',
    'update': '#1890ff',
    'delete': '#ff4d4f',
    'approve': '#722ed1',
    'reject': '#ff4d4f',
    'submit': '#faad14',
    'cancel': '#8c8c8c'
  };

  return actionColors[action] || '#d9d9d9';
};

/**
 * Sort audit entries by timestamp (newest first)
 * @template T
 * @param {T[]} entries - Array of entries with time/timestamp properties
 * @returns {T[]} Sorted entries
 */
export const sortAuditEntries = (entries) => {
  return [...entries].sort((a, b) => {
    const timeA = a.timestamp || a.time;
    const timeB = b.timestamp || b.time;
    return timeB - timeA;
  });
}; 