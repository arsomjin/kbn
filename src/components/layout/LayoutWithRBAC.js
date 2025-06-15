/**
 * Unified LayoutWithRBAC Component - SINGLE VERSION
 * Migrated to use Clean Slate RBAC system with backward compatibility
 * This replaces both legacy LayoutWithRBAC and CleanSlateLayoutWithRBAC
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Breadcrumb,
  Card,
  Select,
  Space,
  Typography,
  Spin,
  Alert,
  Steps,
  Row,
  Col,
} from 'antd';
import PropTypes from 'prop-types';
import {
  GlobalOutlined,
  BankOutlined,
  LockOutlined,
  UserOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

// Use Clean Slate RBAC system
import { usePermissions } from 'hooks/usePermissions';
import { useResponsive } from 'hooks/useResponsive';
import PermissionGate from '../PermissionGate';
import { getProvinceName, getBranchName } from 'utils/mappings';
import GeographicBranchSelector from '../GeographicBranchSelector';
import {
  AuditHistory,
  AuditTrailSection,
  useAuditTrail as useBaseAuditTrail,
} from 'components/AuditTrail';
import { Stepper } from 'elements';

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
 * @param {Function} props.customCheck - Custom permission check function
 * @param {string} props.fallbackPermission - Fallback permission if main check fails
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
  customCheck = null,
  fallbackPermission = null,
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
  debug = false,

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
  const { branches } = useSelector((state) => state.data);

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
    homeLocation,
  } = usePermissions();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Initialize with user's default geographic context
  useEffect(() => {
    // Use homeLocation from usePermissions instead of getGeographicContext()
    const context = {
      defaultProvince: homeLocation?.province,
      defaultBranch: homeLocation?.branch,
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
  }, [
    selectedProvince,
    selectedBranch,
    accessibleProvinces,
    accessibleBranches,
    homeLocation,
  ]);

  // Notify parent component when branch changes
  useEffect(() => {
    if (onBranchChange && selectedBranch) {
      onBranchChange({
        selectedBranch,
        selectedProvince,
        branchCode: selectedBranch,
        provinceId: selectedProvince,
      });
    }
  }, [selectedBranch, selectedProvince, onBranchChange]);

  // Initialize audit trail functionality (conditionally enabled)
  const auditTrailHook = useBaseAuditTrail({
    documentId: documentId || 'default',
    documentType: documentType || 'general',
    permission,
    enabled: showAuditTrail && !!documentId,
  });

  // Check if user has edit permissions
  const canEdit = useMemo(() => {
    if (!editPermission) return false;
    return hasPermission(editPermission, {
      provinceId: selectedProvince,
      branchCode: selectedBranch,
    });
  }, [editPermission, hasPermission, selectedProvince, selectedBranch]);

  // Enhanced geographic context with comprehensive provinceId injection
  const geographic = useMemo(() => {
    const provinceData = selectedProvince
      ? { provinceId: selectedProvince }
      : {};
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
      ...(autoInjectProvinceId && selectedProvince
        ? { provinceId: selectedProvince }
        : {}),
      ...(selectedBranch ? { branchCode: selectedBranch } : {}),

      // Enhanced data operations
      getSubmissionData: () => ({
        branchCode: selectedBranch,
        provinceId: selectedProvince,
        recordedProvince: provinceData,
        recordedBranch: branchData,
        recordedAt: Date.now(),
      }),

      // Query filters for data operations
      getQueryFilters: () =>
        getQueryFilters({
          selectedProvince,
          selectedBranch,
        }),

      // Data enhancement
      enhanceDataForSubmission: (data) =>
        enhanceDataForSubmission({
          ...data,
          provinceId: autoInjectProvinceId ? selectedProvince : data.provinceId,
          branchCode: selectedBranch || data.branchCode,
        }),
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
    autoInjectProvinceId,
  ]);

  // Handle branch selection changes
  const handleBranchChange = useCallback(
    (branchCode) => {
      setSelectedBranch(branchCode);

      // Find province for the selected branch
      const branchData = branches[branchCode];
      if (
        branchData?.provinceId &&
        branchData.provinceId !== selectedProvince
      ) {
        setSelectedProvince(branchData.provinceId);
      }
    },
    [branches, selectedProvince]
  );

  // Handle province selection changes
  const handleProvinceChange = useCallback(
    (provinceCode) => {
      setSelectedProvince(provinceCode);

      // Reset branch selection when province changes
      if (selectedBranch) {
        const branchData = branches[selectedBranch];
        if (branchData?.provinceId !== provinceCode) {
          setSelectedBranch(null);
        }
      }
    },
    [branches, selectedBranch]
  );

  // Check geographic requirements
  const geographicRequirementsMet = useMemo(() => {
    if (requireProvinceSelection && !selectedProvince) return false;
    if (requireBranchSelection && !selectedBranch) return false;
    return true;
  }, [
    requireProvinceSelection,
    selectedProvince,
    requireBranchSelection,
    selectedBranch,
  ]);

  // Check geographic access validity
  const geographicAccessValid = useMemo(() => {
    if (selectedProvince && !canAccessProvince(selectedProvince)) return false;
    if (selectedBranch && !canAccessBranch(selectedBranch)) return false;
    return true;
  }, [selectedProvince, selectedBranch, canAccessProvince, canAccessBranch]);

  // Enhanced children with all context
  const enhancedChildren = useMemo(() => {
    if (!React.isValidElement(children)) return children;

    // Filter out DOM-incompatible props to prevent React warnings
    const {
      // Remove DOM-incompatible props from spreading
      selectedBranch: _selectedBranch,
      selectedProvince: _selectedProvince,
      canEditData: _canEditData,
      hasPermission: _hasPermission,
      geographic: _geographic,
      auditTrail: _auditTrail,
      stepperInfo: _stepperInfo,
      enhanceDataForSubmission: _enhanceDataForSubmission,
      getQueryFilters: _getQueryFilters,
      // Remove other layout-specific props
      permission: _permission,
      editPermission: _editPermission,
      anyOf: _anyOf,
      allOf: _allOf,
      authority: _authority,
      department: _department,
      requireBranchSelection: _requireBranchSelection,
      requireProvinceSelection: _requireProvinceSelection,
      autoInjectProvinceId: _autoInjectProvinceId,
      showGeographicSelector: _showGeographicSelector,
      onBranchChange: _onBranchChange,
      showBreadcrumb: _showBreadcrumb,
      showUserInfo: _showUserInfo,
      breadcrumbItems: _breadcrumbItems,
      headerExtra: _headerExtra,
      documentId: _documentId,
      documentType: _documentType,
      showAuditTrail: _showAuditTrail,
      showAuditSection: _showAuditSection,
      onAuditApprove: _onAuditApprove,
      steps: _steps,
      currentStep: _currentStep,
      onStepClick: _onStepClick,
      showStepper: _showStepper,
      dataCollection: _dataCollection,
      geographicFilter: _geographicFilter,
      // Remove additional props that might be passed down
      title: _title,
      subtitle: _subtitle,
      loading: _loading,
      className: _className,
      style: _style,
      ...domSafeProps
    } = props;

    // Only pass props that are safe for React components (not DOM elements)
    const componentProps = {
      // Geographic context (safe for React components)
      selectedBranch,
      selectedProvince,
      geographic,

      // Permission context (safe for React components)
      canEditData: canEdit && geographicAccessValid,
      hasPermission,

      // Audit trail functionality (safe for React components)
      auditTrail: showAuditTrail ? auditTrailHook : null,

      // Stepper information (safe for React components)
      stepperInfo: showStepper ? { steps, currentStep, onStepClick } : null,

      // Enhanced data operations (safe for React components)
      enhanceDataForSubmission: geographic.enhanceDataForSubmission,
      getQueryFilters: geographic.getQueryFilters,
    };

    // Only spread DOM-safe props if the child is a DOM element
    // For React components, we can pass all props safely
    if (typeof children.type === 'string') {
      // DOM element - only pass DOM-safe props
      return React.cloneElement(children, domSafeProps);
    } else {
      // React component - can pass all props
      return React.cloneElement(children, {
        ...componentProps,
        ...domSafeProps,
      });
    }
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
    onStepClick,
    props,
  ]);

  // Available branches for current province
  const availableBranches = useMemo(() => {
    if (!selectedProvince) return accessibleBranches;

    return accessibleBranches.filter((branchCode) => {
      const branchData = branches[branchCode];
      return branchData?.provinceId === selectedProvince;
    });
  }, [selectedProvince, accessibleBranches, branches]);

  // Province selector component - memoized component function
  const ProvinceSelector = useCallback(
    () => (
      <Select
        placeholder={
          accessibleProvinces.length === 0
            ? 'No provinces available'
            : 'Select Province'
        }
        value={selectedProvince}
        onChange={handleProvinceChange}
        style={{
          minWidth: 200,
          width: '100%',
        }}
        size={isMobile ? 'middle' : 'large'}
        disabled={accessibleProvinces.length <= 1}
      >
        {accessibleProvinces.map((provinceCode) => (
          <Option key={provinceCode} value={provinceCode}>
            <Space>
              <GlobalOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 500 }}>
                {getProvinceName(provinceCode)}
              </span>
              {accessibleProvinces.length === 1 && (
                <Text type='secondary'>(auto-selected)</Text>
              )}
            </Space>
          </Option>
        ))}
      </Select>
    ),
    [accessibleProvinces, selectedProvince, handleProvinceChange, isMobile]
  );

  // Branch selector component - memoized component function
  const BranchSelector = useCallback(
    () => (
      <Select
        placeholder={
          availableBranches.length === 0
            ? 'No branches available'
            : !selectedProvince
              ? 'Select province first'
              : 'Select Branch'
        }
        value={selectedBranch}
        onChange={handleBranchChange}
        style={{
          minWidth: 200,
          width: '100%',
        }}
        size={isMobile ? 'middle' : 'large'}
        disabled={!selectedProvince || availableBranches.length <= 1}
      >
        {availableBranches.map((branchCode) => (
          <Option key={branchCode} value={branchCode}>
            <Space>
              <BankOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontWeight: 500 }}>
                {getBranchName(branchCode)}
              </span>
              {availableBranches.length === 1 && (
                <Text type='secondary'>(auto-selected)</Text>
              )}
            </Space>
          </Option>
        ))}
      </Select>
    ),
    [
      availableBranches,
      selectedBranch,
      selectedProvince,
      handleBranchChange,
      isMobile,
    ]
  );

  // User info display - memoized component function
  const UserInfo = useCallback(
    () => (
      <div
        style={{
          background: 'linear-gradient(135deg, #f6f8ff 0%, #f0f5ff 100%)',
          border: '1px solid #e6f0ff',
          borderRadius: isMobile ? '8px' : '10px',
          padding: isMobile ? '8px 12px' : '10px 16px',
        }}
      >
        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          size='small'
          style={{
            alignItems: isMobile ? 'flex-start' : 'center',
          }}
        >
          <Space size='small'>
            <UserOutlined
              style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#1890ff',
              }}
            />
            <Text
              strong
              style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#262626',
              }}
            >
              {userRBAC?.authority}
            </Text>
          </Space>
          {primaryDepartment && (
            <Text
              type='secondary'
              style={{
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 500,
              }}
            >
              ({primaryDepartment})
            </Text>
          )}
        </Space>
      </div>
    ),
    [userRBAC?.authority, primaryDepartment, isMobile]
  );

  // Loading state
  if (loading) {
    return (
      <Layout className={className} style={style}>
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size='large' />
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
            message='Account Not Active'
            description='Your account is currently inactive. Please contact your administrator.'
            type='warning'
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
      customCheck={customCheck}
      fallbackPermission={fallbackPermission}
      debug={debug}
      geographic={
        selectedProvince || selectedBranch
          ? { provinceId: selectedProvince, branchCode: selectedBranch }
          : undefined
      }
      fallback={
        <Layout className={className} style={style}>
          <Content
            style={{
              padding: isMobile ? '16px 20px' : '24px',
              overflow: 'hidden',
            }}
          >
            <Alert
              message='Access Denied'
              description='คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
              type='error'
              showIcon
              icon={<LockOutlined />}
            />
          </Content>
        </Layout>
      }
    >
      <Layout className={className} style={style}>
        <Content
          style={{
            maxWidth: '100vw',
            overflow: 'hidden',
            // padding: isMobile ? '12px 16px 16px 16px' : isTablet ? '16px 20px 20px 20px' : '20px 24px 24px 24px'
          }}
        >
          {/* Breadcrumb */}
          {showBreadcrumb && breadcrumbItems.length > 0 && (
            <Breadcrumb
              style={{
                marginBottom: isMobile ? '12px' : '16px',
                paddingLeft: isMobile ? '4px' : '0',
              }}
            >
              {breadcrumbItems.map((item, index) => (
                <Breadcrumb.Item key={index} href={item.href}>
                  {item.title}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}

          {/* Page Header */}
          <Card
            style={{
              marginBottom: isMobile ? '16px' : isTablet ? '20px' : '24px',
              marginTop: isMobile ? '16px' : isTablet ? '20px' : '24px',
              borderRadius: isMobile ? '12px' : '16px',
              boxShadow: isMobile
                ? '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
                : '0 4px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f0f0f0',
              background: '#ffffff',
            }}
            bodyStyle={{
              padding: isMobile
                ? '18px 20px'
                : isTablet
                  ? '22px 24px'
                  : '24px 28px',
            }}
          >
            <Row
              justify='space-between'
              align={isMobile ? 'top' : 'middle'}
              gutter={[16, 16]}
            >
              <Col xs={24} sm={24} md={16} lg={16} xl={16}>
                <Space
                  direction='vertical'
                  size={isMobile ? 'small' : 'middle'}
                  style={{ width: '100%' }}
                >
                  <Title
                    level={isMobile ? 4 : 2}
                    style={{
                      margin: 0,
                      fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px',
                      lineHeight: isMobile
                        ? '28px'
                        : isTablet
                          ? '32px'
                          : '36px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {title}
                  </Title>
                  {subtitle && (
                    <Text
                      type='secondary'
                      style={{
                        fontSize: isMobile
                          ? '14px'
                          : isTablet
                            ? '15px'
                            : '16px',
                        lineHeight: isMobile ? '20px' : '24px',
                        color: '#666666',
                        fontWeight: 400,
                      }}
                    >
                      {subtitle}
                    </Text>
                  )}
                </Space>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '16px',
                    alignItems: isMobile ? 'flex-start' : 'flex-end',
                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                    width: '100%',
                  }}
                >
                  {showUserInfo && <UserInfo />}
                  {headerExtra}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Geographic Selectors - Only show if there are actual choices to make */}
          {showGeographicSelector &&
            ((requireProvinceSelection && accessibleProvinces.length > 0) ||
              (requireBranchSelection && accessibleBranches.length > 0) ||
              accessibleProvinces.length > 1 ||
              accessibleBranches.length > 1) &&
            // Only show if user actually has choices to make
            (accessibleProvinces.length > 1 ||
              (selectedProvince && availableBranches.length > 1)) && (
              <Card
                style={{
                  marginBottom: isMobile ? '16px' : isTablet ? '20px' : '24px',
                  borderRadius: isMobile ? '12px' : '16px',
                  border: '1px solid #f0f0f0',
                  boxShadow:
                    '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  background: '#ffffff',
                }}
                bodyStyle={{
                  padding: isMobile
                    ? '18px 20px'
                    : isTablet
                      ? '22px 24px'
                      : '24px 28px',
                }}
              >
                <Row justify='start' align='middle'>
                  <Col span={24}>
                    <Space
                      direction='vertical'
                      size={isMobile ? 'middle' : 'large'}
                      style={{ width: '100%' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          paddingBottom: isMobile ? '8px' : '12px',
                          borderBottom: '1px solid #f5f5f5',
                        }}
                      >
                        <GlobalOutlined
                          style={{
                            fontSize: isMobile ? '16px' : '18px',
                            color: '#1890ff',
                          }}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: 600,
                            color: '#1a1a1a',
                          }}
                        >
                          Geographic Selection
                        </Text>
                      </div>
                      <Row gutter={[16, 16]}>
                        {/* Only show province selector if there are multiple provinces to choose from */}
                        {accessibleProvinces.length > 1 && (
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <div
                              style={{ marginBottom: isMobile ? '8px' : '0' }}
                            >
                              <Text
                                style={{
                                  fontSize: '13px',
                                  color: '#666',
                                  fontWeight: 500,
                                  display: 'block',
                                  marginBottom: '6px',
                                }}
                              >
                                Province
                              </Text>
                              <ProvinceSelector />
                            </div>
                          </Col>
                        )}
                        {/* Only show branch selector if there are multiple branches to choose from */}
                        {selectedProvince && availableBranches.length > 1 && (
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <div
                              style={{ marginBottom: isMobile ? '8px' : '0' }}
                            >
                              <Text
                                style={{
                                  fontSize: '13px',
                                  color: '#666',
                                  fontWeight: 500,
                                  display: 'block',
                                  marginBottom: '6px',
                                }}
                              >
                                Branch
                              </Text>
                              <BranchSelector />
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}

          {/* Workflow Stepper - Only show if there are actual steps */}
          {showStepper && steps.length > 0 && (
            <Card
              style={{
                marginBottom: isMobile ? '16px' : isTablet ? '20px' : '24px',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid #f0f0f0',
                boxShadow:
                  '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                background: '#ffffff',
              }}
              bodyStyle={{
                padding: isMobile
                  ? '18px 20px'
                  : isTablet
                    ? '22px 24px'
                    : '24px 28px',
              }}
            >
              <Stepper
                current={currentStep}
                onChange={onStepClick}
                direction={isMobile ? 'vertical' : 'horizontal'}
                size={isMobile ? 'small' : 'default'}
                className='layout-stepper'
                steps={steps}
              />
            </Card>
          )}

          {/* Audit Trail Section - Only show if document ID exists */}
          {showAuditSection && documentId && (
            <Card
              style={{
                marginBottom: isMobile ? '16px' : isTablet ? '20px' : '24px',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid #f0f0f0',
                boxShadow:
                  '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                background: '#ffffff',
              }}
              bodyStyle={{
                padding: isMobile
                  ? '18px 20px'
                  : isTablet
                    ? '22px 24px'
                    : '24px 28px',
              }}
            >
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
            <Card
              style={{
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid #e6f7ff',
                background: '#f6ffed',
              }}
            >
              <Alert
                message='Geographic Selection Required'
                description={
                  requireProvinceSelection && !selectedProvince
                    ? 'Please select a province to continue.'
                    : 'Please select a branch to continue.'
                }
                type='info'
                showIcon
                icon={<GlobalOutlined />}
                style={{
                  borderRadius: isMobile ? '8px' : '12px',
                  border: 'none',
                  background: 'transparent',
                }}
              />
            </Card>
          ) : !geographicAccessValid ? (
            <Card
              style={{
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid #fff2e8',
                background: '#fff7e6',
              }}
            >
              <Alert
                message='Access Denied to Selected Location'
                description={
                  selectedProvince && !canAccessProvince(selectedProvince)
                    ? `You don't have access to ${getProvinceName(selectedProvince)}. Please select a different province.`
                    : `You don't have access to ${getBranchName(selectedBranch)}. Please select a different branch.`
                }
                type='warning'
                showIcon
                icon={<LockOutlined />}
                style={{
                  borderRadius: isMobile ? '8px' : '12px',
                  border: 'none',
                  background: 'transparent',
                }}
              />
            </Card>
          ) : (
            <div
              style={
                {
                  // display: 'grid',
                  // gap: isMobile ? '16px' : isTablet ? '20px' : '24px',
                  // gridTemplateColumns: '1fr'
                }
              }
            >
              {enhancedChildren}
            </div>
          )}

          {/* Audit History - Only show if document ID exists */}
          {showAuditTrail && documentId && (
            <Card
              style={{
                marginTop: isMobile ? '16px' : isTablet ? '20px' : '24px',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid #f0f0f0',
                boxShadow:
                  '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                background: '#ffffff',
              }}
              bodyStyle={{
                padding: isMobile
                  ? '18px 20px'
                  : isTablet
                    ? '22px 24px'
                    : '24px 28px',
              }}
              title={
                <Space size={isMobile ? 'small' : 'middle'}>
                  <HistoryOutlined
                    style={{
                      fontSize: isMobile ? '16px' : '18px',
                      color: '#1890ff',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: isMobile ? '15px' : '16px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}
                  >
                    Audit History
                  </Text>
                </Space>
              }
            >
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
  customCheck: PropTypes.func,
  fallbackPermission: PropTypes.string,
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
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ),
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
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  currentStep: PropTypes.number,
  onStepClick: PropTypes.func,
  showStepper: PropTypes.bool,

  // Data operation configuration
  dataCollection: PropTypes.string,
};

export default LayoutWithRBAC;
