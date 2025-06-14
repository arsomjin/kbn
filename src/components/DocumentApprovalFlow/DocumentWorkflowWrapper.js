/**
 * Document Workflow Wrapper
 * 
 * A high-level wrapper that integrates DocumentApprovalFlow with LayoutWithRBAC
 * to provide a complete document workflow solution. This component handles:
 * - Document state management
 * - Approval flow integration
 * - Audit trail coordination
 * - Step progression
 * - Status synchronization
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';

import LayoutWithRBAC from '../layout/LayoutWithRBAC';
import DocumentApprovalFlow, { DOCUMENT_APPROVAL_CONFIGS } from './DocumentApprovalFlow';
import { useAuditTrail } from '../../hooks/useAuditTrail';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Document Workflow Wrapper Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components (the actual document form/content)
 * @param {string} props.documentId - Document ID
 * @param {string} props.documentType - Document type (invoice, sales_order, etc.)
 * @param {Object} props.documentData - Current document data
 * @param {Function} props.onDocumentSave - Document save callback
 * @param {Function} props.onDocumentLoad - Document load callback
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string} props.permission - Base permission for the document
 * @param {boolean} props.showApprovalFlow - Show approval flow component
 * @param {boolean} props.showStepper - Show stepper in layout
 * @param {boolean} props.showAuditTrail - Show audit trail
 * @param {Object} props.customApprovalConfig - Custom approval configuration
 * @param {Function} props.onStatusChange - Status change callback
 * @param {Function} props.onStepChange - Step change callback
 * @param {Object} props.layoutProps - Additional props for LayoutWithRBAC
 */
