/**
 * Audit Trail Utilities
 * Provides functions for tracking document changes, status updates, and user actions
 * Integrated with RBAC system for compliance and accountability
 */

import { getChanges, getArrayChanges } from 'functions';

/**
 * Create a new audit trail entry
 * @param {Object} params - Audit trail parameters
 * @returns {Object} Audit trail entry
 */
export const createAuditTrailEntry = ({
  documentId,
  documentType,
  action,
  step = null,
  actionBy,
  branchCode = null,
  provinceId = null,
  notes = null,
  metadata = {}
}) => {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    documentId,
    documentType,
    action,
    step,
    actionBy,
    branchCode,
    provinceId,
    timestamp: Date.now(),
    notes,
    metadata: {
      userAgent: navigator?.userAgent,
      ipAddress: null, // Would be set server-side
      ...metadata
    }
  };
};

/**
 * Create a change history entry
 * @param {Object} params - Change history parameters
 * @returns {Object} Change history entry
 */
export const createChangeHistoryEntry = ({
  documentId,
  documentType,
  type, // 'created', 'edited', 'approved', 'rejected', 'submitted', 'cancelled'
  changedBy,
  branchCode = null,
  provinceId = null,
  changes = [],
  notes = null,
  oldValues = {},
  newValues = {}
}) => {
  return {
    id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    documentId,
    documentType,
    type,
    changedBy,
    branchCode,
    provinceId,
    timestamp: Date.now(),
    changes,
    notes,
    oldValues,
    newValues
  };
};

/**
 * Generate change history from old and new values
 * @param {Object} oldData - Previous document state
 * @param {Object} newData - Current document state
 * @param {Array} excludeFields - Fields to exclude from change tracking
 * @returns {Array} Array of change objects
 */
export const generateChangeHistory = (oldData, newData, excludeFields = []) => {
  const changes = [];
  const exclude = ['updatedAt', 'modifiedAt', 'timestamp', ...excludeFields];
  
  // Get simple field changes
  const fieldChanges = getChanges(oldData, newData);
  if (fieldChanges && typeof fieldChanges === 'object') {
    Object.keys(fieldChanges).forEach(field => {
      if (!exclude.includes(field)) {
        changes.push({
          field,
          oldValue: formatValue(oldData[field]),
          newValue: formatValue(fieldChanges[field]),
          type: 'field_change'
        });
      }
    });
  }
  
  // Get array changes (for items, etc.)
  if (oldData.items && newData.items) {
    const arrayChanges = getArrayChanges(oldData.items, newData.items);
    if (arrayChanges && arrayChanges.length > 0) {
      arrayChanges.forEach(change => {
        changes.push({
          field: 'items',
          oldValue: `${oldData.items?.length || 0} รายการ`,
          newValue: `${newData.items?.length || 0} รายการ`,
          type: 'array_change',
          details: change
        });
      });
    }
  }
  
  return changes;
};

/**
 * Format value for display in change history
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
const formatValue = (value) => {
  if (value === null || value === undefined) return 'ไม่มีข้อมูล';
  if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่ใช่';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return `[${value.length} รายการ]`;
    return '[Object]';
  }
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
};

/**
 * Add audit trail to document
 * @param {Object} params - Parameters for audit trail
 * @returns {Object} Audit trail entry to be saved
 */
export const addAuditTrail = ({
  documentId,
  documentType,
  action,
  step = null,
  user,
  geographic = {},
  notes = null,
  metadata = {}
}) => {
  return createAuditTrailEntry({
    documentId,
    documentType,
    action,
    step,
    actionBy: user.uid,
    branchCode: geographic.branchCode || user.homeBranch,
    provinceId: geographic.provinceId || user.homeProvince,
    notes,
    metadata: {
      userName: user.displayName || user.name,
      userRole: user.accessLevel,
      ...metadata
    }
  });
};

/**
 * Add change history to document
 * @param {Object} params - Parameters for change history
 * @returns {Object} Change history entry to be saved
 */
export const addChangeHistory = ({
  documentId,
  documentType,
  type,
  user,
  geographic = {},
  oldData = {},
  newData = {},
  notes = null,
  customChanges = null
}) => {
  const changes = customChanges || generateChangeHistory(oldData, newData);
  
  return createChangeHistoryEntry({
    documentId,
    documentType,
    type,
    changedBy: user.uid,
    branchCode: geographic.branchCode || user.homeBranch,
    provinceId: geographic.provinceId || user.homeProvince,
    changes,
    notes,
    oldValues: oldData,
    newValues: newData
  });
};

/**
 * Save audit trail to Firestore
 * @param {Object} firestore - Firestore instance
 * @param {Object} auditTrailEntry - Audit trail entry
 * @param {string} collection - Collection to save to (optional)
 */
export const saveAuditTrail = async (firestore, auditTrailEntry, collection = 'auditTrails') => {
  try {
    const auditRef = firestore.collection(collection).doc(auditTrailEntry.id);
    await auditRef.set(auditTrailEntry);
    
    // Also add to document-specific audit trail
    const docAuditRef = firestore
      .collection('documents')
      .doc(auditTrailEntry.documentId)
      .collection('auditTrail')
      .doc(auditTrailEntry.id);
    
    await docAuditRef.set(auditTrailEntry);
    
    return auditTrailEntry.id;
  } catch (error) {
    console.error('Error saving audit trail:', error);
    throw error;
  }
};

/**
 * Save change history to Firestore
 * @param {Object} firestore - Firestore instance
 * @param {Object} changeHistoryEntry - Change history entry
 * @param {string} collection - Collection to save to (optional)
 */
