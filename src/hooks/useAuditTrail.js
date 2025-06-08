/**
 * Audit Trail Hook for KBN System
 * Designed for easy integration into 80+ components
 * Includes RBAC, geographic filtering, and complete workflow support
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from './usePermissions';
import { useGeographicData } from './useGeographicData';
import { useAuditTrail as useBaseAuditTrail } from 'components/AuditTrail';
import dayjs from 'dayjs';

/**
 * One-line integration audit trail hook
 * 
 * Usage Examples:
 * 
 * // Simple integration:
 * const audit = useAuditTrail('income_daily', documentId);
 * 
 * // With stepper integration:
 * const audit = useAuditTrail('income_daily', documentId, {
 *   steps: INCOME_STEPS,
 *   currentStep: activeStep
 * });
 * 
 * // With custom collection:
 * const audit = useAuditTrail('service_order', documentId, {
 *   collection: 'sections/service/orders'
 * });
 */
export const useAuditTrail = (
  documentType,
  documentId = null,
  options = {}
) => {
  const {
    // Collection path for Firestore
    collection = `sections/account/${documentType}s`,
    
    // Stepper integration
    steps = [],
    currentStep = 0,
    onStepChange = null,
    
    // Display options
    showGeographicInfo = true,
    showChangeDetails = true,
    excludeFields = ['updatedAt', 'modifiedAt', 'timestamp', 'lastModified'],
    
    // Auto-save options
    autoSave = true,
    saveOnMount = false,
    
    // Permission mapping
    departmentPermissions = null, // Auto-detect from documentType
    
    // Custom configuration
    customConfig = {}
  } = options;

  // Core hooks
  const { user } = useSelector(state => state.auth);
  const { hasPermission } = usePermissions();
  const { getCurrentProvince, getCurrentBranch, getGeographicContext } = useGeographicData();
  
  // Auto-detect department from documentType
  const department = useMemo(() => {
    if (departmentPermissions) return departmentPermissions;
    
    const typeMapping = {
      'income_daily': 'accounting',
      'income_vehicle': 'accounting', 
      'income_service': 'accounting',
      'expense_daily': 'accounting',
      'service_order': 'service',
      'service_close': 'service',
      'parts_order': 'sales',
      'vehicle_sales': 'sales',
      'inventory_import': 'inventory',
      'inventory_export': 'inventory',
      'hr_attendance': 'hr',
      'hr_payroll': 'hr'
    };
    
    return typeMapping[documentType] || 'general';
  }, [documentType, departmentPermissions]);

  // Initialize base audit trail
  const baseAuditTrail = useBaseAuditTrail({
    documentId: documentId,
    documentType: documentType,
    config: {
      showGeographicInfo,
      showChangeDetails,
      excludeFields,
      ...customConfig
    }
  });

  // Enhanced state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [errors, setErrors] = useState([]);

  // Permission helpers
  const permissions = useMemo(() => ({
    canView: hasPermission(`${department}.view`),
    canEdit: hasPermission(`${department}.edit`),
    canReview: hasPermission(`${department}.review`),
    canApprove: hasPermission(`${department}.approve`),
    canDelete: hasPermission(`${department}.delete`),
    canViewAuditDetails: hasPermission(`${department}.audit`) || hasPermission(`${department}.approve`),
    canViewAllAudits: hasPermission('audit.view_all') || hasPermission('super_admin.all')
  }), [department, hasPermission]);

  // Geographic context
  const geoContext = useMemo(() => getGeographicContext(), [getGeographicContext]);

  // Enhanced save function with comprehensive audit trail
  const saveWithCompleteAudit = useCallback(async ({
    data,
    isEdit = false,
    oldData = null,
    notes = '',
    status = null,
    stepAdvancement = null, // { from: stepIndex, to: stepIndex }
    customMetadata = {}
  }) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      // Prepare enhanced data with geographic and user context
      const enhancedData = {
        ...data,
        // Geographic context
        provinceId: geoContext.provinceId,
        branchCode: geoContext.branchCode,
        recordedProvince: geoContext.provinceName,
        recordedBranch: geoContext.branchName,
        
        // User context
        [isEdit ? 'lastModifiedBy' : 'createdBy']: user.uid,
        [isEdit ? 'lastModified' : 'created']: dayjs().valueOf(),
        
        // Document context
        documentType: documentType,
        
        // Custom metadata
        ...customMetadata
      };

      // Status update if provided
      if (status) {
        enhancedData.status = status;
      }

      // Call base audit trail save
      const result = await baseAuditTrail.saveWithAuditTrail({
        collection,
        data: enhancedData,
        isEdit,
        oldData,
        notes: notes || (isEdit ? `แก้ไข${documentType}` : `สร้าง${documentType}`)
      });

      // Step advancement tracking
      if (stepAdvancement && steps.length > 0) {
        await baseAuditTrail.addStatusEntry(
          documentId,
          `step_${stepAdvancement.to}`,
          {
            uid: user.uid,
            displayName: user.displayName || user.email,
            role: user.role,
            department: user.department,
            provinceName: geoContext.provinceName,
            branchName: geoContext.branchName
          },
          `ก้าวไปยังขั้นตอน: ${steps[stepAdvancement.to]?.title || stepAdvancement.to + 1}`
        );

        // Notify parent of step change
        if (onStepChange) {
          onStepChange(stepAdvancement.to);
        }
      }

      setLastSaveTime(dayjs().valueOf());
      return result;

    } catch (error) {
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการบันทึก';
      setErrors(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [
    baseAuditTrail, collection, documentType, documentId, user, geoContext, 
    steps, onStepChange
  ]);

  // Quick status update
  const updateStatus = useCallback(async (newStatus, comment = '') => {
    return await saveWithCompleteAudit({
      data: { status: newStatus },
      isEdit: true,
      notes: comment || `เปลี่ยนสถานะเป็น: ${newStatus}`,
      status: newStatus
    });
  }, [saveWithCompleteAudit]);

  // Step progression
  const advanceStep = useCallback(async (targetStep, comment = '') => {
    if (targetStep >= 0 && targetStep < steps.length && targetStep > currentStep) {
      return await saveWithCompleteAudit({
        data: { activeStep: targetStep },
        isEdit: true,
        stepAdvancement: { from: currentStep, to: targetStep },
        notes: comment || `ไปยังขั้นตอน: ${steps[targetStep]?.title || targetStep + 1}`
      });
    }
  }, [saveWithCompleteAudit, steps, currentStep]);

  // Approval workflow
  const approveDocument = useCallback(async (comment = '') => {
    return await saveWithCompleteAudit({
      data: { 
        status: 'approved',
        approvedBy: user.uid,
        approvedAt: dayjs().valueOf()
      },
      isEdit: true,
      notes: comment || 'อนุมัติเอกสาร',
      status: 'approved'
    });
  }, [saveWithCompleteAudit, user.uid]);

  // Rejection workflow  
  const rejectDocument = useCallback(async (reason = '') => {
    return await saveWithCompleteAudit({
      data: { 
        status: 'rejected',
        rejectedBy: user.uid,
        rejectedAt: dayjs().valueOf(),
        rejectionReason: reason
      },
      isEdit: true,
      notes: `ปฏิเสธเอกสาร: ${reason}`,
      status: 'rejected'
    });
  }, [saveWithCompleteAudit, user.uid]);

  // Auto-save on mount if enabled
  useEffect(() => {
    if (saveOnMount && documentId && autoSave) {
      saveWithCompleteAudit({
        data: { lastViewed: dayjs().valueOf() },
        isEdit: true,
        notes: 'เปิดดูเอกสาร'
      }).catch(console.error);
    }
  }, [saveOnMount, documentId, autoSave, saveWithCompleteAudit]);

  // Return comprehensive audit trail interface
  return {
    // Core audit trail data
    ...baseAuditTrail,
    
    // Enhanced functions
    saveWithCompleteAudit,
    updateStatus,
    advanceStep,
    approveDocument,
    rejectDocument,
    
    // Status information
    isProcessing,
    lastSaveTime,
    errors,
    clearErrors: () => setErrors([]),
    
    // Permission helpers
    permissions,
    
    // Geographic context
    geoContext,
    
    // Configuration
    config: {
      documentType,
      collection,
      department,
      steps,
      currentStep,
      showGeographicInfo,
      showChangeDetails
    },
    
    // Helper functions for UI integration
    getStatusColor: (status) => {
      const statusColors = {
        'pending': '#faad14',
        'in_progress': '#1890ff', 
        'completed': '#52c41a',
        'approved': '#52c41a',
        'rejected': '#ff4d4f',
        'cancelled': '#d9d9d9'
      };
      return statusColors[status] || '#d9d9d9';
    },
    
    getStepStatus: (stepIndex) => {
      if (stepIndex < currentStep) return 'completed';
      if (stepIndex === currentStep) return 'current';
      return 'pending';
    },

    // Quick integration props for LayoutWithRBAC
    getLayoutProps: () => ({
      documentId,
      documentType,
      showAuditTrail: true,
      showStepper: steps.length > 0,
      steps,
      currentStep,
      onAuditApprove: permissions.canApprove ? approveDocument : null
    })
  };
};

export default useAuditTrail; 