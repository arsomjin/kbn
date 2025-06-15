// Enhanced Audit Trail Section with Form Context Fix

import React, { useEffect } from 'react';
import {
  Row,
  Col,
  Form,
  Tooltip,
  Divider,
  Typography,
  Card,
  Space,
  Alert,
} from 'antd';
import { DatePicker } from 'elements';
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import EmployeeSelector from '../EmployeeSelector';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../PermissionGate';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

const { Text } = Typography;

// 🚀 DEBUG: Enhanced logging utility
const debugLog = (component, action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 [${component}] ${action}`);
    console.log('📊 Data:', data);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

const EnhancedAuditTrailSection = ({
  // Auto-capture props (NEW)
  enableAutoCapture = true,
  currentUser = null,
  currentStep = 0,
  documentStatus = 'draft',

  // Legacy props (for backward compatibility)
  canEditEditedBy = false,
  canEditReviewedBy = false,
  canEditApprovedBy = false,
  showDivider = true,
  layout = 'horizontal',
  size = 'default',
  labelStyle = {},

  // Labels
  editedByLabel = 'ผู้แก้ไข',
  reviewedByLabel = 'ผู้ตรวจสอบ',
  approvedByLabel = 'ผู้อนุมัติ',
  editDateLabel = 'วันที่แก้ไข',
  reviewDateLabel = 'วันที่ตรวจสอบ',
  approveDateLabel = 'วันที่อนุมัติ',

  // Permissions
  editPermission = 'accounting.edit',
  reviewPermission = 'accounting.review',
  approvePermission = 'accounting.approve',

  // Form field paths
  editedByPath = ['auditTrail', 0, 'userInfo', 'name'],
  reviewedByPath = ['auditTrail', 1, 'userInfo', 'name'],
  approvedByPath = ['auditTrail', 2, 'userInfo', 'name'],
  editDatePath = ['auditTrail', 0, 'time'],
  reviewDatePath = ['auditTrail', 1, 'time'],
  approveDatePath = ['auditTrail', 2, 'time'],

  // Debug props
  enableDebugMode = process.env.NODE_ENV === 'development',
}) => {
  const { hasPermission } = usePermissions();
  const { user } = useSelector((state) => state.auth);

  // 🚀 FIX: Use Form.useFormInstance() safely - always call the hook
  const form = Form.useFormInstance?.() || null;

  // Check if form context is available
  const hasFormContext = !!form;
  if (!hasFormContext) {
    debugLog('EnhancedAuditTrailSection', 'Form Context Not Available', {
      message:
        'Component not wrapped in Form or Form.useFormInstance not available',
    });
  }

  // Use current user from Redux if not provided
  const effectiveCurrentUser = currentUser || user;

  // 🚀 DEBUG: Component initialization
  useEffect(() => {
    debugLog('EnhancedAuditTrailSection', 'Component Initialized', {
      enableAutoCapture,
      currentUser: effectiveCurrentUser,
      currentStep,
      documentStatus,
      hasFormContext,
      permissions: {
        edit: hasPermission(editPermission),
        review: hasPermission(reviewPermission),
        approve: hasPermission(approvePermission),
      },
    });
  }, []);

  // 🚀 AUTO-CAPTURE: Automatically fill audit fields based on current step
  useEffect(() => {
    if (!enableAutoCapture || !effectiveCurrentUser || !form) return;

    debugLog('EnhancedAuditTrailSection', 'Auto-Capture Triggered', {
      currentStep,
      documentStatus,
      currentUser: effectiveCurrentUser.displayName || effectiveCurrentUser.uid,
    });

    const now = dayjs();
    const userInfo = {
      uid: effectiveCurrentUser.uid,
      name: effectiveCurrentUser.displayName || effectiveCurrentUser.email,
      email: effectiveCurrentUser.email,
    };

    // Auto-fill based on current step and permissions
    if (currentStep >= 0 && hasPermission(editPermission)) {
      const editFields = {};
      editFields[editedByPath.join('.')] = userInfo.name;
      editFields[editDatePath.join('.')] = now;
      form.setFieldsValue(editFields);
      debugLog('EnhancedAuditTrailSection', 'Auto-Filled Editor Info', {
        userInfo,
        timestamp: now.format(),
      });
    }

    if (
      currentStep >= 1 &&
      hasPermission(reviewPermission) &&
      ['review', 'approved'].includes(documentStatus)
    ) {
      const reviewFields = {};
      reviewFields[reviewedByPath.join('.')] = userInfo.name;
      reviewFields[reviewDatePath.join('.')] = now;
      form.setFieldsValue(reviewFields);
      debugLog('EnhancedAuditTrailSection', 'Auto-Filled Reviewer Info', {
        userInfo,
        timestamp: now.format(),
      });
    }

    if (
      currentStep >= 2 &&
      hasPermission(approvePermission) &&
      documentStatus === 'approved'
    ) {
      const approveFields = {};
      approveFields[approvedByPath.join('.')] = userInfo.name;
      approveFields[approveDatePath.join('.')] = now;
      form.setFieldsValue(approveFields);
      debugLog('EnhancedAuditTrailSection', 'Auto-Filled Approver Info', {
        userInfo,
        timestamp: now.format(),
      });
    }
  }, [
    currentStep,
    documentStatus,
    effectiveCurrentUser,
    enableAutoCapture,
    form,
  ]);

  // Determine effective permissions
  const effectiveCanEditEditedBy =
    canEditEditedBy && hasPermission(editPermission);
  const effectiveCanEditReviewedBy =
    canEditReviewedBy && hasPermission(reviewPermission);
  const effectiveCanEditApprovedBy =
    canEditApprovedBy && hasPermission(approvePermission);

  // Common label style
  const getLabelStyle = (isRequired = false) => ({
    fontWeight: 500,
    ...labelStyle,
    ...(isRequired && { fontWeight: 600 }),
  });

  // 🚀 ENHANCED: Smart field renderer with auto-capture
  const renderSmartField = (
    label,
    fieldPath,
    canEdit,
    isRequired,
    component,
    icon,
    stepIndex,
    tooltipMessage = 'คุณไม่มีสิทธิ์ในการแก้ไขฟิลด์นี้'
  ) => {
    const isCurrentStep = currentStep === stepIndex;
    const isCompleted = currentStep > stepIndex;
    const fieldKey = fieldPath.join('.');

    return (
      <Form.Item
        name={fieldPath}
        label={
          <Space size='small'>
            {icon}
            <span style={getLabelStyle(isRequired)}>
              {isRequired && '* '}
              {label}
            </span>
            {isCurrentStep && (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            )}
            {isCompleted && (
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
            )}
          </Space>
        }
        rules={[
          {
            required: canEdit && isRequired,
            message: `กรุณา${component === 'date' ? 'เลือก' : 'ระบุ'}${label}`,
          },
        ]}
      >
        {canEdit || enableAutoCapture ? (
          component === 'date' ? (
            <DatePicker
              disabled={!canEdit && !isCurrentStep}
              style={{ width: '100%' }}
              format='DD/MM/YYYY HH:mm'
              showTime
              placeholder={`เลือก${label}`}
              onChange={(value) => {
                debugLog(
                  'EnhancedAuditTrailSection',
                  `Date Changed - ${label}`,
                  {
                    field: fieldKey,
                    value: value?.format(),
                    step: stepIndex,
                    isCurrentStep,
                  }
                );
              }}
            />
          ) : (
            <EmployeeSelector
              disabled={!canEdit && !isCurrentStep}
              placeholder={`เลือก${label}`}
              onChange={(value) => {
                debugLog(
                  'EnhancedAuditTrailSection',
                  `Employee Changed - ${label}`,
                  {
                    field: fieldKey,
                    value,
                    step: stepIndex,
                    isCurrentStep,
                  }
                );
              }}
            />
          )
        ) : (
          <Tooltip title={tooltipMessage}>
            <span style={{ display: 'block' }}>
              {component === 'date' ? (
                <DatePicker
                  disabled={true}
                  style={{ width: '100%' }}
                  format='DD/MM/YYYY HH:mm'
                  showTime
                  placeholder={`เลือก${label}`}
                />
              ) : (
                <EmployeeSelector
                  disabled={true}
                  placeholder={`เลือก${label}`}
                />
              )}
            </span>
          </Tooltip>
        )}
      </Form.Item>
    );
  };

  // Responsive column configuration
  const getColProps = () => {
    if (layout === 'vertical') {
      return { xs: 24, sm: 24, md: 24, lg: 24 };
    }
    return { xs: 24, sm: 24, md: 8, lg: 8 };
  };

  // If no form context, show warning
  if (!hasFormContext) {
    return (
      <Alert
        message='Form Context Required'
        description='EnhancedAuditTrailSection must be used within a Form component.'
        type='warning'
        showIcon
        style={{ margin: '16px 0' }}
      />
    );
  }

  return (
    <>
      {showDivider && <Divider />}

      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>ข้อมูลการตรวจสอบและอนุมัติ</Text>
            {enableAutoCapture && (
              <Text type='secondary' style={{ fontSize: '12px' }}>
                (บันทึกอัตโนมัติ)
              </Text>
            )}
          </Space>
        }
        className='audit-trail-section'
        style={{ marginBottom: '16px' }}
      >
        {/* Auto-Capture Status */}
        {enableAutoCapture && (
          <Alert
            message='ระบบบันทึกข้อมูลการตรวจสอบอัตโนมัติ'
            description={`ขั้นตอนปัจจุบัน: ${currentStep + 1} | สถานะ: ${documentStatus} | ผู้ใช้: ${effectiveCurrentUser?.displayName || 'ไม่ระบุ'}`}
            type='info'
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Row gutter={16}>
          {/* Editor Section */}
          <Col {...getColProps()}>
            <PermissionGate permission={editPermission}>
              <div className='space-y-4'>
                {renderSmartField(
                  editedByLabel,
                  editedByPath,
                  effectiveCanEditEditedBy,
                  true,
                  'employee',
                  <UserOutlined />,
                  0,
                  'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้แก้ไข'
                )}

                {renderSmartField(
                  editDateLabel,
                  editDatePath,
                  effectiveCanEditEditedBy,
                  true,
                  'date',
                  <CalendarOutlined />,
                  0,
                  'คุณไม่มีสิทธิ์ในการแก้ไขวันที่แก้ไข'
                )}
              </div>
            </PermissionGate>
          </Col>

          {/* Reviewer Section */}
          <Col {...getColProps()}>
            <PermissionGate permission={reviewPermission}>
              <div className='space-y-4'>
                {renderSmartField(
                  reviewedByLabel,
                  reviewedByPath,
                  effectiveCanEditReviewedBy,
                  true,
                  'employee',
                  <UserOutlined />,
                  1,
                  'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ตรวจสอบ'
                )}

                {renderSmartField(
                  reviewDateLabel,
                  reviewDatePath,
                  effectiveCanEditReviewedBy,
                  true,
                  'date',
                  <CalendarOutlined />,
                  1,
                  'คุณไม่มีสิทธิ์ในการแก้ไขวันที่ตรวจสอบ'
                )}
              </div>
            </PermissionGate>
          </Col>

          {/* Approver Section */}
          <Col {...getColProps()}>
            <PermissionGate permission={approvePermission}>
              <div className='space-y-4'>
                {renderSmartField(
                  approvedByLabel,
                  approvedByPath,
                  effectiveCanEditApprovedBy,
                  true,
                  'employee',
                  <UserOutlined />,
                  2,
                  'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้อนุมัติ'
                )}

                {renderSmartField(
                  approveDateLabel,
                  approveDatePath,
                  effectiveCanEditApprovedBy,
                  true,
                  'date',
                  <CalendarOutlined />,
                  2,
                  'คุณไม่มีสิทธิ์ในการแก้ไขวันที่อนุมัติ'
                )}
              </div>
            </PermissionGate>
          </Col>
        </Row>

        {/* Debug Information */}
        {enableDebugMode && (
          <Alert
            message='🔧 Debug Information'
            description={
              <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <div>Current Step: {currentStep}</div>
                <div>Document Status: {documentStatus}</div>
                <div>Auto-Capture: {enableAutoCapture ? 'ON' : 'OFF'}</div>
                <div>
                  Form Context: {hasFormContext ? 'Available' : 'Missing'}
                </div>
                <div>
                  User: {effectiveCurrentUser?.displayName || 'Not Available'}
                </div>
                <div>
                  Permissions: Edit(
                  {hasPermission(editPermission) ? '✅' : '❌'}) | Review(
                  {hasPermission(reviewPermission) ? '✅' : '❌'}) | Approve(
                  {hasPermission(approvePermission) ? '✅' : '❌'})
                </div>
              </div>
            }
            type='warning'
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>
    </>
  );
};

EnhancedAuditTrailSection.propTypes = {
  // Auto-capture props
  enableAutoCapture: PropTypes.bool,
  currentUser: PropTypes.object,
  currentStep: PropTypes.number,
  documentStatus: PropTypes.string,

  // Legacy props
  canEditEditedBy: PropTypes.bool,
  canEditReviewedBy: PropTypes.bool,
  canEditApprovedBy: PropTypes.bool,
  showDivider: PropTypes.bool,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  labelStyle: PropTypes.object,

  // Labels
  editedByLabel: PropTypes.string,
  reviewedByLabel: PropTypes.string,
  approvedByLabel: PropTypes.string,
  editDateLabel: PropTypes.string,
  reviewDateLabel: PropTypes.string,
  approveDateLabel: PropTypes.string,

  // Permissions
  editPermission: PropTypes.string,
  reviewPermission: PropTypes.string,
  approvePermission: PropTypes.string,

  // Form paths
  editedByPath: PropTypes.array,
  reviewedByPath: PropTypes.array,
  approvedByPath: PropTypes.array,
  editDatePath: PropTypes.array,
  reviewDatePath: PropTypes.array,
  approveDatePath: PropTypes.array,

  // Debug
  enableDebugMode: PropTypes.bool,
};

export default EnhancedAuditTrailSection;
