/**
 * KBN Permission Warning System
 * 
 * Provides user-friendly warning messages when users don't have permission
 * to perform certain actions. Integrates with the unified theme system.
 */

import React from 'react';
import { showAlert, showWarn } from 'functions';
import { notification } from 'antd';
import { ExclamationCircleOutlined, LockOutlined, WarningOutlined } from '@ant-design/icons';

// Permission warning message templates
const WARNING_MESSAGES = {
  // General permission messages
  NO_PERMISSION: {
    title: 'ไม่มีสิทธิ์เข้าถึง',
    description: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
    englishTitle: 'Access Denied',
    englishDescription: 'You do not have permission to perform this action'
  },
  
  // Specific action messages
  CANNOT_APPROVE: {
    title: 'ไม่สามารถอนุมัติได้',
    description: 'คุณไม่มีสิทธิ์ในการอนุมัติรายการนี้',
    englishTitle: 'Cannot Approve',
    englishDescription: 'You do not have permission to approve this item'
  },
  
  CANNOT_EDIT: {
    title: 'ไม่สามารถแก้ไขได้',
    description: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้',
    englishTitle: 'Cannot Edit',
    englishDescription: 'You do not have permission to edit this data'
  },
  
  CANNOT_DELETE: {
    title: 'ไม่สามารถลบได้',
    description: 'คุณไม่มีสิทธิ์ในการลบข้อมูลนี้',
    englishTitle: 'Cannot Delete',
    englishDescription: 'You do not have permission to delete this data'
  },
  
  CANNOT_VIEW: {
    title: 'ไม่สามารถดูได้',
    description: 'คุณไม่มีสิทธิ์ในการดูข้อมูลนี้',
    englishTitle: 'Cannot View',
    englishDescription: 'You do not have permission to view this data'
  },
  
  CANNOT_CREATE: {
    title: 'ไม่สามารถสร้างได้',
    description: 'คุณไม่มีสิทธิ์ในการสร้างรายการใหม่',
    englishTitle: 'Cannot Create',
    englishDescription: 'You do not have permission to create new items'
  },
  
  // Geographic permission messages
  WRONG_PROVINCE: {
    title: 'ไม่มีสิทธิ์เข้าถึงจังหวัดนี้',
    description: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลของจังหวัดนี้',
    englishTitle: 'Province Access Denied',
    englishDescription: 'You do not have access to this province data'
  },
  
  WRONG_BRANCH: {
    title: 'ไม่มีสิทธิ์เข้าถึงสาขานี้',
    description: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลของสาขานี้',
    englishTitle: 'Branch Access Denied',
    englishDescription: 'You do not have access to this branch data'
  },
  
  // Department permission messages
  WRONG_DEPARTMENT: {
    title: 'ไม่มีสิทธิ์เข้าถึงแผนกนี้',
    description: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลของแผนกนี้',
    englishTitle: 'Department Access Denied',
    englishDescription: 'You do not have access to this department data'
  },
  
  // Status-based messages
  ITEM_ALREADY_APPROVED: {
    title: 'รายการได้รับการอนุมัติแล้ว',
    description: 'ไม่สามารถดำเนินการกับรายการที่อนุมัติแล้ว',
    englishTitle: 'Item Already Approved',
    englishDescription: 'Cannot perform action on already approved item'
  },
  
  ITEM_CANCELLED: {
    title: 'รายการถูกยกเลิกแล้ว',
    description: 'ไม่สามารถดำเนินการกับรายการที่ยกเลิกแล้ว',
    englishTitle: 'Item Cancelled',
    englishDescription: 'Cannot perform action on cancelled item'
  },
  
  // User status messages
  USER_INACTIVE: {
    title: 'บัญชีผู้ใช้ไม่ได้ใช้งาน',
    description: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
    englishTitle: 'User Account Inactive',
    englishDescription: 'Your account is inactive. Please contact system administrator'
  },
  
  USER_NOT_MIGRATED: {
    title: 'บัญชีผู้ใช้ต้องการการอัปเดต',
    description: 'บัญชีของคุณต้องการการอัปเดตระบบสิทธิ์ กรุณาติดต่อผู้ดูแลระบบ',
    englishTitle: 'User Account Needs Update',
    englishDescription: 'Your account needs permission system update. Please contact administrator'
  }
};

/**
 * Show permission warning notification
 * @param {string} messageType - Type of warning message
 * @param {Object} options - Additional options
 * @param {string} options.customMessage - Custom message to override default
 * @param {string} options.context - Additional context information
 * @param {boolean} options.useEnglish - Show English messages
 * @param {string} options.placement - Notification placement
 * @param {number} options.duration - Duration in seconds (0 = manual close)
 */
