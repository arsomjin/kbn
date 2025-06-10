/**
 * Account Layout with RBAC Integration - MINIMAL VERSION FOR DEBUGGING
 * Temporarily simplified to isolate import issues
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Alert, Skeleton, Typography } from 'antd';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { usePermissions } from 'hooks/usePermissions';
import { useGeographicData } from 'hooks/useGeographicData';
import PermissionGate from '../PermissionGate';
import GeographicBranchSelector from '../GeographicBranchSelector';
import { AuditHistory, AuditTrailSection, useAuditTrail as useBaseAuditTrail } from 'components/AuditTrail';

const { Title } = Typography;

// Step 3: Adding more props and complex logic
const LayoutWithRBAC = ({ 
  children,
  permission = 'accounting.view',
  editPermission = 'accounting.edit',
  title = 'การเงินและบัญชี', 
  subtitle = 'Management',
  loading = false,
  requireBranchSelection = true,
  onBranchChange,
  // Audit Trail & Document Workflow Props
  documentId = null,
  documentType = null,
  showAuditTrail = false,
  showAuditSection = false,
  onAuditApprove = null,
  // Stepper Integration Props
  steps = [],
  currentStep = 0,
  onStepClick = null,
  showStepper = false,
  // Data operation configuration
  autoInjectProvinceId = true,
  dataCollection = null,
  ...props
}) => {
    const { branches } = useSelector(state => state.data);
    const { hasPermission, accessibleBranches, getDefaultBranch } = usePermissions();
    const { checkBranchAccess, getCurrentProvince } = useGeographicData();
    
    const [selectedBranch, setSelectedBranch] = useState(null);
    
    // Initialize audit trail functionality (always call hook, but conditionally enable)
    const auditTrailHook = useBaseAuditTrail({
        documentId: documentId || 'default',
        documentType: documentType || 'general',
        permission,
        enabled: showAuditTrail && !!documentId
    });

    // Enhanced geographic data provider
    const enhancedGeographic = useCallback(() => {
        const currentProvince = getCurrentProvince();
        const branchData = branches[selectedBranch];
        
        return {
            selectedBranch,
            currentProvince: currentProvince?.provinceId || null,
            provinceName: currentProvince?.provinceName || '',
            branchName: branchData?.branchName || selectedBranch || '',
            branchCode: selectedBranch,
            provinceId: branchData?.provinceId,
            recordedProvince: currentProvince,
            recordedBranch: selectedBranch,
            // Auto-inject geographic identifiers for data operations
            ...(autoInjectProvinceId && currentProvince?.provinceId ? {
                provinceId: currentProvince.provinceId,
                branchCode: selectedBranch
            } : {}),
            // Enhanced data operations
            getSubmissionData: () => ({
                branchCode: selectedBranch,
                provinceId: branchData?.provinceId,
                recordedProvince: currentProvince,
                recordedBranch: selectedBranch,
                recordedAt: Date.now()
            })
        };
    }, [selectedBranch, branches, checkBranchAccess, getCurrentProvince, autoInjectProvinceId]);
    
    // Initialize branch selection
    useEffect(() => {
        if (!selectedBranch) {
            const defaultBranch = getDefaultBranch();
            if (defaultBranch) {
                setSelectedBranch(defaultBranch);
            } else if (accessibleBranches.length > 0) {
                const fallbackBranch = accessibleBranches[0].branchCode || accessibleBranches[0].key;
                setSelectedBranch(fallbackBranch);
            }
        }
    }, [selectedBranch, getDefaultBranch, accessibleBranches]);

    // Notify parent component of branch changes
    useEffect(() => {
        if (onBranchChange && selectedBranch) {
            const geoContext = enhancedGeographic();
            onBranchChange(geoContext);
        }
    }, [selectedBranch, enhancedGeographic, onBranchChange]);

    // Check if user can access the current data
    const canAccessCurrentData = selectedBranch ? checkBranchAccess(selectedBranch) : true;
    
    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0 }}>
                        {title}
                    </Title>
                    <Typography.Text type="secondary">{subtitle}</Typography.Text>
                </div>
                <Skeleton active paragraph={{ rows: 8 }} />
            </div>
        );
    }

    // Show branch selector when needed
    const showBranchSelector = requireBranchSelection && accessibleBranches.length > 1;

    return (
        <PermissionGate permission={permission}>
            <div>
                {/* Geographic Branch Selector */}
                {showBranchSelector && (
                    <Row style={{ marginBottom: '16px' }}>
                        <Col span={24}>
                            <Card>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <Typography.Text strong>เลือกสาขาที่บันทึกข้อมูล:</Typography.Text>
                                        </div>
                                        <GeographicBranchSelector
                                            value={selectedBranch}
                                            onChange={setSelectedBranch}
                                            placeholder="เลือกสาขา"
                                            respectRBAC={true}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ display: 'flex', alignItems: 'end' }}>
                                        {selectedBranch && (
                                            <Alert
                                                message={`กำลังบันทึกข้อมูลสำหรับ: ${branches[selectedBranch]?.branchName || selectedBranch}`}
                                                type="info"
                                                size="small"
                                                showIcon
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Access Control Warning */}
                {requireBranchSelection && !canAccessCurrentData && (
                    <Row style={{ marginBottom: '16px' }}>
                        <Col span={24}>
                            <Alert
                                message="ไม่มีสิทธิ์เข้าถึงสาขานี้"
                                description="คุณไม่สามารถดำเนินการกับข้อมูลของสาขานี้ได้ กรุณาเลือกสาขาที่คุณมีสิทธิ์เข้าถึง"
                                type="warning"
                                showIcon
                            />
                        </Col>
                    </Row>
                )}

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {(!requireBranchSelection || selectedBranch) && (
                        React.isValidElement(children) 
                            ? React.cloneElement(children, {
                                selectedBranch,
                                canEditData: hasPermission(editPermission) && canAccessCurrentData,
                                geographic: enhancedGeographic(),
                                // Pass audit trail functionality to children
                                auditTrail: showAuditTrail ? auditTrailHook : null,
                                // Pass stepper information
                                stepperInfo: showStepper ? { steps, currentStep, onStepClick } : null
                            })
                            : children
                    )}

                    {/* Show message when branch selection is required but none selected */}
                    {requireBranchSelection && !selectedBranch && (
                        <Row>
                            <Col span={24}>
                                <Alert
                                    message="กรุณาเลือกสาขา"
                                    description="เลือกสาขาที่ต้องการบันทึกข้อมูลจากรายการด้านบน"
                                    type="info"
                                    showIcon
                                />
                            </Col>
                        </Row>
                    )}
                </div>
            </div>
        </PermissionGate>
    );
};

LayoutWithRBAC.propTypes = {
    children: PropTypes.node.isRequired,
    permission: PropTypes.string,
    editPermission: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    loading: PropTypes.bool,
    requireBranchSelection: PropTypes.bool,
    onBranchChange: PropTypes.func,
    // Audit Trail & Document Workflow Props
    documentId: PropTypes.string,
    documentType: PropTypes.string,
    showAuditTrail: PropTypes.bool,
    showAuditSection: PropTypes.bool,
    onAuditApprove: PropTypes.func,
    // Stepper Integration Props
    steps: PropTypes.array,
    currentStep: PropTypes.number,
    onStepClick: PropTypes.func,
    showStepper: PropTypes.bool,
    // Data operation configuration
    autoInjectProvinceId: PropTypes.bool,
    dataCollection: PropTypes.string
};

export default LayoutWithRBAC; 