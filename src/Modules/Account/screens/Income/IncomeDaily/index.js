import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Row, Col } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { createNewOrderId } from 'Modules/Account/api';
import { FirebaseContext } from '../../../../../firebase';

import { useSelector } from 'react-redux';
import { StatusMapToStep } from 'data/Constant';
import { useMergeState } from 'api/CustomHooks';
import IncomeVehicles from './components/IncomeVehicles';
import IncomeService from './components/IncomeService';
import IncomeParts from './components/IncomeParts';
import IncomeOther from './components/IncomeOther';
import { showWarn } from 'functions';
import {
  Form,
  Select,
  Skeleton,
  Alert,
  Card,
  Space,
  Typography,
  Button,
  message,
  Badge,
  Divider,
  Tag,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
  SendOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  BranchesOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { IncomeDailyCategories } from 'data/Constant';
import { getChanges } from 'functions';
import { getArrayChanges } from 'functions';
import dayjs from 'dayjs';
import { StatusMap } from 'data/Constant';
import { arrayForEach } from 'functions';
import { load } from 'functions';
import { showSuccess } from 'functions';
import { updateNewOrderCustomer } from 'Modules/Utils';
import { errorHandler } from 'functions';
import PropTypes from 'prop-types';
import { useResponsive } from 'hooks/useResponsive';
// 🚀 RBAC Integration Imports
import { usePermissions } from 'hooks/usePermissions';
import PermissionGate from 'components/PermissionGate';
// 🚀 Unified Layout Integration (replacing DocumentWorkflowWrapper)
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import SmartDocumentSearch from './components/SmartDocumentSearch';
import EnhancedAuditTrailSection from '../../../../../components/AuditTrail/EnhancedAuditTrailSection';
// 🔧 ENHANCED: Branch name mapping and date utilities
import { getBranchName, getBranchDetails } from 'utils/mappings';
import { createKeywords } from 'utils';
import { uniq } from 'lodash';
import {
  saveAccountingDocument,
  getAccountingDocumentById,
  generateIncomeId,
} from './api';

const { Option } = Select;
const { Title, Text } = Typography;

// 🎨 MODERN DESIGN: Nature-inspired color palette
const NATURE_COLORS = {
  primary: '#52c41a', // Forest green
  secondary: '#73d13d', // Light green
  accent: '#f6ffed', // Very light green
  earth: '#8b4513', // Earth brown
  sky: '#87ceeb', // Sky blue
  sunset: '#ff7f50', // Coral
  warning: '#faad14', // Amber
  error: '#ff4d4f', // Red
  text: '#262626', // Dark gray
  textSecondary: '#8c8c8c', // Medium gray
  background: '#fafafa', // Light background
  cardBackground: '#ffffff',
  borderColor: '#d9d9d9',
};

const INCOME_DAILY_STEPS = [
  {
    title: 'บันทึกข้อมูล',
    description: 'บันทึกรายการรับเงินประจำวัน',
    icon: <EditOutlined />,
    color: NATURE_COLORS.primary,
  },
  {
    title: 'ตรวจสอบ',
    description: 'ตรวจสอบความถูกต้องของข้อมูล',
    icon: <EyeOutlined />,
    color: NATURE_COLORS.warning,
  },
  {
    title: 'อนุมัติ',
    description: 'อนุมัติรายการรับเงิน',
    icon: <CheckCircleOutlined />,
    color: NATURE_COLORS.secondary,
  },
  {
    title: 'เสร็จสิ้น',
    description: 'บันทึกข้อมูลเสร็จสิ้น',
    icon: <CheckCircleOutlined />,
    color: NATURE_COLORS.primary,
  },
];

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true,
};

// 🎨 MODERN DESIGN: Enhanced category icons and colors
const CATEGORY_CONFIG = {
  vehicles: {
    icon: <ShoppingCartOutlined />,
    color: NATURE_COLORS.primary,
    gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    description: 'รายได้จากการขายรถ',
  },
  service: {
    icon: <UserOutlined />,
    color: NATURE_COLORS.sky,
    gradient: 'linear-gradient(135deg, #87ceeb 0%, #4682b4 100%)',
    description: 'รายได้จากการให้บริการ',
  },
  parts: {
    icon: <BranchesOutlined />,
    color: NATURE_COLORS.earth,
    gradient: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
    description: 'รายได้จากการขายอะไหล่',
  },
  other: {
    icon: <FileTextOutlined />,
    color: NATURE_COLORS.sunset,
    gradient: 'linear-gradient(135deg, #ff7f50 0%, #ff6347 100%)',
    description: 'รายได้อื่นๆ',
  },
};

