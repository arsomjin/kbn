/**
 * Audit Trail Wrapper Component
 * Provides one-line integration for any component needing audit trail
 */

import React from 'react';
import PropTypes from 'prop-types';
import LayoutWithRBAC from './layout/LayoutWithRBAC';
import { useAuditTrail } from '../hooks/useAuditTrail';

/**
 * One-line integration wrapper for audit trail
 * 
 * Usage:
 * <AuditTrailWrapper
 *   documentType="income_daily"
 *   documentId={orderId}
 *   title="รับเงินประจำวัน"
 *   permission="accounting.view"
 *   steps={INCOME_STEPS}
 *   currentStep={activeStep}
 * >
 *   <YourComponent />
 * </AuditTrailWrapper>
 */
const AuditTrailWrapper = ({
  children,
  // Document properties
  documentType,
  documentId = null,
  collection = null,
  
  // Layout properties
  title = 'Document Management',
  subtitle = 'Management',
  permission = 'general.view',
  editPermission = null,
  
  // Geographic properties
  requireBranchSelection = true,
  onBranchChange = null,
  
  // Stepper properties
  steps = [],
  currentStep = 0,
  onStepClick = null,
  
  // Audit trail properties
  showAuditTrail = true,
  showAuditSection = false,
  showStepper = null, // Auto-detect from steps
  
  // Additional options
  auditOptions = {},
  loading = false,
  
  ...otherProps
}) => {
  // Auto-detect edit permission
  const finalEditPermission = editPermission || permission.replace('.view', '.edit');
  
  // Auto-detect if stepper should be shown
  const finalShowStepper = showStepper !== null ? showStepper : steps.length > 0;
  
  // Initialize audit trail
  const auditTrail = useAuditTrail(documentType, documentId, {
    collection,
    steps,
    currentStep,
    onStepChange: onStepClick,
    ...auditOptions
  });

  // Enhanced children with audit trail functionality
  const enhancedChildren = React.cloneElement(children, {
    ...children.props,
    // Pass audit trail functionality
    audit: auditTrail,
    robustAudit: auditTrail, // Alternative name
    
    // Permission helpers
    permissions: auditTrail.permissions,
    
    // Geographic context
    geoContext: auditTrail.geoContext,
    
    // Quick save functions
    saveWithAudit: auditTrail.saveWithCompleteAudit,
    updateStatus: auditTrail.updateStatus,
    advanceStep: auditTrail.advanceStep,
    approveDocument: auditTrail.approveDocument,
    rejectDocument: auditTrail.rejectDocument,
    
    // Status helpers
    isProcessing: auditTrail.isProcessing,
    getStatusColor: auditTrail.getStatusColor,
    getStepStatus: auditTrail.getStepStatus
  });

  return (
    <LayoutWithRBAC
      title={title}
      subtitle={subtitle}
      permission={permission}
      editPermission={finalEditPermission}
      requireBranchSelection={requireBranchSelection}
      onBranchChange={onBranchChange}
      loading={loading}
      
      // Audit trail integration
      documentId={documentId}
      documentType={documentType}
      showAuditTrail={showAuditTrail}
      showAuditSection={showAuditSection}
      onAuditApprove={auditTrail.permissions.canApprove ? auditTrail.approveDocument : null}
      
      // Stepper integration
      showStepper={finalShowStepper}
      steps={steps}
      currentStep={currentStep}
      onStepClick={onStepClick}
      
      {...otherProps}
    >
      {enhancedChildren}
    </LayoutWithRBAC>
  );
};

AuditTrailWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  
  // Document properties
  documentType: PropTypes.string.isRequired,
  documentId: PropTypes.string,
  collection: PropTypes.string,
  
  // Layout properties
  title: PropTypes.string,
  subtitle: PropTypes.string,
  permission: PropTypes.string,
  editPermission: PropTypes.string,
  
  // Geographic properties
  requireBranchSelection: PropTypes.bool,
  onBranchChange: PropTypes.func,
  
  // Stepper properties
  steps: PropTypes.array,
  currentStep: PropTypes.number,
  onStepClick: PropTypes.func,
  
  // Audit trail properties
  showAuditTrail: PropTypes.bool,
  showAuditSection: PropTypes.bool,
  showStepper: PropTypes.bool,
  
  // Additional options
  auditOptions: PropTypes.object,
  loading: PropTypes.bool
};

export default AuditTrailWrapper; 