export const showPermissionWarning = (messageType = 'NO_PERMISSION', options = {}) => {
  const {
    customMessage,
    context,
    useEnglish = false,
    placement = 'topRight',
    duration = 4.5
  } = options;

  const message = WARNING_MESSAGES[messageType] || WARNING_MESSAGES.NO_PERMISSION;
  
  const title = customMessage?.title || (useEnglish ? message.englishTitle : message.title);
  const description = customMessage?.description || (useEnglish ? message.englishDescription : message.description);
  
  // Add context information if provided
  const fullDescription = context ? `${description}\n\nรายละเอียด: ${context}` : description;
  
  notification.warning({
    message: title,
    description: fullDescription,
    icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    placement,
    duration,
    style: {
      fontFamily: 'var(--nature-font-family)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    className: 'nature-notification-warning'
  });
};

/**
 * Show permission error alert (modal)
 * @param {string} messageType - Type of warning message
 * @param {Object} options - Additional options
 */
export const showPermissionAlert = (messageType = 'NO_PERMISSION', options = {}) => {
  const {
    customMessage,
    context,
    useEnglish = false,
    onOk
  } = options;

  const message = WARNING_MESSAGES[messageType] || WARNING_MESSAGES.NO_PERMISSION;
  
  const title = customMessage?.title || (useEnglish ? message.englishTitle : message.title);
  const description = customMessage?.description || (useEnglish ? message.englishDescription : message.description);
  
  // Add context information if provided
  const fullDescription = context ? `${description}\n\nรายละเอียด: ${context}` : description;
  
  showAlert(title, fullDescription, 'warning', onOk);
};

/**
 * Show permission error in console (for debugging)
 * @param {string} messageType - Type of warning message
 * @param {Object} context - Context information for debugging
 */
export const logPermissionError = (messageType, context = {}) => {
  const message = WARNING_MESSAGES[messageType] || WARNING_MESSAGES.NO_PERMISSION;
  
  console.warn(`🚫 Permission Denied: ${message.englishTitle}`);
  console.warn(`📝 Description: ${message.englishDescription}`);
  
  if (context.user) {
    console.warn(`👤 User: ${context.user.displayName || context.user.email || context.user.uid}`);
    console.warn(`🔑 Authority: ${context.user.access?.authority || 'Unknown'}`);
    console.warn(`🏢 Departments: ${context.user.access?.departments?.join(', ') || 'Unknown'}`);
  }
  
  if (context.permission) {
    console.warn(`🎯 Required Permission: ${context.permission}`);
  }
  
  if (context.geographic) {
    console.warn(`🌍 Geographic Context: ${JSON.stringify(context.geographic)}`);
  }
  
  if (context.additional) {
    console.warn(`ℹ️ Additional Info: ${JSON.stringify(context.additional)}`);
  }
};

/**
 * Higher-order function to wrap actions with permission checking
 * @param {Function} action - The action to perform
 * @param {Function} permissionCheck - Function that returns true if user has permission
 * @param {string} messageType - Type of warning message to show
 * @param {Object} options - Additional options
 */
export const withPermissionCheck = (action, permissionCheck, messageType = 'NO_PERMISSION', options = {}) => {
  return (...args) => {
    if (permissionCheck(...args)) {
      return action(...args);
    } else {
      showPermissionWarning(messageType, options);
      
      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        logPermissionError(messageType, {
          action: action.name,
          args,
          ...options.debugContext
        });
      }
      
      return false;
    }
  };
};

/**
 * React hook for permission-aware actions
 * @param {Function} permissionCheck - Function that returns true if user has permission
 * @param {string} messageType - Type of warning message to show
 * @param {Object} options - Additional options
 */
export const usePermissionAction = (permissionCheck, messageType = 'NO_PERMISSION', options = {}) => {
  return (action) => {
    return withPermissionCheck(action, permissionCheck, messageType, options);
  };
};

/**
 * Utility to check and warn about specific permission scenarios
 */
export const PermissionChecker = {
  // Check if user can approve
  canApprove: (user, context = {}) => {
    if (!user || !user.access) {
      showPermissionWarning('USER_NOT_MIGRATED');
      return false;
    }
    
    if (!user.isActive) {
      showPermissionWarning('USER_INACTIVE');
      return false;
    }
    
    // Add specific approval permission logic here
    return true;
  },
  
  // Check if user can edit
  canEdit: (user, item, context = {}) => {
    if (!user || !user.access) {
      showPermissionWarning('USER_NOT_MIGRATED');
      return false;
    }
    
    if (item?.status === 'approved') {
      showPermissionWarning('ITEM_ALREADY_APPROVED');
      return false;
    }
    
    if (item?.status === 'cancelled') {
      showPermissionWarning('ITEM_CANCELLED');
      return false;
    }
    
    return true;
  },
  
  // Check if user can delete
  canDelete: (user, item, context = {}) => {
    if (!user || !user.access) {
      showPermissionWarning('USER_NOT_MIGRATED');
      return false;
    }
    
    if (item?.status === 'approved') {
      showPermissionWarning('ITEM_ALREADY_APPROVED');
      return false;
    }
    
    return true;
  }
};

// Export message types for easy reference
export const PERMISSION_MESSAGE_TYPES = Object.keys(WARNING_MESSAGES);

export default {
  showPermissionWarning,
  showPermissionAlert,
  logPermissionError,
  withPermissionCheck,
  usePermissionAction,
  PermissionChecker,
  PERMISSION_MESSAGE_TYPES,
  WARNING_MESSAGES
}; 