// Content component to properly handle props from LayoutWithRBAC
const IncomeDailyContent = ({
  category,
  _changeCategory,
  currentView,
  mProps,
  selectedBranch,
  canEditData,
  geographic,
  auditTrail,
  ...otherProps
}) => {
  const { isMobile } = useResponsive();

  // Memoize the enhanced view to prevent unnecessary re-renders
  const enhancedCurrentView = useMemo(() => {
    if (!currentView) return null;
    return React.cloneElement(currentView, {
      ...currentView.props,
      auditTrail: auditTrail,
      geographic: geographic,
    });
  }, [currentView, auditTrail, geographic]);

  return (
    <div>
      {/* 🎨 MODERN DESIGN: Enhanced category selection with nature-inspired styling */}
      <Card
        style={{
          marginBottom: '24px',
          background: NATURE_COLORS.accent,
          border: `1px solid ${NATURE_COLORS.borderColor}`,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={16} align='middle'>
          <Col md={12} sm={24}>
            <Form.Item
              label={
                <Space>
                  <FileTextOutlined style={{ color: NATURE_COLORS.primary }} />
                  <Text strong style={{ color: NATURE_COLORS.text }}>
                    ประเภทการรับเงิน
                  </Text>
                </Space>
              }
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder='เลือกประเภทการรับเงิน'
                onChange={_changeCategory}
                value={category}
                disabled={mProps.isEdit}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                }}
                size='large'
              >
                {Object.keys(IncomeDailyCategories).map((type, i) => {
                  const config = CATEGORY_CONFIG[type] || {};
                  return (
                    <Option key={i} value={type}>
                      <Space>
                        <span style={{ color: config.color }}>
                          {config.icon}
                        </span>
                        <span>{IncomeDailyCategories[type]}</span>
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                          {config.description}
                        </Text>
                      </Space>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            {/* 🎨 MODERN DESIGN: Category info display */}
            {category && CATEGORY_CONFIG[category] && (
              <div
                style={{
                  padding: '12px 16px',
                  background: CATEGORY_CONFIG[category].gradient,
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Space>
                  {CATEGORY_CONFIG[category].icon}
                  <Text strong style={{ color: 'white' }}>
                    {IncomeDailyCategories[category]}
                  </Text>
                </Space>
                <div
                  style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}
                >
                  {CATEGORY_CONFIG[category].description}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {enhancedCurrentView}
    </div>
  );
};

IncomeDailyContent.propTypes = {
  category: PropTypes.string.isRequired,
  _changeCategory: PropTypes.func.isRequired,
  currentView: PropTypes.node.isRequired,
  mProps: PropTypes.object.isRequired,
  selectedBranch: PropTypes.string,
  canEditData: PropTypes.bool,
  geographic: PropTypes.object,
  auditTrail: PropTypes.object,
};

// 🚀 DEBUG: Enhanced logging utility
const debugLog = (component, action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 [${component}] ${action}`);
    console.log('📊 Data:', data);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

// 🔧 ENHANCED: Utility functions for data handling
const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return 'ไม่ระบุวันที่';

  try {
    if (dayjs.isDayjs(dateValue)) {
      return dateValue.format('DD/MM/YYYY');
    }

    const parsed = dayjs(dateValue);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : 'ไม่ระบุวันที่';
  } catch (error) {
    console.warn('Date formatting error:', error, 'for value:', dateValue);
    return 'ไม่ระบุวันที่';
  }
};

const formatDateForForm = (dateValue) => {
  if (!dateValue) return null;

  try {
    // Handle various date formats and return dayjs object for form fields
    if (dayjs.isDayjs(dateValue)) {
      return dateValue;
    }

    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const parsed = dayjs(dateValue);
      return parsed.isValid() ? parsed : null;
    }

    if (dateValue instanceof Date) {
      const parsed = dayjs(dateValue);
      return parsed.isValid() ? parsed : null;
    }

    return null;
  } catch (error) {
    console.warn('Date formatting error:', error, 'for value:', dateValue);
    return null;
  }
};

// 🔧 ENHANCED: Branch display utility
const formatBranchDisplay = (branchCode, showCode = true) => {
  if (!branchCode) return 'ไม่ระบุสาขา';

  try {
    const branchDetails = getBranchDetails(branchCode);
    if (branchDetails) {
      return showCode
        ? `${branchDetails.branchName} (${branchCode})`
        : branchDetails.branchName;
    }

    const branchName = getBranchName(branchCode);
    if (branchName && branchName !== 'ไม่ระบุ') {
      return showCode ? `${branchName} (${branchCode})` : branchName;
    }

    return branchCode;
  } catch (error) {
    console.warn('Branch formatting error:', error, 'for code:', branchCode);
    return branchCode;
  }
};

// 🔍 ENHANCED: Update keywords for transformed customer names
const updateDocumentKeywords = (document, newCustomerName) => {
  if (!document || !newCustomerName) return document;

  try {
    // Create new keywords for the updated customer name
    const customerKeywords = createKeywords(newCustomerName.toLowerCase());

    // Preserve existing keywords and add new ones
    const existingKeywords = document.keywords || [];
    const documentIdKeywords = document.incomeId
      ? createKeywords(document.incomeId.toLowerCase())
      : [];

    // Combine all keywords and remove duplicates
    const updatedKeywords = uniq([
      ...existingKeywords,
      ...customerKeywords,
      ...documentIdKeywords,
    ]);

    return {
      ...document,
      customerName: newCustomerName,
      keywords: updatedKeywords,
    };
  } catch (error) {
    console.warn('Keywords update error:', error);
    return document;
  }
};

const IncomeDaily = () => {
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);

  // 🚀 RBAC Integration
  const { hasPermission, filterDataByUserAccess } = usePermissions();

  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState(params?.category || 'vehicles');
  const [form] = Form.useForm();
  const [mode, setMode] = useState('SEARCH'); // SEARCH, CREATE, EDIT
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [documentStatus, setDocumentStatus] = useState('draft');
  const [selectedSaleDocument, setSelectedSaleDocument] = useState(null);

  // 🚀 DEBUG: Component initialization
  useEffect(() => {
    debugLog('IncomeDaily', 'Component Initialized', {
      mode,
      user: user?.displayName || user?.uid,
      permissions: {
        view: hasPermission('accounting.view'),
        edit: hasPermission('accounting.edit'),
        review: hasPermission('accounting.review'),
        approve: hasPermission('accounting.approve'),
      },
      category,
      params,
    });
  }, []);

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setReady(true);
        debugLog('IncomeDaily', 'Component Ready', { ready: true });
      } catch (error) {
        console.error('Initialization error:', error);
        message.error('เกิดข้อผิดพลาดในการเริ่มต้นระบบ');
      }
    };

    initializeComponent();
  }, []);

  const _changeCategory = (ev) => {
    setCategory(ev);
  };

  const _onConfirmOrder = async (
    values,
    resetToInitial,
    auditTrailFromProps = null,
    geographicFromProps = null
  ) => {
    try {
      let mValues = JSON.parse(JSON.stringify(values));
      mValues.incomeCategory = 'daily';
      mValues.incomeSubCategory = category;

      // 🔧 FIX: Enhanced date formatting to prevent Invalid Date
      Object.keys(mValues).forEach((key) => {
        if (key.includes('Date') || key === 'date') {
          if (mValues[key]) {
            mValues[key] = formatDateForForm(mValues[key]);
          }
        }
      });

      // Use enhanced geographic context for automatic provinceId injection
      if (geographicFromProps && geographicFromProps.enhanceDataForSubmission) {
        mValues = geographicFromProps.enhanceDataForSubmission(mValues);
      } else if (geographicFromProps) {
        // Fallback to manual assignment if wrapper enhancement not available
        Object.assign(mValues, geographicFromProps);
      }

      if (
        !mValues.customerId &&
        ![
          'partSKC',
          'partKBN',
          'wholeSale',
          'partDeposit',
          'partChange',
        ].includes(mValues.incomeType)
      ) {
        showWarn('กรุณาเลือกลูกค้า');
        return;
      }

      debugLog('IncomeDaily', 'Saving Document', {
        values: mValues,
        mode,
        category,
        documentId: selectedDocument?.id,
      });

      // Generate new income ID if creating new document
      if (mode === 'CREATE' && !mValues.incomeId) {
        const newIncomeId = await generateIncomeId(category);
        mValues.incomeId = newIncomeId;
      }

      // Save the document
      const savedDocument = await saveAccountingDocument(
        mValues,
        mode === 'EDIT' ? selectedDocument?.id : null
      );

      showSuccess(
        mode === 'CREATE' ? 'บันทึกเอกสารใหม่เรียบร้อย' : 'แก้ไขเอกสารเรียบร้อย'
      );

      // Reset form if requested
      if (resetToInitial) {
        resetToInitial();
        setMode('SEARCH');
        setSelectedDocument(null);
        setSelectedSaleDocument(null);
        form.resetFields();
      }

      debugLog('IncomeDaily', 'Document Saved Successfully', {
        savedDocument,
        mode,
      });
    } catch (error) {
      console.error('Save error:', error);
      errorHandler(error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // Handle document selection from search
  const handleDocumentSelect = async (document) => {
    debugLog('IncomeDaily', 'Document Selected', {
      documentId: document.id,
      saleOrderNumber: document.saleOrderNumber,
      customerName: document.customerName,
    });

    setSelectedDocument(document);
    setMode('EDIT');
    setCurrentStep(1);
    setDocumentStatus(document.status || 'draft');

    // 🚀 ENHANCED: Populate form with document data using legacy structure
    const formData = {
      // Core document fields
      incomeId: document.saleOrderNumber,
      incomeCategory: document.incomeCategory || 'daily',
      incomeSubCategory: document.incomeSubCategory || 'vehicles',
      incomeType: document.incomeType,

      // Customer information
      customerId: document.customerId,
      customerName: document.customerName,
      customerPhone: document.customerPhone,
      customerAddress: document.customerAddress,

      // Financial data
      totalAmount: document.totalAmount,
      paidAmount: document.paidAmount,
      remainingAmount: document.remainingAmount,
      paymentMethod: document.paymentMethod,

      // Vehicle/Product information (if applicable)
      vehicleModel: document.vehicleModel,
      vehicleYear: document.vehicleYear,
      vehicleColor: document.vehicleColor,
      vehiclePrice: document.vehiclePrice,

      // Service information (if applicable)
      serviceType: document.serviceType,
      serviceDescription: document.serviceDescription,

      // Parts information (if applicable)
      partsList: document.partsList || [],

      // Geographic and audit data
      branchCode: document.branchCode,
      provinceId: document.provinceId,

      // 🔧 ENHANCED: Proper date handling with enhanced formatting
      date: document.date
        ? formatDateForForm(document.date)
        : formatDateForForm(new Date()),
      serviceDate: document.serviceDate
        ? formatDateForForm(document.serviceDate)
        : null,
      deliveryDate: document.deliveryDate
        ? formatDateForForm(document.deliveryDate)
        : null,

      // Status and workflow
      status: document.status || 'draft',
      approvalStatus: document.approvalStatus,

      // Audit trail data
      createdBy: document.createdBy,
      createdAt: document.createdAt
        ? formatDateForForm(document.createdAt)
        : null,
      updatedBy: document.updatedBy,
      updatedAt: document.updatedAt
        ? formatDateForForm(document.updatedAt)
        : null,

      // Additional metadata
      description: document.description,
      notes: document.notes,
      attachments: document.attachments || [],
    };

    // Set category based on document sub-category
    if (document.incomeSubCategory) {
      setCategory(document.incomeSubCategory);
    }

    // Populate form with enhanced data
    form.setFieldsValue(formData);

    debugLog('IncomeDaily', 'Form Data Populated', {
      formData,
      category: document.incomeSubCategory,
      branchDisplay: formatBranchDisplay(document.branchCode),
    });
  };

  // Handle sale document selection for creating new income document
  const handleSaleDocumentSelect = (saleDocument) => {
    debugLog('IncomeDaily', 'Sale Document Selected', {
      saleOrderNumber: saleDocument.saleOrderNumber,
      customerName: saleDocument.customerName,
    });

    setSelectedSaleDocument(saleDocument);
    setMode('CREATE');
    setCurrentStep(0);

    // Pre-populate form with sale document data
    const formData = {
      // Reference to sale document
      referenceSaleOrder: saleDocument.saleOrderNumber,

      // Customer information from sale
      customerId: saleDocument.customerId,
      customerName: saleDocument.customerName,
      customerPhone: saleDocument.customerPhone,
      customerAddress: saleDocument.customerAddress,

      // Vehicle information from sale
      vehicleModel: saleDocument.vehicleModel,
      vehicleYear: saleDocument.vehicleYear,
      vehicleColor: saleDocument.vehicleColor,
      vehiclePrice: saleDocument.totalAmount,

      // Financial data from sale
      totalAmount: saleDocument.totalAmount,

      // Geographic data
      branchCode: saleDocument.branchCode,
      provinceId: saleDocument.provinceId,

      // 🔧 FIX: Set current date safely
      date: formatDateForForm(new Date()),

      // Default status
      status: 'draft',
    };

    form.setFieldsValue(formData);

    debugLog('IncomeDaily', 'Form Pre-populated from Sale', {
      formData,
      saleDocument,
    });
  };

  // Handle create new document
  const handleCreateNew = () => {
    debugLog('IncomeDaily', 'Creating New Document', { category });

    setMode('CREATE');
    setSelectedDocument(null);
    setSelectedSaleDocument(null);
    setCurrentStep(0);
    setDocumentStatus('draft');

    // Reset form with default values
    form.resetFields();
    form.setFieldsValue({
      incomeCategory: 'daily',
      incomeSubCategory: category,
      // 🔧 FIX: Set current date safely
      date: formatDateForForm(new Date()),
      status: 'draft',
    });
  };

  // Handle save document
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      debugLog('IncomeDaily', 'Manual Save Triggered', {
        values,
        mode,
        selectedDocument: selectedDocument?.id,
      });

      await _onConfirmOrder(values, false);
    } catch (error) {
      console.error('Manual save error:', error);
      if (error.errorFields) {
        message.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      } else {
        message.error('เกิดข้อผิดพลาดในการบันทึก');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle submit for review
  const handleSubmitForReview = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Update status to submitted
      values.status = 'submitted';
      values.submittedAt = formatDateForForm(new Date());
      values.submittedBy = user?.uid;

      debugLog('IncomeDaily', 'Submit for Review', {
        values,
        mode,
        selectedDocument: selectedDocument?.id,
      });

      await _onConfirmOrder(values, false);
      setDocumentStatus('submitted');
      setCurrentStep(1);

      message.success('ส่งเอกสารเพื่อตรวจสอบเรียบร้อย');
    } catch (error) {
      console.error('Submit error:', error);
      if (error.errorFields) {
        message.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      } else {
        message.error('เกิดข้อผิดพลาดในการส่งเอกสาร');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setMode('SEARCH');
    setSelectedDocument(null);
    setSelectedSaleDocument(null);
    setCurrentStep(0);
    form.resetFields();
  };

  // Render search mode
  const renderSearchMode = () => (
    <div>
      {/* 🎨 MODERN DESIGN: Enhanced search interface */}
      <Card
        title={
          <Space>
            <SearchOutlined style={{ color: NATURE_COLORS.primary }} />
            <Text strong style={{ color: NATURE_COLORS.text }}>
              ค้นหาและจัดการเอกสารรายได้ประจำวัน
            </Text>
          </Space>
        }
        extra={
          <Space>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              style={{
                background: NATURE_COLORS.primary,
                borderColor: NATURE_COLORS.primary,
                borderRadius: '8px',
              }}
            >
              สร้างเอกสารใหม่
            </Button>
          </Space>
        }
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: `1px solid ${NATURE_COLORS.borderColor}`,
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Search Instructions */}
        <Alert
          message='วิธีการใช้งาน'
          description={
            <div>
              <p>
                • <strong>ค้นหาเอกสาร:</strong>{' '}
                ใช้ช่องค้นหาด้านล่างเพื่อค้นหาเอกสารที่มีอยู่
              </p>
              <p>
                • <strong>สร้างใหม่:</strong> คลิก &quot;สร้างเอกสารใหม่&quot;
                เพื่อสร้างเอกสารรายได้ใหม่
              </p>
              <p>
                • <strong>แก้ไข:</strong>{' '}
                เลือกเอกสารจากผลการค้นหาเพื่อแก้ไข/ตรวจสอบ/อนุมัติ
              </p>
            </div>
          }
          type='info'
          showIcon
          style={{
            marginBottom: '24px',
            borderRadius: '8px',
            backgroundColor: NATURE_COLORS.accent,
            borderColor: NATURE_COLORS.primary,
          }}
        />

        {/* Smart Document Search Component */}
        <SmartDocumentSearch
          onDocumentSelect={handleDocumentSelect}
          onSaleDocumentSelect={handleSaleDocumentSelect}
          category={category}
          onCategoryChange={setCategory}
        />
      </Card>
    </div>
  );

  // Render form mode with proper legacy component structure
  const renderFormMode = () => {
    // Determine which component to render based on category
    let currentView = null;

    switch (category) {
      case 'vehicles':
        currentView = (
          <IncomeVehicles
            onConfirm={(values, resetToInitial) =>
              _onConfirmOrder(values, resetToInitial)
            }
            order={
              selectedDocument || {
                incomeId: form.getFieldValue('incomeId'),
                incomeCategory: 'daily',
                incomeSubCategory: 'vehicles',
                ...form.getFieldsValue(),
              }
            }
            readOnly={!hasPermission('accounting.edit')}
            onBack={handleBackToSearch}
            isEdit={mode === 'EDIT'}
            reset={() => {
              form.resetFields();
              setSelectedDocument(null);
              setSelectedSaleDocument(null);
            }}
          />
        );
        break;
      case 'service':
        currentView = (
          <IncomeService
            onBack={handleBackToSearch}
            onConfirm={(values, resetToInitial) =>
              _onConfirmOrder(values, resetToInitial)
            }
            order={
              selectedDocument || {
                incomeId: form.getFieldValue('incomeId'),
                incomeCategory: 'daily',
                incomeSubCategory: 'service',
                ...form.getFieldsValue(),
              }
            }
            readOnly={!hasPermission('accounting.edit')}
            isEdit={mode === 'EDIT'}
            firestore={firestore}
            reset={() => {
              form.resetFields();
              setSelectedDocument(null);
              setSelectedSaleDocument(null);
            }}
          />
        );
        break;
      case 'parts':
        currentView = (
          <IncomeParts
            onBack={handleBackToSearch}
            onConfirm={(values, resetToInitial) =>
              _onConfirmOrder(values, resetToInitial)
            }
            order={
              selectedDocument || {
                incomeId: form.getFieldValue('incomeId'),
                incomeCategory: 'daily',
                incomeSubCategory: 'parts',
                ...form.getFieldsValue(),
              }
            }
            readOnly={!hasPermission('accounting.edit')}
            isEdit={mode === 'EDIT'}
            reset={() => {
              form.resetFields();
              setSelectedDocument(null);
              setSelectedSaleDocument(null);
            }}
          />
        );
        break;
      case 'other':
        currentView = (
          <IncomeOther
            onBack={handleBackToSearch}
            onConfirm={(values, resetToInitial) =>
              _onConfirmOrder(values, resetToInitial)
            }
            order={
              selectedDocument || {
                incomeId: form.getFieldValue('incomeId'),
                incomeCategory: 'daily',
                incomeSubCategory: 'other',
                ...form.getFieldsValue(),
              }
            }
            readOnly={!hasPermission('accounting.edit')}
            isEdit={mode === 'EDIT'}
          />
        );
        break;
      default:
        currentView = (
          <IncomeVehicles
            onConfirm={(values, resetToInitial) =>
              _onConfirmOrder(values, resetToInitial)
            }
            order={
              selectedDocument || {
                incomeId: form.getFieldValue('incomeId'),
                incomeCategory: 'daily',
                incomeSubCategory: 'vehicles',
                ...form.getFieldsValue(),
              }
            }
            readOnly={!hasPermission('accounting.edit')}
            onBack={handleBackToSearch}
            isEdit={mode === 'EDIT'}
            reset={() => {
              form.resetFields();
              setSelectedDocument(null);
              setSelectedSaleDocument(null);
            }}
          />
        );
        break;
    }

    return (
      <div>
        {/* 🎨 MODERN DESIGN: Enhanced category selection header */}
        <Card
          title={
            <Space>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background:
                    CATEGORY_CONFIG[category]?.gradient ||
                    NATURE_COLORS.primary,
                  color: 'white',
                }}
              >
                {CATEGORY_CONFIG[category]?.icon || <FileTextOutlined />}
              </div>
              <div>
                <Text
                  strong
                  style={{ color: NATURE_COLORS.text, fontSize: '16px' }}
                >
                  {mode === 'CREATE' ? 'สร้างเอกสารใหม่' : 'แก้ไขเอกสาร'}
                </Text>
                <div
                  style={{
                    fontSize: '12px',
                    color: NATURE_COLORS.textSecondary,
                  }}
                >
                  {IncomeDailyCategories[category]} -{' '}
                  {CATEGORY_CONFIG[category]?.description}
                </div>
              </div>
            </Space>
          }
          extra={
            <Space>
              {/* 🔧 FIX: Enhanced branch display */}
              {selectedDocument?.branchCode && (
                <Tooltip title='สาขาที่ดำเนินการ'>
                  <Tag
                    icon={<BranchesOutlined />}
                    color={NATURE_COLORS.primary}
                    style={{ borderRadius: '6px' }}
                  >
                    {formatBranchDisplay(selectedDocument.branchCode, false)}
                  </Tag>
                </Tooltip>
              )}

              {/* Document status badge */}
              <Badge
                status={
                  documentStatus === 'draft'
                    ? 'processing'
                    : documentStatus === 'submitted'
                      ? 'warning'
                      : 'success'
                }
                text={
                  documentStatus === 'draft'
                    ? 'ร่าง'
                    : documentStatus === 'submitted'
                      ? 'รอตรวจสอบ'
                      : documentStatus === 'approved'
                        ? 'อนุมัติแล้ว'
                        : 'เสร็จสิ้น'
                }
              />

              <Button
                type='link'
                onClick={handleBackToSearch}
                style={{ color: NATURE_COLORS.textSecondary }}
              >
                ← กลับไปค้นหา
              </Button>
            </Space>
          }
          style={{
            marginBottom: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: `1px solid ${NATURE_COLORS.borderColor}`,
          }}
          bodyStyle={{ padding: '20px' }}
        >
          {/* 🎨 MODERN DESIGN: Enhanced mode status */}
          <Alert
            message={
              <Space>
                {mode === 'CREATE' ? (
                  <CheckCircleOutlined
                    style={{ color: NATURE_COLORS.primary }}
                  />
                ) : (
                  <EditOutlined style={{ color: NATURE_COLORS.warning }} />
                )}
                <Text strong>
                  {mode === 'CREATE' ? 'โหมดสร้างใหม่' : 'โหมดแก้ไข'}
                </Text>
              </Space>
            }
            description={
              <div>
                {mode === 'CREATE' ? (
                  selectedSaleDocument ? (
                    <div>
                      <Text>สร้างเอกสารใหม่จากใบสั่งขาย: </Text>
                      <Text strong style={{ color: NATURE_COLORS.primary }}>
                        {selectedSaleDocument.saleOrderNumber}
                      </Text>
                      <br />
                      <Text type='secondary'>
                        ลูกค้า: {selectedSaleDocument.customerName}
                      </Text>
                    </div>
                  ) : (
                    'กรอกข้อมูลเพื่อสร้างเอกสารรายได้ประจำวันใหม่'
                  )
                ) : (
                  <div>
                    <Text>แก้ไขข้อมูลเอกสาร: </Text>
                    <Text strong style={{ color: NATURE_COLORS.primary }}>
                      {selectedDocument?.saleOrderNumber}
                    </Text>
                    <br />
                    <Space>
                      <Text type='secondary'>
                        ลูกค้า: {selectedDocument?.customerName}
                      </Text>
                      {selectedDocument?.branchCode && (
                        <>
                          <Divider type='vertical' />
                          <Text type='secondary'>
                            <BranchesOutlined />{' '}
                            {formatBranchDisplay(selectedDocument.branchCode)}
                          </Text>
                        </>
                      )}
                      {selectedDocument?.date && (
                        <>
                          <Divider type='vertical' />
                          <Text type='secondary'>
                            <CalendarOutlined />{' '}
                            {formatDateForDisplay(selectedDocument.date)}
                          </Text>
                        </>
                      )}
                    </Space>
                  </div>
                )}
              </div>
            }
            type={mode === 'CREATE' ? 'success' : 'info'}
            showIcon
            style={{
              marginBottom: '16px',
              borderRadius: '8px',
              backgroundColor:
                mode === 'CREATE' ? NATURE_COLORS.accent : '#e6f7ff',
              borderColor:
                mode === 'CREATE' ? NATURE_COLORS.primary : '#91d5ff',
            }}
          />

          {/* 🎨 MODERN DESIGN: Enhanced category selection */}
          <Row gutter={16} align='middle'>
            <Col md={12} sm={24}>
              <Form.Item
                label={
                  <Space>
                    <FileTextOutlined
                      style={{ color: NATURE_COLORS.primary }}
                    />
                    <Text strong>ประเภทการรับเงิน</Text>
                  </Space>
                }
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder='เลือกประเภทการรับเงิน'
                  onChange={(value) => {
                    setCategory(value);
                    debugLog('IncomeDaily', 'Category Changed', {
                      newCategory: value,
                      mode,
                    });
                  }}
                  value={category}
                  disabled={mode === 'EDIT'} // Disable category change in edit mode
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                  }}
                  size='large'
                >
                  {Object.keys(IncomeDailyCategories).map((type, i) => {
                    const config = CATEGORY_CONFIG[type] || {};
                    return (
                      <Option key={i} value={type}>
                        <Space>
                          <span style={{ color: config.color }}>
                            {config.icon}
                          </span>
                          <span>{IncomeDailyCategories[type]}</span>
                          <Text type='secondary' style={{ fontSize: '12px' }}>
                            {config.description}
                          </Text>
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col md={12} sm={24}>
              {/* Quick action buttons */}
              <Space>
                <Button
                  type='primary'
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={loading}
                  style={{
                    background: NATURE_COLORS.primary,
                    borderColor: NATURE_COLORS.primary,
                    borderRadius: '8px',
                  }}
                >
                  บันทึก
                </Button>
                {documentStatus === 'draft' && (
                  <Button
                    type='default'
                    icon={<SendOutlined />}
                    onClick={handleSubmitForReview}
                    loading={loading}
                    style={{
                      borderColor: NATURE_COLORS.warning,
                      color: NATURE_COLORS.warning,
                      borderRadius: '8px',
                    }}
                  >
                    ส่งตรวจสอบ
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Render the appropriate legacy component */}
        {currentView}

        {/* 🎨 MODERN DESIGN: Enhanced debug information */}
        {process.env.NODE_ENV === 'development' && (
          <Card
            title={
              <Space>
                <Text strong style={{ color: NATURE_COLORS.warning }}>
                  🔧 Debug Information
                </Text>
              </Space>
            }
            style={{
              marginTop: '16px',
              borderRadius: '8px',
              borderColor: NATURE_COLORS.warning,
            }}
            size='small'
          >
            <Row gutter={16}>
              <Col md={8} sm={24}>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <div>
                    <strong>Mode:</strong> {mode}
                  </div>
                  <div>
                    <strong>Category:</strong> {category}
                  </div>
                  <div>
                    <strong>Current Step:</strong> {currentStep}
                  </div>
                  <div>
                    <strong>Document Status:</strong> {documentStatus}
                  </div>
                </div>
              </Col>
              <Col md={8} sm={24}>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <div>
                    <strong>Selected Document:</strong>{' '}
                    {selectedDocument?.saleOrderNumber || 'None'}
                  </div>
                  <div>
                    <strong>Reference Sale:</strong>{' '}
                    {selectedSaleDocument?.saleOrderNumber || 'None'}
                  </div>
                  <div>
                    <strong>User:</strong>{' '}
                    {user?.displayName || 'Not Available'}
                  </div>
                  {selectedDocument?.branchCode && (
                    <div>
                      <strong>Branch:</strong>{' '}
                      {formatBranchDisplay(selectedDocument.branchCode)}
                    </div>
                  )}
                </div>
              </Col>
              <Col md={8} sm={24}>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <div>
                    <strong>Permissions:</strong>
                  </div>
                  <div>
                    Edit: {hasPermission('accounting.edit') ? '✅' : '❌'}
                  </div>
                  <div>
                    Review: {hasPermission('accounting.review') ? '✅' : '❌'}
                  </div>
                  <div>
                    Approve: {hasPermission('accounting.approve') ? '✅' : '❌'}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    );
  };

  if (!ready) {
    return (
      <LayoutWithRBAC
        title='รับเงินประจำวัน'
        subtitle='Management'
        permission='accounting.view'
        editPermission='accounting.edit'
        loading={true}
        showAuditSection={false}
        documentId={selectedDocument?.id}
        documentType='income_daily'
        showStepper={true}
        steps={INCOME_DAILY_STEPS}
        currentStep={mProps.activeStep}
        onStepClick={(step) => setProps({ activeStep: step })}
      >
        <div />
      </LayoutWithRBAC>
    );
  }

  return (
    <LayoutWithRBAC
      title='รับเงินประจำวัน'
      subtitle='Accounting Management'
      permission='accounting.view'
      editPermission='accounting.edit'
      requireBranchSelection={false}
      autoInjectProvinceId={true}
      showAuditSection={true}
      showAuditTrail={true}
      documentId={selectedDocument?.id}
      documentType='income_daily'
      showStepper={true}
      steps={INCOME_DAILY_STEPS}
      currentStep={mProps.activeStep}
      onStepClick={(step) => setProps({ activeStep: step })}
    >
      {mode === 'SEARCH' ? renderSearchMode() : renderFormMode()}
    </LayoutWithRBAC>
  );
};

export default IncomeDaily;
