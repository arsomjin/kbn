/**
 * Account Layout with RBAC Integration
 * Provides geographic filtering, permission checks, and audit trail integration
 * for Account module pages with document workflow support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Alert, Skeleton, Typography } from 'antd';
import { PermissionGate, GeographicBranchSelector } from 'components';
import { AuditHistory, AuditTrailSection, useAuditTrail as useBaseAuditTrail } from 'components/AuditTrail';
import AuditTrailStepper from '../AuditTrailStepper';
import { usePermissions } from 'hooks/usePermissions';
import { useGeographicData } from 'hooks/useGeographicData';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const { Title } = Typography;

const LayoutWithRBAC = ({
  children,
  permission = 'accounting.view',
  editPermission = 'accounting.edit',
  title = 'การเงินและบัญชี',
  subtitle = 'Management',
  requireBranchSelection = true,
  onBranchChange,
  loading = false,
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
  dataCollection = null, // e.g., 'incomes', 'expenses', 'sales'
  ...props
}) => {
  const { branches } = useSelector(state => state.data);
  const { hasPermission, accessibleBranches, getDefaultBranch } = usePermissions();
  const { checkBranchAccess, getCurrentProvince } = useGeographicData();
  
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Initialize audit trail if document workflow is enabled
  const auditTrailHook = useBaseAuditTrail({
    documentId: showAuditTrail ? documentId : null,
    documentType: showAuditTrail ? documentType : null,
    config: {
      showGeographicInfo: true,
      showChangeDetails: true,
      excludeFields: ['updatedAt', 'modifiedAt', 'timestamp']
    }
  });

  // Initialize branch selection
  useEffect(() => {
    console.log('🔍 LayoutWithRBAC mount - checking branch initialization:', {
      selectedBranch,
      hasGetDefaultBranch: !!getDefaultBranch,
      requireBranchSelection,
      hasOnBranchChange: !!onBranchChange,
      accessibleBranchesCount: accessibleBranches.length,
      accessibleBranches: accessibleBranches.map(b => ({ branchCode: b.branchCode, branchName: b.branchName }))
    });
    
    if (!selectedBranch) {
      const defaultBranch = getDefaultBranch();
      console.log('🏗️ Setting default branch:', defaultBranch);
      console.log('📋 Available accessibleBranches:', accessibleBranches);
      
      if (defaultBranch) {
        setSelectedBranch(defaultBranch);
        console.log('🏗️ Setting default branch:', defaultBranch);
      } else if (accessibleBranches.length > 0) {
        // Fallback: Use first accessible branch if getDefaultBranch returns null
        const fallbackBranch = accessibleBranches[0].branchCode || accessibleBranches[0].key;
        console.log('🚨 getDefaultBranch returned null, using fallback:', fallbackBranch);
        setSelectedBranch(fallbackBranch);
      }
    }
  }, [selectedBranch, getDefaultBranch, accessibleBranches]);

  // Enhanced geographic context with data operation helpers
  const enhancedGeographic = useCallback(() => {
    const branchData = branches[selectedBranch];
    const currentProvince = getCurrentProvince();
    
    return {
      // Basic geographic info
      branchCode: selectedBranch,
      branchName: branchData?.branchName,
      provinceId: branchData?.provinceId,
      recordedProvince: currentProvince,
      recordedBranch: selectedBranch,
      
      // Enhanced data for submissions
      getSubmissionData: () => ({
        branchCode: selectedBranch,
        provinceId: branchData?.provinceId,
        recordedProvince: currentProvince,
        recordedBranch: selectedBranch,
        recordedAt: Date.now()
      }),
      
      // Query filters for fetching data
      getQueryFilters: () => ({
        branchCode: selectedBranch,
        provinceId: branchData?.provinceId,
        ...(autoInjectProvinceId && { provinceId: branchData?.provinceId })
      }),
      
      // Enhanced data operations
      enhanceDataForSubmission: (data) => ({
        ...data,
        ...(autoInjectProvinceId && {
          branchCode: selectedBranch,
          provinceId: branchData?.provinceId,
          recordedProvince: currentProvince,
          recordedBranch: selectedBranch,
          recordedAt: data.recordedAt || Date.now()
        })
      }),
      
      // Filter fetched data by geographic access
      filterFetchedData: (dataArray, getLocationFn) => {
        if (!Array.isArray(dataArray)) return dataArray;
        
        return dataArray.filter(item => {
          const location = getLocationFn ? getLocationFn(item) : {
            provinceId: item.provinceId,
            branchCode: item.branchCode
          };
          
          // Check if user can access this data based on their geographic permissions
          return checkBranchAccess(location.branchCode || selectedBranch);
        });
      }
    };
  }, [selectedBranch, branches, getCurrentProvince, autoInjectProvinceId, checkBranchAccess]);

  // Notify parent component of branch changes (consolidated)
  useEffect(() => {
    console.log('🔍 Geographic context effect trigger:', {
      hasOnBranchChange: !!onBranchChange,
      selectedBranch,
      hasEnhancedGeographic: !!enhancedGeographic,
      requireBranchSelection
    });
    
    if (onBranchChange && selectedBranch) {
      const geoContext = enhancedGeographic();
      console.log('🏗️ LayoutWithRBAC sending geographic context:', {
        branchCode: geoContext.branchCode,
        provinceId: geoContext.provinceId,
        requireBranchSelection,
        hasQueryFilters: !!geoContext.getQueryFilters,
        hasEnhancement: !!geoContext.enhanceDataForSubmission
      });
      onBranchChange(geoContext);
    }
  }, [selectedBranch, onBranchChange, enhancedGeographic, requireBranchSelection]);

  // Check if user can access the current data
  const canAccessCurrentData = selectedBranch ? checkBranchAccess(selectedBranch) : true;
  const showBranchSelector = requireBranchSelection && accessibleBranches.length > 1;

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

  return (
    <PermissionGate permission={permission} fallback={
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </div>
        <Alert
          message="ไม่มีสิทธิ์เข้าถึง"
          description={`คุณไม่มีสิทธิ์เข้าถึงหน้า ${title} กรุณาติดต่อผู้ดูแลระบบ`}
          type="error"
          showIcon
        />
      </div>
    }>
      <div >

        {/* Stepper Display */}
        {showStepper && steps.length > 0 && (
          <Row style={{ marginBottom: '8px', marginTop: '8px' }}>
            <Col span={24}>
              <AuditTrailStepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={onStepClick}
                auditInfo={auditTrailHook?.auditTrail}
                status="process"
                showFullByDefault={false}
                compactHeight="56px"
              />
            </Col>
          </Row>
        )}

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
        {(!requireBranchSelection || selectedBranch) && (
          React.cloneElement(children, {
            selectedBranch,
            canEditData: hasPermission(editPermission) && canAccessCurrentData,
            geographic: enhancedGeographic(),
            // Pass audit trail functionality to children
            auditTrail: showAuditTrail ? auditTrailHook : null,
            // Pass stepper information
            stepperInfo: showStepper ? { steps, currentStep, onStepClick } : null
          })
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

        {/* === AUDIT TRAIL SECTIONS (BOTTOM OF DOCUMENT) === */}
        
        {/* Audit Trail Section for Form Integration */}
        {showAuditSection && (
          <Row style={{ marginTop: '24px', marginBottom: '16px' }}>
            <Col span={24}>
              <Card title="ข้อมูลการตรวจสอบและอนุมัติ">
                <AuditTrailSection
                  canEditEditedBy={hasPermission(editPermission)}
                  canEditReviewedBy={hasPermission(`${permission.split('.')[0]}.review`)}
                  canEditApprovedBy={hasPermission(`${permission.split('.')[0]}.approve`)}
                  layout="horizontal"
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Audit History Display */}
        {showAuditTrail && (documentId || process.env.NODE_ENV === 'development') && (
          <Row style={{ marginTop: '24px', marginBottom: '16px' }}>
            <Col span={24}>
              <Card title="ประวัติการดำเนินการ">
                {(auditTrailHook.auditTrail.length > 0 || auditTrailHook.statusHistory.length > 0) ? (
                  <AuditHistory
                    auditTrail={auditTrailHook.auditTrail}
                    statusHistory={auditTrailHook.statusHistory}
                    loading={auditTrailHook.loading}
                    error={auditTrailHook.error}
                    onApprove={onAuditApprove}
                    showGeographicInfo={true}
                    showChangeDetails={true}
                    compact={false}
                    // Integrate with stepper
                    currentStep={currentStep}
                    steps={steps}
                  />
                ) : (
                  <Alert
                    message="ยังไม่มีประวัติการดำเนินการ"
                    description={
                      !documentId 
                        ? "การแสดงประวัติจะเริ่มต้นเมื่อมีการบันทึกเอกสารครั้งแรก (Document ID จำเป็นต้องมี)"
                        : "เมื่อมีการบันทึก แก้ไข หรือเปลี่ยนแปลงสถานะของเอกสารนี้ ประวัติจะแสดงที่นี่"
                    }
                    type="info"
                    showIcon
                    style={{ margin: '16px 0' }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        )}
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
  requireBranchSelection: PropTypes.bool,
  onBranchChange: PropTypes.func,
  loading: PropTypes.bool,
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