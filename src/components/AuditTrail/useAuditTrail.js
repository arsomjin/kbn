import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  createAuditTrailEntry, 
  createStatusHistoryEntry, 
  getObjectDifferences,
  sortAuditEntries
} from './utils';
import { usePermissions } from '../../hooks/usePermissions';
import { useGeographicData } from '../../hooks/useGeographicData';
import './types'; // Import JSDoc types

/**
 * @typedef {Object} UseAuditTrailProps
 * @property {string} [documentId] - Document ID
 * @property {string} [documentType] - Document type
 * @property {AuditTrailEntry[]} [initialAuditTrail] - Initial audit trail entries
 * @property {StatusHistoryEntry[]} [initialStatusHistory] - Initial status history entries
 * @property {AuditTrailConfig} [config] - Configuration options
 */

/**
 * @typedef {Object} SaveWithAuditTrailParams
 * @property {string} collection - Firestore collection name
 * @property {Object} data - Data to save
 * @property {boolean} [isEdit] - Is this an edit operation
 * @property {number|null} [step] - Step number
 * @property {string} [notes] - Notes
 * @property {Object} [oldData] - Old data for comparison
 */

/**
 * @typedef {Object} ProgressStepParams
 * @property {string} collection - Firestore collection name
 * @property {number} newStep - New step number
 * @property {string} action - Action being performed
 * @property {string} [notes] - Notes
 * @property {Object} [additionalData] - Additional data
 */

/**
 * @typedef {Object} UseAuditTrailReturn
 * @property {AuditTrailEntry[]} auditTrail - Audit trail entries
 * @property {StatusHistoryEntry[]} statusHistory - Status history entries
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {Function} addAuditEntry - Add audit entry function
 * @property {Function} addStatusEntry - Add status entry function
 * @property {Function} addMultipleAuditEntries - Add multiple audit entries
 * @property {Function} addMultipleStatusEntries - Add multiple status entries
 * @property {Function} clearAuditTrail - Clear audit trail
 * @property {Function} clearStatusHistory - Clear status history
 * @property {Function} clearAll - Clear all data
 * @property {Function} saveWithAuditTrail - Save with audit trail
 * @property {Function} progressStepWithAudit - Progress step with audit
 * @property {Function} getAuditByAction - Get audit entries by action
 * @property {Function} getStatusByType - Get status entries by type
 * @property {Function} getCurrentStatus - Get current status
 * @property {Function} getLastAction - Get last action
 * @property {Function} canPerformAction - Check if can perform action
 * @property {Function} canViewAuditTrail - Check if can view audit trail
 * @property {Function} canEditAuditTrail - Check if can edit audit trail
 */

/**
 * React hook for managing audit trail state and operations with RBAC integration
 * @param {UseAuditTrailProps} [props] - Hook props
 * @returns {UseAuditTrailReturn} Hook return object
 */