const DocumentWorkflowWrapper = ({
  children,
  documentId,
  documentType = 'generic',
  documentData = {},
  onDocumentSave,
  onDocumentLoad,
  title,
  subtitle,
  permission,
  showApprovalFlow = true,
  showStepper = true,
  showAuditTrail = true,
  customApprovalConfig = null,
  onStatusChange,
  onStepChange,
  layoutProps = {},
  ...otherProps
}) => {
  // State management
  const [currentStatus, setCurrentStatus] = useState(documentData.status || 'draft');
  const [currentStep, setCurrentStep] = useState(documentData.currentStep || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [documentState, setDocumentState] = useState(documentData);

  // Hooks
  const { hasPermission } = usePermissions();
  const auditTrail = useAuditTrail({
    documentType,
    documentId,
    collection: `${documentType}s`,
    enabled: !!documentId
  });

  // Get approval configuration
  const approvalConfig = useMemo(() => {
    return customApprovalConfig || DOCUMENT_APPROVAL_CONFIGS[documentType] || DOCUMENT_APPROVAL_CONFIGS.generic;
  }, [documentType, customApprovalConfig]);

  // Auto-detect permission if not provided
  const effectivePermission = useMemo(() => {
    if (permission) return permission;
    return `${approvalConfig.department}.view`;
  }, [permission, approvalConfig.department]);

  // Auto-detect edit permission
  const editPermission = useMemo(() => {
    return `${approvalConfig.department}.edit`;
  }, [approvalConfig.department]);

  // Generate steps for stepper
  const steps = useMemo(() => {
    return approvalConfig.steps.map(step => ({
      title: step.title,
      description: approvalConfig.statusLabels[step.status] || step.status
    }));
  }, [approvalConfig]);

  // Sync document data changes
  useEffect(() => {
    if (documentData.status !== currentStatus) {
      setCurrentStatus(documentData.status || 'draft');
    }
    if (documentData.currentStep !== currentStep) {
      setCurrentStep(documentData.currentStep || 0);
    }
    setDocumentState(documentData);
  }, [documentData, currentStatus, currentStep]);

  // Load document on mount
  useEffect(() => {
    if (documentId && onDocumentLoad) {
      setIsLoading(true);
      onDocumentLoad(documentId)
        .then((data) => {
          if (data) {
            setDocumentState(data);
            setCurrentStatus(data.status || 'draft');
            setCurrentStep(data.currentStep || 0);
          }
        })
        .catch((error) => {
          console.error('Failed to load document:', error);
          message.error('ไม่สามารถโหลดเอกสารได้');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [documentId, onDocumentLoad]);

  // Handle status changes
  const handleStatusChange = useCallback(async (newStatus, additionalData = {}) => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...documentState,
        status: newStatus,
        lastModifiedAt: Date.now(),
        ...additionalData
      };

      // Save document with new status
      if (onDocumentSave) {
        await onDocumentSave(updatedData);
      }

      // Update local state
      setCurrentStatus(newStatus);
      setDocumentState(updatedData);

      // Call parent callback
      if (onStatusChange) {
        await onStatusChange(newStatus, updatedData);
      }

      message.success('อัปเดตสถานะเรียบร้อย');
      
    } catch (error) {
      console.error('Status change failed:', error);
      message.error('ไม่สามารถอัปเดตสถานะได้');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [documentState, onDocumentSave, onStatusChange]);

  // Handle step changes
  const handleStepChange = useCallback(async (newStep, additionalData = {}) => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...documentState,
        currentStep: newStep,
        lastModifiedAt: Date.now(),
        ...additionalData
      };

      // Save document with new step
      if (onDocumentSave) {
        await onDocumentSave(updatedData);
      }

      // Update local state
      setCurrentStep(newStep);
      setDocumentState(updatedData);

      // Call parent callback
      if (onStepChange) {
        await onStepChange(newStep, updatedData);
      }

      message.success('ไปยังขั้นตอนถัดไปเรียบร้อย');
      
    } catch (error) {
      console.error('Step change failed:', error);
      message.error('ไม่สามารถเปลี่ยนขั้นตอนได้');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [documentState, onDocumentSave, onStepChange]);

  // Handle approval
  const handleApprove = useCallback(async (approvalData) => {
    try {
      await handleStatusChange(approvalData.status, approvalData);
      if (approvalData.step !== undefined) {
        await handleStepChange(approvalData.step, approvalData);
      }
      message.success('อนุมัติเอกสารเรียบร้อย');
    } catch (error) {
      console.error('Approval failed:', error);
      message.error('ไม่สามารถอนุมัติเอกสารได้');
    }
  }, [handleStatusChange, handleStepChange]);

  // Handle rejection
  const handleReject = useCallback(async (rejectionData) => {
    try {
      await handleStatusChange('rejected', rejectionData);
      message.success('ปฏิเสธเอกสารเรียบร้อย');
    } catch (error) {
      console.error('Rejection failed:', error);
      message.error('ไม่สามารถปฏิเสธเอกสารได้');
    }
  }, [handleStatusChange]);

  // Handle submit for review
  const handleSubmit = useCallback(async (submitData) => {
    try {
      await handleStatusChange(submitData.status, submitData);
      if (submitData.step !== undefined) {
        await handleStepChange(submitData.step, submitData);
      }
      message.success('ส่งเอกสารเพื่อตรวจสอบเรียบร้อย');
    } catch (error) {
      console.error('Submit failed:', error);
      message.error('ไม่สามารถส่งเอกสารได้');
    }
  }, [handleStatusChange, handleStepChange]);

  // Handle step click in stepper
  const handleStepClick = useCallback((stepIndex) => {
    // Only allow going to previous steps or current step
    if (stepIndex <= currentStep) {
      handleStepChange(stepIndex);
    }
  }, [currentStep, handleStepChange]);

  // Enhanced children with document workflow context
  const enhancedChildren = useMemo(() => {
    if (!children) return null;

    return React.cloneElement(children, {
      ...children.props,
      // Document context
      documentId,
      documentType,
      documentData: documentState,
      currentStatus,
      currentStep,
      
      // Workflow functions
      onSave: onDocumentSave,
      onStatusChange: handleStatusChange,
      onStepChange: handleStepChange,
      onApprove: handleApprove,
      onReject: handleReject,
      onSubmit: handleSubmit,
      
      // Audit trail integration
      auditTrail,
      
      // Permission helpers
      permissions: {
        canView: hasPermission(effectivePermission),
        canEdit: hasPermission(editPermission),
        canApprove: hasPermission(`${approvalConfig.department}.approve`),
        canReview: hasPermission(`${approvalConfig.department}.review`)
      },
      
      // Configuration
      approvalConfig,
      
      // State
      isLoading
    });
  }, [
    children,
    documentId,
    documentType,
    documentState,
    currentStatus,
    currentStep,
    onDocumentSave,
    handleStatusChange,
    handleStepChange,
    handleApprove,
    handleReject,
    handleSubmit,
    auditTrail,
    hasPermission,
    effectivePermission,
    editPermission,
    approvalConfig,
    isLoading
  ]);

  return (
    <LayoutWithRBAC
      title={title || `จัดการ${approvalConfig.statusLabels[currentStatus] || 'เอกสาร'}`}
      subtitle={subtitle || documentType}
      permission={effectivePermission}
      editPermission={editPermission}
      loading={isLoading}
      
      // Document workflow integration
      documentId={documentId}
      documentType={documentType}
      showAuditTrail={showAuditTrail}
      showAuditSection={showApprovalFlow}
      onAuditApprove={handleApprove}
      
      // Stepper integration
      showStepper={showStepper}
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      
      // Additional layout props
      {...layoutProps}
      {...otherProps}
    >
      {/* Document content */}
      {enhancedChildren}
      
      {/* Approval flow component */}
      {showApprovalFlow && documentId && (
        <DocumentApprovalFlow
          documentId={documentId}
          documentType={documentType}
          currentStatus={currentStatus}
          currentStep={currentStep}
          documentData={documentState}
          onStatusChange={handleStatusChange}
          onStepChange={handleStepChange}
          onApprove={handleApprove}
          onReject={handleReject}
          onSubmit={handleSubmit}
          customConfig={customApprovalConfig}
          style={{ marginTop: '24px' }}
        />
      )}
    </LayoutWithRBAC>
  );
};

DocumentWorkflowWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  documentId: PropTypes.string.isRequired,
  documentType: PropTypes.string,
  documentData: PropTypes.object,
  onDocumentSave: PropTypes.func,
  onDocumentLoad: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  permission: PropTypes.string,
  showApprovalFlow: PropTypes.bool,
  showStepper: PropTypes.bool,
  showAuditTrail: PropTypes.bool,
  customApprovalConfig: PropTypes.object,
  onStatusChange: PropTypes.func,
  onStepChange: PropTypes.func,
  layoutProps: PropTypes.object
};

export default DocumentWorkflowWrapper; 