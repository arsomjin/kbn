/**
 * useAuditTrail Hook
 * Provides easy access to audit trail functionality with automatic RBAC integration
 * Manages document audit trails, change history, and step progression
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from './usePermissions';
import { useGeographicData } from './useGeographicData';
import { FirebaseContext } from '../firebase';
import {
  getDocumentAuditTrail,
  getDocumentChangeHistory,
  saveDocumentWithAuditTrail,
  progressStepWithAuditTrail,
  addAuditTrail,
  addChangeHistory,
  saveAuditTrail,
  saveChangeHistory
} from 'utils/auditTrail';

const useAuditTrail = (documentId, documentType) => {
  const [auditTrail, setAuditTrail] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get required dependencies
  const { user } = useSelector(state => state.auth);
  const { firestore } = useContext(FirebaseContext);
  const { hasPermission } = usePermissions();
  const { getCurrentProvince, getDefaultBranch, homeBranch, homeProvince } = useGeographicData();
  const { branches } = useSelector(state => state.data);

  // Create geographic context function
  const getCurrentGeographicContext = useCallback(() => {
    const currentProvince = getCurrentProvince();
    const defaultBranch = getDefaultBranch();
    const branch = branches[defaultBranch];
    
    return {
      branchCode: defaultBranch || homeBranch,
      provinceId: currentProvince || homeProvince,
      branchName: branch?.branchName,
      recordedProvince: currentProvince || homeProvince,
      recordedBranch: defaultBranch || homeBranch
    };
  }, [getCurrentProvince, getDefaultBranch, homeBranch, homeProvince, branches]);

  /**
   * Load audit trail and change history for the document
   */
  const loadAuditData = useCallback(async () => {
    if (!documentId || !hasPermission('audit.view')) return;

    setLoading(true);
    setError(null);

    try {
      const [auditData, changeData] = await Promise.all([
        getDocumentAuditTrail(firestore, documentId),
        getDocumentChangeHistory(firestore, documentId)
      ]);

      setAuditTrail(auditData);
      setChangeHistory(changeData);
    } catch (err) {
      console.error('Error loading audit data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [documentId, firestore, hasPermission]);

  /**
   * Save document with automatic audit trail creation
   */
  const saveWithAuditTrail = useCallback(async ({
    collection,
    data,
    isEdit = false,
    step = null,
    notes = null,
    oldData = {}
  }) => {
    if (!hasPermission(isEdit ? 'audit.edit' : 'audit.create')) {
      throw new Error('ไม่มีสิทธิ์ในการดำเนินการนี้');
    }

    const geographic = getCurrentGeographicContext();
    
    const result = await saveDocumentWithAuditTrail({
      firestore,
      collection,
      documentId,
      documentType,
      data,
      user,
      geographic,
      isEdit,
      step,
      notes,
      oldData
    });

    // Refresh audit data after save
    await loadAuditData();

    return result;
  }, [documentId, documentType, firestore, user, hasPermission, getCurrentGeographicContext, loadAuditData]);

  /**
   * Progress to next step with audit trail
   */
  const progressStep = useCallback(async ({
    collection,
    newStep,
    action,
    notes = null,
    additionalData = {}
  }) => {
    if (!hasPermission('audit.approve')) {
      throw new Error('ไม่มีสิทธิ์ในการอนุมัติ/ดำเนินการ');
    }

    const geographic = getCurrentGeographicContext();

    const result = await progressStepWithAuditTrail({
      firestore,
      collection,
      documentId,
      documentType,
      newStep,
      action,
      user,
      geographic,
      notes,
      additionalData
    });

    // Refresh audit data after step progression
    await loadAuditData();

    return result;
  }, [documentId, documentType, firestore, user, hasPermission, getCurrentGeographicContext, loadAuditData]);

  /**
   * Add custom audit trail entry
   */
  const addAuditEntry = useCallback(async ({
    action,
    step = null,
    notes = null,
    metadata = {}
  }) => {
    if (!hasPermission('audit.create')) {
      throw new Error('ไม่มีสิทธิ์ในการสร้าง audit trail');
    }

    const geographic = getCurrentGeographicContext();

    const auditEntry = addAuditTrail({
      documentId,
      documentType,
      action,
      step,
      user,
      geographic,
      notes,
      metadata
    });

    const auditId = await saveAuditTrail(firestore, auditEntry);
    
    // Refresh audit data
    await loadAuditData();

    return auditId;
  }, [documentId, documentType, user, hasPermission, getCurrentGeographicContext, firestore, loadAuditData]);

  /**
   * Add custom change history entry
   */
  const addChangeEntry = useCallback(async ({
    type,
    notes = null,
    oldData = {},
    newData = {},
    customChanges = null
  }) => {
    if (!hasPermission('audit.create')) {
      throw new Error('ไม่มีสิทธิ์ในการสร้าง change history');
    }

    const geographic = getCurrentGeographicContext();

    const changeEntry = addChangeHistory({
      documentId,
      documentType,
      type,
      user,
      geographic,
      oldData,
      newData,
      notes,
      customChanges
    });

    const changeId = await saveChangeHistory(firestore, changeEntry);
    
    // Refresh audit data
    await loadAuditData();

    return changeId;
  }, [documentId, documentType, user, hasPermission, getCurrentGeographicContext, firestore, loadAuditData]);

  /**
   * Get formatted audit trail for stepper component
   */
  const getFormattedAuditTrail = useCallback(() => {
    return auditTrail.map(entry => ({
      ...entry,
      formattedTimestamp: new Date(entry.timestamp).toLocaleString('th-TH'),
      isCurrentUser: entry.actionBy === user?.uid
    }));
  }, [auditTrail, user]);

  /**
   * Get formatted change history for timeline component
   */
  const getFormattedChangeHistory = useCallback(() => {
    return changeHistory.map(entry => ({
      ...entry,
      formattedTimestamp: new Date(entry.timestamp).toLocaleString('th-TH'),
      isCurrentUser: entry.changedBy === user?.uid
    }));
  }, [changeHistory, user]);

  /**
   * Check if user can view audit details
   */
  const canViewAuditDetails = useCallback(() => {
    return hasPermission('audit.view');
  }, [hasPermission]);

  /**
   * Check if user can edit/create audit entries
   */
  const canCreateAuditEntries = useCallback(() => {
    return hasPermission('audit.create');
  }, [hasPermission]);

  // Load audit data when document ID changes
  useEffect(() => {
    if (documentId) {
      loadAuditData();
    }
  }, [documentId, loadAuditData]);

  return {
    // Data
    auditTrail,
    changeHistory,
    loading,
    error,

    // Actions
    loadAuditData,
    saveWithAuditTrail,
    progressStep,
    addAuditEntry,
    addChangeEntry,

    // Formatted data
    getFormattedAuditTrail,
    getFormattedChangeHistory,

    // Permissions
    canViewAuditDetails,
    canCreateAuditEntries,

    // Refresh function
    refresh: loadAuditData
  };
};

export default useAuditTrail; 