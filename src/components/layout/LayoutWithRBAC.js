/**
 * Unified LayoutWithRBAC Component - SINGLE VERSION
 * Migrated to use Clean Slate RBAC system with backward compatibility
 * This replaces both legacy LayoutWithRBAC and CleanSlateLayoutWithRBAC
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Breadcrumb, Card, Select, Space, Typography, Spin, Alert, Steps, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { 
  GlobalOutlined, 
  BankOutlined, 
  LockOutlined,
  UserOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

// Use Clean Slate RBAC system
import { usePermissions } from 'hooks/usePermissions';
import PermissionGate from '../PermissionGate';
import { getProvinceName, getBranchName } from 'utils/mappings';
import GeographicBranchSelector from '../GeographicBranchSelector';
import { AuditHistory, AuditTrailSection, useAuditTrail as useBaseAuditTrail } from 'components/AuditTrail';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Unified LayoutWithRBAC Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string} props.permission - Required permission to access page
 * @param {string} props.editPermission - Required permission to edit
 * @param {Array} props.anyOf - Alternative permissions (user needs any one)
 * @param {Array} props.allOf - Required permissions (user needs all)
 * @param {string} props.authority - Required authority level
 * @param {string} props.department - Required department access
 * @param {boolean} props.requireBranchSelection - Whether branch selection is required
 * @param {boolean} props.requireProvinceSelection - Whether province selection is required
 * @param {boolean} props.autoInjectProvinceId - Auto-inject provinceId to children
 * @param {boolean} props.showGeographicSelector - Show province/branch selectors
 * @param {boolean} props.showBreadcrumb - Show breadcrumb navigation
 * @param {boolean} props.showUserInfo - Show user info in header
 * @param {Array} props.breadcrumbItems - Custom breadcrumb items
 * @param {Object} props.geographicFilter - Custom geographic filtering
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.headerExtra - Extra content for header
 * @param {string} props.documentId - Document ID for audit trails
 * @param {string} props.documentType - Document type for audit trails
 * @param {boolean} props.showAuditTrail - Show audit trail functionality
 * @param {boolean} props.showAuditSection - Show audit section
 * @param {Function} props.onBranchChange - Callback when branch selection changes
 * @param {Function} props.onAuditApprove - Audit approval callback
 * @param {Array} props.steps - Steps for workflow stepper
 * @param {number} props.currentStep - Current step in workflow
 * @param {Function} props.onStepClick - Step click callback
 * @param {boolean} props.showStepper - Show workflow stepper
 * @param {string} props.dataCollection - Data collection for operations
 */
