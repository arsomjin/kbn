/**
 * Account Layout with RBAC Integration
 * Provides geographic filtering, permission checks, and audit trail integration
 * for Account module pages with document workflow support
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'shards-react';
import { Alert, Skeleton } from 'antd';
import { PermissionGate, GeographicBranchSelector } from 'components';
import AuditTrailStepper from 'components/AuditTrail/AuditTrailStepper';
import { usePermissions } from 'hooks/usePermissions';
import { useGeographicData } from 'hooks/useGeographicData';
import useAuditTrail from 'hooks/useAuditTrail';
import { useSelector } from 'react-redux';
import PageTitle from 'components/common/PageTitle';
import PropTypes from 'prop-types';

const AccountLayoutWithRBAC = ({
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
  steps = [],
  currentStep = 0,
  onStepClick = null,
  ...props
}) => {
  const { branches } = useSelector(state => state.data);
  const { hasPermission, accessibleBranches, getDefaultBranch } = usePermissions();
  const { checkBranchAccess, getCurrentProvince } = useGeographicData();
  
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Initialize audit trail if document workflow is enabled
  const auditTrailHook = useAuditTrail(
    showAuditTrail ? documentId : null, 
    showAuditTrail ? documentType : null
  );

  // Initialize branch selection
  useEffect(() => {
    const defaultBranch = getDefaultBranch();
    if (defaultBranch && !selectedBranch) {
      setSelectedBranch(defaultBranch);
    }
  }, [getDefaultBranch, selectedBranch]);

  // Notify parent component of branch changes
  useEffect(() => {
    if (onBranchChange && selectedBranch) {
      const branchData = branches[selectedBranch];
      onBranchChange({
        branchCode: selectedBranch,
        branchName: branchData?.branchName,
        provinceId: branchData?.provinceId,
        recordedProvince: getCurrentProvince(),
        recordedBranch: selectedBranch
      });
    }
  }, [selectedBranch, branches, onBranchChange, getCurrentProvince]);

  // Check if user can access the current data
  const canAccessCurrentData = selectedBranch ? checkBranchAccess(selectedBranch) : true;
  const showBranchSelector = requireBranchSelection && accessibleBranches.length > 1;

  if (loading) {
    return (
      <Container fluid className="main-content-container px-4">
        <Row noGutters className="page-header py-4">
          <PageTitle title={title} subtitle={subtitle} className="text-sm-left mb-3" />
        </Row>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Container>
    );
  }

  return (
    <PermissionGate permission={permission} fallback={
      <Container fluid className="main-content-container px-4">
        <Row noGutters className="page-header py-4">
          <PageTitle title={title} subtitle={subtitle} className="text-sm-left mb-3" />
        </Row>
        <Alert
          message="ไม่มีสิทธิ์เข้าถึง"
          description={`คุณไม่มีสิทธิ์เข้าถึงหน้า ${title} กรุณาติดต่อผู้ดูแลระบบ`}
          type="error"
          showIcon
        />
      </Container>
    }>
      <Container fluid className="main-content-container px-4">
        <Row noGutters className="page-header py-4">
          <PageTitle title={title} subtitle={subtitle} className="text-sm-left mb-3" />
        </Row>

        {/* Document Workflow Stepper with Audit Trail */}
        {showAuditTrail && documentId && steps.length > 0 && (
          <Row className="mb-4">
            <Col lg="12">
              <Card body>
                <AuditTrailStepper
                  steps={steps}
                  currentStep={currentStep}
                  auditTrail={auditTrailHook.auditTrail}
                  changeHistory={auditTrailHook.changeHistory}
                  documentId={documentId}
                  documentType={documentType}
                  onStepClick={onStepClick}
                  showChangeHistory={auditTrailHook.canViewAuditDetails()}
                  showAuditDetails={auditTrailHook.canViewAuditDetails()}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Geographic Branch Selector */}
        {showBranchSelector && (
          <Row className="mb-4">
            <Col lg="12">
              <Card body>
                <Row>
                  <Col md="6">
                    <label htmlFor="branchSelect" className="form-label">
                      <strong>เลือกสาขาที่บันทึกข้อมูล:</strong>
                    </label>
                    <GeographicBranchSelector
                      value={selectedBranch}
                      onChange={setSelectedBranch}
                      placeholder="เลือกสาขา"
                      respectRBAC={true}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col md="6" className="d-flex align-items-end">
                    {selectedBranch && (
                      <Alert
                        message={`กำลังบันทึกข้อมูลสำหรับ: ${branches[selectedBranch]?.branchName || selectedBranch}`}
                        type="info"
                        size="small"
                        showIcon
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
          <Row className="mb-4">
            <Col lg="12">
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
        {(!requireBranchSelection || canAccessCurrentData) && (
          React.cloneElement(children, {
            selectedBranch,
            canEditData: hasPermission(editPermission) && canAccessCurrentData,
            geographic: {
              branchCode: selectedBranch,
              branchName: branches[selectedBranch]?.branchName,
              provinceId: branches[selectedBranch]?.provinceId,
              recordedProvince: getCurrentProvince(),
              recordedBranch: selectedBranch
            },
            // Pass audit trail functionality to children
            auditTrail: showAuditTrail ? auditTrailHook : null,
            ...props
          })
        )}
      </Container>
    </PermissionGate>
  );
};

AccountLayoutWithRBAC.propTypes = {
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
  steps: PropTypes.array,
  currentStep: PropTypes.number,
  onStepClick: PropTypes.func,
  ...PropTypes.object
};

export default AccountLayoutWithRBAC; 