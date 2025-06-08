import React from 'react';
import { Row, Col, Form, DatePicker, Tooltip, Divider, Typography } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import EmployeeSelector from '../EmployeeSelector';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../PermissionGate';

const { Text } = Typography;

const AuditTrailSection = ({
  canEditEditedBy = false,
  canEditReviewedBy = false,
  canEditApprovedBy = false,
  showDivider = true,
  layout = 'horizontal',
  size = 'default',
  labelStyle = {},
  // Additional customization
  editedByLabel = 'ผู้แก้ไข',
  reviewedByLabel = 'ผู้ตรวจสอบ',
  approvedByLabel = 'ผู้อนุมัติ',
  editDateLabel = 'วันที่แก้ไข',
  reviewDateLabel = 'วันที่ตรวจสอบ',
  approveDateLabel = 'วันที่อนุมัติ',
  // Permission overrides - use document flow permissions
  editPermission = 'accounting.edit',
  reviewPermission = 'accounting.review',
  approvePermission = 'accounting.approve',
  // Form field paths
  editedByPath = ['auditTrail', 0, 'userInfo', 'name'],
  reviewedByPath = ['auditTrail', 1, 'userInfo', 'name'],
  approvedByPath = ['auditTrail', 2, 'userInfo', 'name'],
  editDatePath = ['auditTrail', 0, 'time'],
  reviewDatePath = ['auditTrail', 1, 'time'],
  approveDatePath = ['auditTrail', 2, 'time']
}) => {
  const { hasPermission } = usePermissions();

  // Determine effective permissions
  const effectiveCanEditEditedBy = canEditEditedBy && hasPermission(editPermission);
  const effectiveCanEditReviewedBy = canEditReviewedBy && hasPermission(reviewPermission);
  const effectiveCanEditApprovedBy = canEditApprovedBy && hasPermission(approvePermission);

  // Common label style
  const getLabelStyle = (isRequired = false) => ({
    fontWeight: 500,
    ...labelStyle,
    ...(isRequired && { fontWeight: 600 })
  });

  // Render field with permission check
  const renderField = (
    label,
    fieldPath,
    canEdit,
    isRequired,
    component,
    icon,
    tooltipMessage = 'คุณไม่มีสิทธิ์ในการแก้ไขฟิลด์นี้'
  ) => (
    <Form.Item
      name={fieldPath}
      label={
        <span style={getLabelStyle(isRequired)}>
          {icon && <span className="mr-1">{icon}</span>}
          {isRequired && '* '}
          {label}
        </span>
      }
      rules={[
        { 
          required: canEdit && isRequired, 
          message: `กรุณา${component === 'date' ? 'เลือก' : 'ระบุ'}${label}` 
        }
      ]}
    >
      {canEdit ? (
        component === 'date' ? (
          <DatePicker 
            disabled={false} 
            style={{ width: '100%' }}
            format="DD/MM/YYYY HH:mm"
            showTime
            placeholder={`เลือก${label}`}
          />
        ) : (
          <EmployeeSelector 
            disabled={false}
            placeholder={`เลือก${label}`}
          />
        )
      ) : (
        <Tooltip title={tooltipMessage}>
          <span style={{ display: 'block' }}>
            {component === 'date' ? (
              <DatePicker 
                disabled={true} 
                style={{ width: '100%' }}
                format="DD/MM/YYYY HH:mm"
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

  // Responsive column configuration
  const getColProps = () => {
    if (layout === 'vertical') {
      return { xs: 24, sm: 24, md: 24, lg: 24 };
    }
    return { xs: 24, sm: 24, md: 8, lg: 8 };
  };

  return (
    <>
      {showDivider && <Divider />}
      
      <div className="audit-trail-section">
        {/* Section Title */}
        <div className="mb-4">
          <Text strong className="text-lg">
            ข้อมูลการตรวจสอบและอนุมัติ
          </Text>
          <Text className="block text-sm text-gray-500 mt-1">
            กรอกข้อมูลผู้รับผิดชอบในแต่ละขั้นตอน
          </Text>
        </div>

        <Row gutter={16} className="mb-4 mt-4 p-2">
          {/* Editor Section */}
          <Col {...getColProps()}>
            <PermissionGate permission={editPermission}>
              <div className="space-y-4">
                {renderField(
                  editedByLabel,
                  editedByPath,
                  effectiveCanEditEditedBy,
                  true,
                  'employee',
                  <UserOutlined />,
                  'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้แก้ไข'
                )}
                
                {renderField(
                  editDateLabel,
                  editDatePath,
                  effectiveCanEditEditedBy,
                  true,
                  'date',
                  <CalendarOutlined />,
                  'คุณไม่มีสิทธิ์ในการแก้ไขวันที่แก้ไข'
                )}
              </div>
            </PermissionGate>
          </Col>

          {/* Reviewer Section */}
          <Col {...getColProps()}>
            <PermissionGate permission={reviewPermission}>
              <div className="space-y-4">
                {renderField(
                  reviewedByLabel,
                  reviewedByPath,
                  effectiveCanEditReviewedBy,
                  true,
                  'employee',
                  <UserOutlined />,
                  'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ตรวจสอบ'
                )}
                
                {renderField(
                  reviewDateLabel,
                  reviewDatePath,
                  effectiveCanEditReviewedBy,
                  true,
                  'date',
                  <CalendarOutlined />,
                  'คุณไม่มีสิทธิ์ในการแก้ไขวันที่ตรวจสอบ'
                )}
              </div>
            </PermissionGate>
          </Col>

          {/* Approver Section */}
          <Col {...getColProps()}>
            <PermissionGate permission={approvePermission}>
              <div className="space-y-4">
                {renderField(
                  approvedByLabel,
                  approvedByPath,
                  effectiveCanEditApprovedBy,
                  true,
                  'employee',
                  <UserOutlined />,
                  'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้อนุมัติ'
                )}
                
                {renderField(
                  approveDateLabel,
                  approveDatePath,
                  effectiveCanEditApprovedBy,
                  true,
                  'date',
                  <CalendarOutlined />,
                  'คุณไม่มีสิทธิ์ในการแก้ไขวันที่อนุมัติ'
                )}
              </div>
            </PermissionGate>
          </Col>
        </Row>

        {/* Permission Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <Text className="text-sm text-blue-600">
            <strong>หมายเหตุ:</strong> การแสดงและแก้ไขข้อมูลในส่วนนี้ขึ้นอยู่กับสิทธิ์ของผู้ใช้งาน
          </Text>
          <ul className="mt-2 text-sm text-blue-600 mb-0">
            <li>• ผู้แก้ไข: ต้องมีสิทธิ์ audit.edit</li>
            <li>• ผู้ตรวจสอบ: ต้องมีสิทธิ์ audit.review</li>
            <li>• ผู้อนุมัติ: ต้องมีสิทธิ์ audit.approve</li>
          </ul>
        </div>
      </div>
    </>
  );
};

AuditTrailSection.propTypes = {
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
  approveDatePath: PropTypes.array
};

export default AuditTrailSection; 