const LayoutWithRBAC = ({ 
  children,
  // Core settings
  permission = 'general.view',
  editPermission = null,
  anyOf,
  allOf,
  authority,
  department,
  title = 'การจัดการข้อมูล', 
  subtitle = 'Management',
  
  // Geographic settings
  requireBranchSelection = true,
  requireProvinceSelection = false,
  autoInjectProvinceId = true,
  showGeographicSelector = true,
  onBranchChange,
  
  // UI settings
  showBreadcrumb = true,
  showUserInfo = true,
  breadcrumbItems = [],
  loading = false,
  headerExtra,
  className,
  style,
  
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
  dataCollection = null,
  geographicFilter = {},
  ...props
}) => {
  // Local state for geographic selection
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Redux state (for backward compatibility)
  const { branches } = useSelector(state => state.data);
  
  // Clean slate permissions (unified system)
  const {
    hasPermission,
    canAccessProvince,
    canAccessBranch,
    accessibleProvinces,
    accessibleBranches,
    enhanceDataForSubmission,
    getQueryFilters,
    userRBAC,
    primaryDepartment,
    isActive,
    homeLocation
  } = usePermissions();

  // Initialize with user's default geographic context
  useEffect(() => {
    // Use homeLocation from usePermissions instead of getGeographicContext()
    const context = {
      defaultProvince: homeLocation?.province,
      defaultBranch: homeLocation?.branch
    };
    
    // Auto-select if there's only one province available
    if (!selectedProvince) {
      if (context.defaultProvince) {
        setSelectedProvince(context.defaultProvince);
      } else if (accessibleProvinces.length === 1) {
        setSelectedProvince(accessibleProvinces[0]);
      }
    }
    
    // Auto-select if there's only one branch available
    if (!selectedBranch) {
      if (context.defaultBranch) {
        setSelectedBranch(context.defaultBranch);
      } else if (accessibleBranches.length === 1) {
        setSelectedBranch(accessibleBranches[0]);
      }
    }
  }, [selectedProvince, selectedBranch, accessibleProvinces, accessibleBranches, homeLocation]);

  // Notify parent component when branch changes
  useEffect(() => {
    if (onBranchChange && selectedBranch) {
      onBranchChange({
        selectedBranch,
        selectedProvince,
        branchCode: selectedBranch,
        provinceId: selectedProvince
      });
    }
  }, [selectedBranch, selectedProvince, onBranchChange]);

  // Initialize audit trail functionality (conditionally enabled)
  const auditTrailHook = useBaseAuditTrail({
    documentId: documentId || 'default',
    documentType: documentType || 'general',
    permission,
    enabled: showAuditTrail && !!documentId
  });

  // Check if user has edit permissions
  const canEdit = useMemo(() => {
    if (!editPermission) return false;
    return hasPermission(editPermission, { 
      provinceId: selectedProvince, 
      branchCode: selectedBranch 
    });
  }, [editPermission, hasPermission, selectedProvince, selectedBranch]);

  // Enhanced geographic context with comprehensive provinceId injection
  const geographic = useMemo(() => {
    const provinceData = selectedProvince ? { provinceId: selectedProvince } : {};
    const branchData = selectedBranch ? { branchCode: selectedBranch } : {};
    
    return {
      // Basic selection state
      selectedProvince,
      selectedBranch,
      setSelectedProvince,
      setSelectedBranch,
      
      // Access control
      canAccessProvince,
      canAccessBranch,
      accessibleProvinces,
      accessibleBranches,
      
      // Enhanced data with automatic injection
      currentProvince: selectedProvince,
      currentBranch: selectedBranch,
      provinceName: selectedProvince ? getProvinceName(selectedProvince) : '',
      branchName: selectedBranch ? getBranchName(selectedBranch) : '',
      
      // Recorded context for audit trails
      recordedProvince: provinceData,
      recordedBranch: branchData,
      
      // Automatic provinceId injection based on autoInjectProvinceId flag
      ...(autoInjectProvinceId && selectedProvince ? { provinceId: selectedProvince } : {}),
      ...(selectedBranch ? { branchCode: selectedBranch } : {}),
      
      // Enhanced data operations
      getSubmissionData: () => ({
        branchCode: selectedBranch,
        provinceId: selectedProvince,
        recordedProvince: provinceData,
        recordedBranch: branchData,
        recordedAt: Date.now()
      }),
      
      // Query filters for data operations
      getQueryFilters: () => getQueryFilters({ 
        selectedProvince, 
        selectedBranch 
      }),
      
      // Data enhancement
      enhanceDataForSubmission: (data) => enhanceDataForSubmission({
        ...data,
        provinceId: autoInjectProvinceId ? selectedProvince : data.provinceId,
        branchCode: selectedBranch || data.branchCode
      })
    };
  }, [
    selectedProvince, 
    selectedBranch, 
    canAccessProvince, 
    canAccessBranch, 
    accessibleProvinces, 
    accessibleBranches,
    getQueryFilters,
    enhanceDataForSubmission,
    autoInjectProvinceId
  ]);

  // Handle branch selection changes
  const handleBranchChange = useCallback((branchCode) => {
    setSelectedBranch(branchCode);
    
    // Find province for the selected branch
    const branchData = branches[branchCode];
    if (branchData?.provinceId && branchData.provinceId !== selectedProvince) {
      setSelectedProvince(branchData.provinceId);
    }
  }, [branches, selectedProvince]);

  // Handle province selection changes
  const handleProvinceChange = useCallback((provinceCode) => {
    setSelectedProvince(provinceCode);
    
    // Reset branch selection when province changes
    if (selectedBranch) {
      const branchData = branches[selectedBranch];
      if (branchData?.provinceId !== provinceCode) {
        setSelectedBranch(null);
      }
    }
  }, [branches, selectedBranch]);

  // Check geographic requirements
  const geographicRequirementsMet = useMemo(() => {
    if (requireProvinceSelection && !selectedProvince) return false;
    if (requireBranchSelection && !selectedBranch) return false;
    return true;
  }, [requireProvinceSelection, selectedProvince, requireBranchSelection, selectedBranch]);

  // Check geographic access validity
  const geographicAccessValid = useMemo(() => {
    if (selectedProvince && !canAccessProvince(selectedProvince)) return false;
    if (selectedBranch && !canAccessBranch(selectedBranch)) return false;
    return true;
  }, [selectedProvince, selectedBranch, canAccessProvince, canAccessBranch]);

  // Enhanced children with all context
  const enhancedChildren = useMemo(() => {
    if (!React.isValidElement(children)) return children;
    
    return React.cloneElement(children, {
      // Geographic context
      selectedBranch,
      selectedProvince,
      geographic,
      
      // Permission context
      canEditData: canEdit && geographicAccessValid,
      hasPermission,
      
      // Audit trail functionality
      auditTrail: showAuditTrail ? auditTrailHook : null,
      
      // Stepper information
      stepperInfo: showStepper ? { steps, currentStep, onStepClick } : null,
      
      // Enhanced data operations
      enhanceDataForSubmission: geographic.enhanceDataForSubmission,
      getQueryFilters: geographic.getQueryFilters,
      
      // Backward compatibility props
      ...props
    });
  }, [
    children, 
    selectedBranch, 
    selectedProvince, 
    geographic, 
    canEdit, 
    geographicAccessValid,
    hasPermission,
    showAuditTrail,
    auditTrailHook,
    showStepper,
    steps,
    currentStep,
    onStepClick
  ]);

  // Available branches for current province
  const availableBranches = useMemo(() => {
    if (!selectedProvince) return accessibleBranches;
    
    return accessibleBranches.filter(branchCode => {
      const branchData = branches[branchCode];
      return branchData?.provinceId === selectedProvince;
    });
  }, [selectedProvince, accessibleBranches, branches]);

  // Province selector component - memoized component function
  const ProvinceSelector = useCallback(() => (
    <Select
      placeholder={accessibleProvinces.length === 0 ? "No provinces available" : "Select Province"}
      value={selectedProvince}
      onChange={handleProvinceChange}
      style={{ minWidth: 200 }}
      disabled={accessibleProvinces.length <= 1}
    >
      {accessibleProvinces.map(provinceCode => (
        <Option key={provinceCode} value={provinceCode}>
          <Space>
            <GlobalOutlined />
            {getProvinceName(provinceCode)}
            {accessibleProvinces.length === 1 && <Text type="secondary">(auto-selected)</Text>}
          </Space>
        </Option>
      ))}
    </Select>
  ), [accessibleProvinces, selectedProvince, handleProvinceChange]);

  // Branch selector component - memoized component function
  const BranchSelector = useCallback(() => (
    <Select
      placeholder={
        availableBranches.length === 0 
          ? "No branches available" 
          : !selectedProvince 
            ? "Select province first"
            : "Select Branch"
      }
      value={selectedBranch}
      onChange={handleBranchChange}
      style={{ minWidth: 200 }}
      disabled={!selectedProvince || availableBranches.length <= 1}
    >
      {availableBranches.map(branchCode => (
        <Option key={branchCode} value={branchCode}>
          <Space>
            <BankOutlined />
            {getBranchName(branchCode)}
            {availableBranches.length === 1 && <Text type="secondary">(auto-selected)</Text>}
          </Space>
        </Option>
      ))}
    </Select>
  ), [availableBranches, selectedBranch, selectedProvince, handleBranchChange]);

  // User info display - memoized component function
  const UserInfo = useCallback(() => (
    <Space>
      <UserOutlined />
      <Text strong>{userRBAC?.authority}</Text>
      {primaryDepartment && <Text type="secondary">({primaryDepartment})</Text>}
    </Space>
  ), [userRBAC?.authority, primaryDepartment]);

  // Loading state
  if (loading) {
    return (
      <Layout className={className} style={style}>
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Loading...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  // Check if user is active (but dev users always pass)
  if (!isActive && !userRBAC?.isDev) {
    return (
      <Layout className={className} style={style}>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Account Not Active"
            description="Your account is currently inactive. Please contact your administrator."
            type="warning"
            showIcon
            icon={<LockOutlined />}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <PermissionGate
      permission={permission}
      anyOf={anyOf}
      allOf={allOf}
      authority={authority}
      department={department}
      geographic={{ provinceId: selectedProvince, branchCode: selectedBranch }}
      fallback={
        <Layout className={className} style={style}>
          <Content style={{ padding: '24px' }}>
            <Alert
              message="Access Denied"
              description="You don't have permission to access this page."
              type="error"
              showIcon
              icon={<LockOutlined />}
            />
          </Content>
        </Layout>
      }
    >
      <Layout className={className} style={style}>
        <Content style={{ padding: '24px' }}>
          {/* Breadcrumb */}
          {showBreadcrumb && breadcrumbItems.length > 0 && (
            <Breadcrumb style={{ marginBottom: '16px' }}>
              {breadcrumbItems.map((item, index) => (
                <Breadcrumb.Item key={index} href={item.href}>
                  {item.title}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}

          {/* Page Header */}
          <Card style={{ marginBottom: '24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size="small">
                  <Title level={2} style={{ margin: 0 }}>
                    {title}
                  </Title>
                  {subtitle && (
                    <Text type="secondary">{subtitle}</Text>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  {showUserInfo && <UserInfo />}
                  {headerExtra}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Geographic Selectors */}
          {showGeographicSelector && (
            (requireProvinceSelection && accessibleProvinces.length > 0) ||
            (requireBranchSelection && accessibleBranches.length > 0) ||
            (accessibleProvinces.length > 1 || accessibleBranches.length > 1)
          ) && (
            <Card style={{ marginBottom: '24px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Text strong>Geographic Selection:</Text>
                    {(requireProvinceSelection || accessibleProvinces.length > 1) && <ProvinceSelector />}
                    {(requireBranchSelection || accessibleBranches.length > 1) && <BranchSelector />}
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          {/* Workflow Stepper */}
          {showStepper && steps.length > 0 && (
            <Card style={{ marginBottom: '24px' }}>
              <Steps
                current={currentStep}
                onChange={onStepClick}
                items={steps}
              />
            </Card>
          )}

          {/* Audit Trail Section */}
          {showAuditSection && documentId && (
            <Card style={{ marginBottom: '24px' }}>
              <AuditTrailSection
                documentId={documentId}
                documentType={documentType}
                permission={permission}
                onApprove={onAuditApprove}
              />
            </Card>
          )}

          {/* Main Content */}
          {!geographicRequirementsMet ? (
            <Alert
              message="Geographic Selection Required"
              description={
                requireProvinceSelection && !selectedProvince 
                  ? "Please select a province to continue."
                  : "Please select a branch to continue."
              }
              type="info"
              showIcon
              icon={<GlobalOutlined />}
            />
          ) : !geographicAccessValid ? (
            <Alert
              message="Access Denied to Selected Location"
              description={
                selectedProvince && !canAccessProvince(selectedProvince)
                  ? `You don't have access to ${getProvinceName(selectedProvince)}. Please select a different province.`
                  : `You don't have access to ${getBranchName(selectedBranch)}. Please select a different branch.`
              }
              type="warning"
              showIcon
              icon={<LockOutlined />}
              style={{ marginBottom: '24px' }}
            />
          ) : (
            enhancedChildren
          )}

          {/* Audit History */}
          {showAuditTrail && documentId && (
            <Card style={{ marginTop: '24px' }} title={
              <Space>
                <HistoryOutlined />
                <Text>Audit History</Text>
              </Space>
            }>
              <AuditHistory
                documentId={documentId}
                documentType={documentType}
                maxItems={10}
              />
            </Card>
          )}
        </Content>
      </Layout>
    </PermissionGate>
  );
};

LayoutWithRBAC.propTypes = {
  children: PropTypes.node.isRequired,
  // Core settings
  permission: PropTypes.string,
  editPermission: PropTypes.string,
  anyOf: PropTypes.arrayOf(PropTypes.string),
  allOf: PropTypes.arrayOf(PropTypes.string),
  authority: PropTypes.string,
  department: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  
  // Geographic settings
  requireBranchSelection: PropTypes.bool,
  requireProvinceSelection: PropTypes.bool,
  autoInjectProvinceId: PropTypes.bool,
  showGeographicSelector: PropTypes.bool,
  onBranchChange: PropTypes.func,
  
  // UI settings
  showBreadcrumb: PropTypes.bool,
  showUserInfo: PropTypes.bool,
  breadcrumbItems: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    href: PropTypes.string
  })),
  loading: PropTypes.bool,
  headerExtra: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  geographicFilter: PropTypes.object,
  
  // Audit Trail & Document Workflow Props
  documentId: PropTypes.string,
  documentType: PropTypes.string,
  showAuditTrail: PropTypes.bool,
  showAuditSection: PropTypes.bool,
  onAuditApprove: PropTypes.func,
  
  // Stepper Integration Props
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  currentStep: PropTypes.number,
  onStepClick: PropTypes.func,
  showStepper: PropTypes.bool,
  
  // Data operation configuration
  dataCollection: PropTypes.string
};

export default LayoutWithRBAC; 