export const saveChangeHistory = async (firestore, changeHistoryEntry, collection = 'changeHistory') => {
  try {
    const changeRef = firestore.collection(collection).doc(changeHistoryEntry.id);
    await changeRef.set(changeHistoryEntry);
    
    // Also add to document-specific change history
    const docChangeRef = firestore
      .collection('documents')
      .doc(changeHistoryEntry.documentId)
      .collection('changeHistory')
      .doc(changeHistoryEntry.id);
    
    await docChangeRef.set(changeHistoryEntry);
    
    return changeHistoryEntry.id;
  } catch (error) {
    console.error('Error saving change history:', error);
    throw error;
  }
};

/**
 * Get audit trail for a document
 * @param {Object} firestore - Firestore instance
 * @param {string} documentId - Document ID
 * @returns {Array} Audit trail entries
 */
export const getDocumentAuditTrail = async (firestore, documentId) => {
  try {
    const auditRef = firestore
      .collection('documents')
      .doc(documentId)
      .collection('auditTrail')
      .orderBy('timestamp', 'asc');
    
    const snapshot = await auditRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
};

/**
 * Get change history for a document
 * @param {Object} firestore - Firestore instance
 * @param {string} documentId - Document ID
 * @returns {Array} Change history entries
 */
export const getDocumentChangeHistory = async (firestore, documentId) => {
  try {
    const changeRef = firestore
      .collection('documents')
      .doc(documentId)
      .collection('changeHistory')
      .orderBy('timestamp', 'desc');
    
    const snapshot = await changeRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching change history:', error);
    return [];
  }
};

/**
 * Enhanced document save with audit trail
 * @param {Object} params - Save parameters
 * @returns {Object} Save result with audit trail
 */
export const saveDocumentWithAuditTrail = async ({
  firestore,
  collection,
  documentId,
  documentType,
  data,
  user,
  geographic = {},
  isEdit = false,
  step = null,
  notes = null,
  oldData = {}
}) => {
  try {
    // Prepare document data with audit fields
    const enrichedData = {
      ...data,
      // RBAC Geographic Context
      branchCode: geographic.branchCode || user.homeBranch,
      provinceId: geographic.provinceId || user.homeProvince,
      branchName: geographic.branchName,
      recordedProvince: geographic.recordedProvince,
      recordedBranch: geographic.recordedBranch,
      // Audit fields
      lastModifiedBy: user.uid,
      lastModifiedAt: Date.now(),
      lastModifiedBranch: geographic.branchCode || user.homeBranch
    };
    
    if (!isEdit) {
      enrichedData.createdBy = user.uid;
      enrichedData.createdAt = Date.now();
      enrichedData.createdBranch = geographic.branchCode || user.homeBranch;
    }
    
    // Save document
    const docRef = firestore.collection(collection).doc(documentId);
    if (isEdit) {
      await docRef.update(enrichedData);
    } else {
      await docRef.set(enrichedData);
    }
    
    // Create audit trail
    const auditTrail = addAuditTrail({
      documentId,
      documentType,
      action: isEdit ? 'updated' : 'created',
      step,
      user,
      geographic,
      notes,
      metadata: {
        collection,
        dataSize: JSON.stringify(data).length
      }
    });
    
    // Create change history
    const changeHistory = addChangeHistory({
      documentId,
      documentType,
      type: isEdit ? 'edited' : 'created',
      user,
      geographic,
      oldData: isEdit ? oldData : {},
      newData: enrichedData,
      notes
    });
    
    // Save audit trail and change history
    await Promise.all([
      saveAuditTrail(firestore, auditTrail),
      saveChangeHistory(firestore, changeHistory)
    ]);
    
    return {
      success: true,
      documentId,
      auditTrailId: auditTrail.id,
      changeHistoryId: changeHistory.id,
      data: enrichedData
    };
    
  } catch (error) {
    console.error('Error saving document with audit trail:', error);
    throw error;
  }
};

/**
 * Step progression with audit trail
 * @param {Object} params - Step progression parameters
 * @returns {Object} Updated document with audit trail
 */
export const progressStepWithAuditTrail = async ({
  firestore,
  collection,
  documentId,
  documentType,
  newStep,
  action,
  user,
  geographic = {},
  notes = null,
  additionalData = {}
}) => {
  try {
    // Update document step
    const updateData = {
      currentStep: newStep,
      status: action,
      lastModifiedBy: user.uid,
      lastModifiedAt: Date.now(),
      lastModifiedBranch: geographic.branchCode || user.homeBranch,
      ...additionalData
    };
    
    const docRef = firestore.collection(collection).doc(documentId);
    await docRef.update(updateData);
    
    // Create audit trail for step progression
    const auditTrail = addAuditTrail({
      documentId,
      documentType,
      action: `step_${action}`,
      step: newStep,
      user,
      geographic,
      notes,
      metadata: {
        previousStep: newStep - 1,
        newStep: newStep,
        stepAction: action
      }
    });
    
    // Create change history for step progression
    const changeHistory = addChangeHistory({
      documentId,
      documentType,
      type: action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'submitted',
      user,
      geographic,
      notes,
      customChanges: [{
        field: 'status',
        oldValue: 'รอดำเนินการ',
        newValue: action === 'approved' ? 'อนุมัติ' : action === 'rejected' ? 'ปฏิเสธ' : 'ส่งต่อ',
        type: 'status_change'
      }]
    });
    
    // Save audit trail and change history
    await Promise.all([
      saveAuditTrail(firestore, auditTrail),
      saveChangeHistory(firestore, changeHistory)
    ]);
    
    return {
      success: true,
      documentId,
      newStep,
      action,
      auditTrailId: auditTrail.id,
      changeHistoryId: changeHistory.id
    };
    
  } catch (error) {
    console.error('Error progressing step with audit trail:', error);
    throw error;
  }
}; 