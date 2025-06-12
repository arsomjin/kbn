/**
 * Standardized Data Operations Hook
 * Provides consistent fetch/submit operations with automatic provinceId injection
 * Works with LayoutWithRBAC for geographic context
 */

import { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase';
import { usePermissions } from './usePermissions';

export const useDataOperations = (geographic = null) => {
  const { firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { hasPermission } = usePermissions();

  // Enhanced data submission with automatic provinceId injection
  const submitData = useCallback(async ({
    collection,
    docId,
    data,
    isEdit = false,
    auditTrail = null
  }) => {
    let enhancedData = { ...data };

    // Use geographic context if available (from LayoutWithRBAC)
    if (geographic?.enhanceDataForSubmission) {
      enhancedData = geographic.enhanceDataForSubmission(enhancedData);
    } else {
      // Fallback: manual injection
      const currentProvince = geographic?.getCurrentProvince?.();
      const defaultBranch = user.homeBranch || (user?.allowedBranches?.[0]);
      
      enhancedData = {
        ...enhancedData,
        branchCode: enhancedData.branchCode || defaultBranch,
        provinceId: enhancedData.provinceId || currentProvince,
        recordedProvince: currentProvince,
        recordedBranch: enhancedData.branchCode || defaultBranch,
        recordedAt: enhancedData.recordedAt || Date.now()
      };
    }

    // Add creation/edit metadata
    if (isEdit) {
      enhancedData.updatedAt = Date.now();
      enhancedData.updatedBy = user.uid;
    } else {
      enhancedData.createdAt = enhancedData.createdAt || Date.now();
      enhancedData.createdBy = enhancedData.createdBy || user.uid;
    }

    // Submit with or without audit trail
    if (auditTrail?.saveWithAuditTrail) {
      return await auditTrail.saveWithAuditTrail({
        collection,
        data: enhancedData,
        isEdit,
        oldData: isEdit ? data : null
      });
    } else {
      const docRef = firestore.collection(collection).doc(docId);
      if (isEdit) {
        return await docRef.update(enhancedData);
      } else {
        return await docRef.set(enhancedData);
      }
    }
  }, [geographic, firestore, user]);

  // Enhanced data fetching with automatic filtering
  const fetchData = useCallback(async ({
    collection,
    filters = {},
    orderBy = null,
    limit = null
  }) => {
    let query = firestore.collection(collection);

    // Add geographic filters if available
    if (geographic?.getQueryFilters) {
      const geoFilters = geographic.getQueryFilters();
      Object.entries(geoFilters).forEach(([field, value]) => {
        if (value) {
          query = query.where(field, '==', value);
        }
      });
    }

    // Add custom filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== null && value !== undefined) {
        query = query.where(field, '==', value);
      }
    });

    // Add ordering
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction || 'desc');
    }

    // Add limit
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    let data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply geographic filtering if available
    if (geographic?.filterFetchedData) {
      data = geographic.filterFetchedData(data);
    }

    return data;
  }, [geographic, firestore]);

  // Batch operations for related documents
  const submitBatchData = useCallback(async ({
    operations,
    auditTrail = null
  }) => {
    const batch = firestore.batch();
    const enhancedOperations = [];

    operations.forEach(({ collection, docId, data, operation = 'set' }) => {
      let enhancedData = { ...data };

      // Apply geographic enhancement
      if (geographic?.enhanceDataForSubmission) {
        enhancedData = geographic.enhanceDataForSubmission(enhancedData);
      }

      const docRef = firestore.collection(collection).doc(docId);
      
      switch (operation) {
        case 'set':
          batch.set(docRef, enhancedData);
          break;
        case 'update':
          batch.update(docRef, enhancedData);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }

      enhancedOperations.push({
        collection,
        docId,
        data: enhancedData,
        operation
      });
    });

    return await batch.commit();
  }, [geographic, firestore]);

  return {
    submitData,
    fetchData,
    submitBatchData,
    
    // Helper functions
    enhanceForSubmission: (data) => 
      geographic?.enhanceDataForSubmission?.(data) || data,
    
    getQueryFilters: () => 
      geographic?.getQueryFilters?.() || {},
    
    filterByAccess: (dataArray, getLocationFn) => 
      geographic?.filterFetchedData?.(dataArray, getLocationFn) || dataArray,

    // Permission checks
    canSubmit: (requiredPermission) => hasPermission(requiredPermission),
    canEdit: (requiredPermission) => hasPermission(requiredPermission),
    canView: (requiredPermission) => hasPermission(requiredPermission),
    
    // Access validation
    canAccessBranch: (branchCode) => geographic?.checkBranchAccess?.(branchCode) || false
  };
}; 