export const useAuditTrail = ({
  documentId,
  documentType,
  initialAuditTrail = [],
  initialStatusHistory = [],
  config = {}
} = {}) => {
  
  // State management
  const [auditTrail, setAuditTrail] = useState(initialAuditTrail);
  const [statusHistory, setStatusHistory] = useState(initialStatusHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { branches } = useSelector((state) => state.data);
  
  // Custom hooks
  const { hasPermission } = usePermissions();
  const { getCurrentProvince, getDefaultBranch, homeBranch, homeProvince } = useGeographicData();

  // Create geographic context
  const getCurrentGeographicContext = useCallback(() => {
    const currentProvince = getCurrentProvince();
    const defaultBranch = getDefaultBranch();
    const branch = branches?.[defaultBranch];
    
    return {
      branchCode: defaultBranch || homeBranch,
      provinceId: currentProvince || homeProvince,
      branchName: branch?.branchName,
      recordedProvince: currentProvince || homeProvince,
      recordedBranch: defaultBranch || homeBranch
    };
  }, [getCurrentProvince, getDefaultBranch, homeBranch, homeProvince, branches]);

  // Create user info from current user
  const getCurrentUserInfo = useCallback(() => {
    if (!user) return { uid: 'system', displayName: 'ระบบ' };
    
    return {
      uid: user.uid,
      displayName: user.displayName || user.name,
      fullName: user.fullName,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      accessLevel: user.accessLevel,
      employeeCode: user.employeeCode,
      branchCode: user.homeBranch,
      provinceId: user.homeProvince
    };
  }, [user]);

  /**
   * Add audit entry
   * @param {string} uid - User ID
   * @param {'create'|'update'|'delete'|'approve'|'reject'|'submit'|'cancel'} action - Action type
   * @param {UserInfo} userInfo - User information
   * @param {Object} [oldData] - Old data
   * @param {Object} [newData] - New data
   * @param {DocumentInfo} [documentInfo] - Document information
   * @param {number|null} [step] - Step number
   * @param {string} [notes] - Notes
   */
  const addAuditEntry = useCallback((
    uid,
    action,
    userInfo,
    oldData = {},
    newData = {},
    documentInfo = {},
    step = null,
    notes = ''
  ) => {
    try {
      const changes = oldData && newData ? getObjectDifferences(oldData, newData, config.excludeFields) : undefined;
      const geographic = getCurrentGeographicContext();
      
      const entry = createAuditTrailEntry(
        uid,
        action,
        userInfo,
        changes,
        documentInfo,
        geographic,
        step,
        notes
      );
      
      setAuditTrail(prev => sortAuditEntries([...prev, entry]));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add audit entry');
    }
  }, [getCurrentGeographicContext, config.excludeFields]);

  /**
   * Add status entry
   * @param {string} uid - User ID
   * @param {string} status - Status value
   * @param {UserInfo} userInfo - User information
   * @param {string} [comment] - Comment
   */
  const addStatusEntry = useCallback((
    uid, 
    status, 
    userInfo, 
    comment = ''
  ) => {
    try {
      const geographic = getCurrentGeographicContext();
      
      const entry = createStatusHistoryEntry(
        uid,
        status,
        userInfo,
        comment,
        geographic,
        documentId,
        documentType
      );
      
      setStatusHistory(prev => sortAuditEntries([...prev, entry]));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add status entry');
    }
  }, [getCurrentGeographicContext, documentId, documentType]);

  /**
   * Add multiple audit entries
   * @param {Partial<AuditTrailEntry>[]} entries - Partial audit entries
   */
  const addMultipleAuditEntries = useCallback((entries) => {
    try {
      const geographic = getCurrentGeographicContext();
      const currentUser = getCurrentUserInfo();
      
      const completeEntries = entries.map((entry, index) => ({
        id: `audit_${Date.now()}_${index}`,
        time: Date.now(),
        timestamp: Date.now(),
        geographic,
        userInfo: currentUser,
        ...entry
      }));
      
      setAuditTrail(prev => sortAuditEntries([...prev, ...completeEntries]));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add multiple audit entries');
    }
  }, [getCurrentGeographicContext, getCurrentUserInfo]);

  /**
   * Add multiple status entries
   * @param {Partial<StatusHistoryEntry>[]} entries - Partial status entries
   */
  const addMultipleStatusEntries = useCallback((entries) => {
    try {
      const geographic = getCurrentGeographicContext();
      const currentUser = getCurrentUserInfo();
      
      const completeEntries = entries.map((entry, index) => ({
        id: `status_${Date.now()}_${index}`,
        time: Date.now(),
        timestamp: Date.now(),
        geographic,
        userInfo: currentUser,
        documentId,
        documentType,
        ...entry
      }));
      
      setStatusHistory(prev => sortAuditEntries([...prev, ...completeEntries]));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add multiple status entries');
    }
  }, [getCurrentGeographicContext, getCurrentUserInfo, documentId, documentType]);

  // Clear functions
  const clearAuditTrail = useCallback(() => {
    setAuditTrail([]);
    setError(null);
  }, []);

  const clearStatusHistory = useCallback(() => {
    setStatusHistory([]);
    setError(null);
  }, []);

  const clearAll = useCallback(() => {
    setAuditTrail([]);
    setStatusHistory([]);
    setError(null);
  }, []);

  /**
   * Enhanced save with audit trail (integrates with existing Firebase utils)
   * @param {SaveWithAuditTrailParams} params - Save parameters
   */
  const saveWithAuditTrail = useCallback(async ({
    collection,
    data,
    isEdit = false,
    step = null,
    notes = null,
    oldData = {}
  }) => {
    // Map collection to department permissions
    const departmentMap = {
      'invoices': 'accounting',
      'receipts': 'accounting', 
      'sales': 'sales',
      'services': 'service',
      'inventory': 'inventory',
      'employees': 'hr'
    };
    
    const department = departmentMap[collection] || 'accounting';
    const requiredPermission = `${department}.${isEdit ? 'edit' : 'edit'}`;
    
    if (!hasPermission(requiredPermission)) {
      throw new Error('ไม่มีสิทธิ์ในการดำเนินการนี้');
    }

    setLoading(true);
    try {
      const currentUser = getCurrentUserInfo();
      
      // Add audit entry for the save operation
      addAuditEntry(
        currentUser.uid || 'system',
        isEdit ? 'update' : 'create',
        currentUser,
        oldData,
        data,
        { documentId, documentType },
        step,
        notes
      );

      // Add status entry if this is a step progression
      if (step !== null) {
        const statusText = isEdit ? 'updated' : 'created';
        addStatusEntry(
          currentUser.uid || 'system',
          statusText,
          currentUser,
          notes
        );
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save with audit trail');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasPermission, getCurrentUserInfo, getCurrentGeographicContext, addAuditEntry, addStatusEntry, documentId, documentType]);

  /**
   * Progress step with audit
   * @param {ProgressStepParams} params - Progress step parameters
   */
  const progressStepWithAudit = useCallback(async ({
    collection,
    newStep,
    action,
    notes = null,
    additionalData = {}
  }) => {
    // Map collection to department permissions for approval
    const departmentMap = {
      'invoices': 'accounting',
      'receipts': 'accounting', 
      'sales': 'sales',
      'services': 'service',
      'inventory': 'inventory',
      'employees': 'hr'
    };
    
    const department = departmentMap[collection] || 'accounting';
    const requiredPermission = `${department}.approve`;
    
    if (!hasPermission(requiredPermission)) {
      throw new Error('ไม่มีสิทธิ์ในการอนุมัติ/ดำเนินการ');
    }

    setLoading(true);
    try {
      const currentUser = getCurrentUserInfo();
      
      // Add audit entry for step progression
      addAuditEntry(
        currentUser.uid || 'system',
        action,
        currentUser,
        {},
        additionalData,
        { documentId, documentType },
        newStep,
        notes
      );

      // Add status entry
      addStatusEntry(
        currentUser.uid || 'system',
        action,
        currentUser,
        notes
      );

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to progress step');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasPermission, getCurrentUserInfo, addAuditEntry, addStatusEntry, documentId, documentType]);

  // Data retrieval functions
  const getAuditByAction = useCallback((action) => {
    return auditTrail.filter(entry => entry.action === action);
  }, [auditTrail]);

  const getStatusByType = useCallback((status) => {
    return statusHistory.filter(entry => entry.status === status);
  }, [statusHistory]);

  const getCurrentStatus = useCallback(() => {
    return statusHistory.length > 0 ? statusHistory[0] : null;
  }, [statusHistory]);

  const getLastAction = useCallback(() => {
    return auditTrail.length > 0 ? auditTrail[0] : null;
  }, [auditTrail]);

  // Permission helpers - use document flow permissions instead of audit-specific
  const canPerformAction = useCallback((action, department = 'accounting') => {
    const flowMap = {
      'create': 'edit',
      'update': 'edit',
      'delete': 'edit',
      'approve': 'approve',
      'reject': 'approve',
      'submit': 'edit'
    };
    
    const flow = flowMap[action] || 'view';
    return hasPermission(`${department}.${flow}`);
  }, [hasPermission]);

  const canViewAuditTrail = useCallback((department = null) => {
    // If department specified, check department.view permission
    if (department) {
      return hasPermission(`${department}.view`);
    }
    
    // Otherwise check if user has any view permission (accounting, sales, service, etc.)
    return hasPermission('accounting.view') || 
           hasPermission('sales.view') || 
           hasPermission('service.view') || 
           hasPermission('inventory.view') ||
           hasPermission('hr.view') ||
           hasPermission('*');
  }, [hasPermission]);

  const canEditAuditTrail = useCallback((department = null) => {
    // If department specified, check department.edit permission  
    if (department) {
      return hasPermission(`${department}.edit`);
    }
    
    // Otherwise check if user has any edit permission
    return hasPermission('accounting.edit') || 
           hasPermission('sales.edit') || 
           hasPermission('service.edit') || 
           hasPermission('inventory.edit') ||
           hasPermission('hr.edit') ||
           hasPermission('*');
  }, [hasPermission]);

  // Sort entries whenever they change
  useEffect(() => {
    setAuditTrail(prev => sortAuditEntries(prev));
  }, [auditTrail.length]);

  useEffect(() => {
    setStatusHistory(prev => sortAuditEntries(prev));
  }, [statusHistory.length]);

  return {
    auditTrail,
    statusHistory,
    loading,
    error,
    
    // Entry management
    addAuditEntry,
    addStatusEntry,
    addMultipleAuditEntries,
    addMultipleStatusEntries,
    
    // Utility functions
    clearAuditTrail,
    clearStatusHistory,
    clearAll,
    
    // Enhanced functions with RBAC
    saveWithAuditTrail,
    progressStepWithAudit,
    
    // Data retrieval
    getAuditByAction,
    getStatusByType,
    getCurrentStatus,
    getLastAction,
    
    // Permission helpers
    canPerformAction,
    canViewAuditTrail,
    canEditAuditTrail
  };
}; 