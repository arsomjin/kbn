/**
 * Document Approval Flow System
 * 
 * A comprehensive, reusable approval workflow system that integrates with
 * LayoutWithRBAC to provide complete document approval functionality.
 * 
 * Features:
 * - Multi-step approval workflows
 * - RBAC-based permission checking
 * - Audit trail integration
 * - Status management
 * - Geographic context awareness
 * - Customizable for different document types
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  Alert, 
  Tag,
  Divider,
  Row,
  Col,
  Tooltip,
  Progress
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SendOutlined,
  UndoOutlined
} from '@ant-design/icons';

import { usePermissions } from '../../hooks/usePermissions';
import { useAuditTrail } from '../../hooks/useAuditTrail';
import { showPermissionWarning } from '../../utils/permissionWarnings';
import PermissionButton, { ApproveButton } from '../PermissionButton';
import PermissionGate from '../PermissionGate';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Document approval flow configuration for different document types
 */
const DOCUMENT_APPROVAL_CONFIGS = {
  // Accounting documents
  'invoice': {
    department: 'accounting',
    steps: [
      { title: 'สร้างใบแจ้งหนี้', status: 'draft', permission: 'accounting.edit' },
      { title: 'ตรวจสอบข้อมูล', status: 'review', permission: 'accounting.review' },
      { title: 'อนุมัติใบแจ้งหนี้', status: 'approved', permission: 'accounting.approve' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'accounting.view' }
    ],
    statusLabels: {
      'draft': 'ฉบับร่าง',
      'review': 'รอตรวจสอบ',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },
  
  // KBN-specific: Income Daily (Accounting)
  'income_daily': {
    department: 'accounting',
    steps: [
      { title: 'บันทึกข้อมูล', status: 'draft', permission: 'accounting.edit' },
      { title: 'ตรวจสอบ', status: 'review', permission: 'accounting.review' },
      { title: 'อนุมัติ', status: 'approved', permission: 'accounting.approve' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'accounting.view' }
    ],
    statusLabels: {
      'draft': 'บันทึกข้อมูล',
      'review': 'รอตรวจสอบ',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },
  
  // Sales documents
  'sales_order': {
    department: 'sales',
    steps: [
      { title: 'สร้างใบสั่งขาย', status: 'draft', permission: 'sales.edit' },
      { title: 'ตรวจสอบราคา', status: 'price_review', permission: 'sales.review' },
      { title: 'อนุมัติการขาย', status: 'approved', permission: 'sales.approve' },
      { title: 'จัดส่งสินค้า', status: 'delivered', permission: 'sales.fulfill' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'sales.view' }
    ],
    statusLabels: {
      'draft': 'ฉบับร่าง',
      'price_review': 'รอตรวจสอบราคา',
      'approved': 'อนุมัติแล้ว',
      'delivered': 'จัดส่งแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },
  
  // KBN-specific: Sales Booking
  'sales_booking': {
    department: 'sales',
    steps: [
      { title: 'บันทึกข้อมูล', status: 'draft', permission: 'sales.edit' },
      { title: 'ตรวจสอบ', status: 'review', permission: 'sales.review' },
      { title: 'อนุมัติ', status: 'approved', permission: 'sales.approve' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'sales.view' }
    ],
    statusLabels: {
      'draft': 'บันทึกข้อมูล',
      'review': 'รอตรวจสอบ',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },

  // KBN-specific: Sales Vehicle
  'sales_vehicle': {
    department: 'sales',
    steps: [
      { title: 'บันทึกข้อมูล', status: 'draft', permission: 'sales.edit' },
      { title: 'ตรวจสอบ', status: 'review', permission: 'sales.review' },
      { title: 'อนุมัติ', status: 'approved', permission: 'sales.approve' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'sales.view' }
    ],
    statusLabels: {
      'draft': 'บันทึกข้อมูล',
      'review': 'รอตรวจสอบ',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },
  
  // Service documents
  'service_order': {
    department: 'service',
    steps: [
      { title: 'รับงานซ่อม', status: 'received', permission: 'service.edit' },
      { title: 'ประเมินงาน', status: 'assessed', permission: 'service.assess' },
      { title: 'อนุมัติซ่อม', status: 'approved', permission: 'service.approve' },
      { title: 'ดำเนินการซ่อม', status: 'in_progress', permission: 'service.execute' },
      { title: 'ตรวจสอบคุณภาพ', status: 'quality_check', permission: 'service.quality' },
      { title: 'ส่งมอบงาน', status: 'completed', permission: 'service.complete' }
    ],
    statusLabels: {
      'received': 'รับงานแล้ว',
      'assessed': 'ประเมินแล้ว',
      'approved': 'อนุมัติแล้ว',
      'in_progress': 'กำลังดำเนินการ',
      'quality_check': 'ตรวจสอบคุณภาพ',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },
  
  // Inventory documents
  'inventory_import': {
    department: 'inventory',
    steps: [
      { title: 'สร้างใบนำเข้า', status: 'draft', permission: 'inventory.edit' },
      { title: 'ตรวจสอบสินค้า', status: 'inspection', permission: 'inventory.inspect' },
      { title: 'อนุมัตินำเข้า', status: 'approved', permission: 'inventory.approve' },
      { title: 'บันทึกเข้าคลัง', status: 'recorded', permission: 'inventory.record' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'inventory.view' }
    ],
    statusLabels: {
      'draft': 'ฉบับร่าง',
      'inspection': 'รอตรวจสอบ',
      'approved': 'อนุมัติแล้ว',
      'recorded': 'บันทึกแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  },
  
  // Generic document (fallback)
  'generic': {
    department: 'accounting',
    steps: [
      { title: 'สร้างเอกสาร', status: 'draft', permission: 'accounting.edit' },
      { title: 'ตรวจสอบ', status: 'review', permission: 'accounting.review' },
      { title: 'อนุมัติ', status: 'approved', permission: 'accounting.approve' },
      { title: 'เสร็จสิ้น', status: 'completed', permission: 'accounting.view' }
    ],
    statusLabels: {
      'draft': 'ฉบับร่าง',
      'review': 'รอตรวจสอบ',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ปฏิเสธ',
      'completed': 'เสร็จสิ้น'
    }
  }
};

/**
 * Document Approval Flow Component
 * @param {Object} props
 * @param {string} props.documentId - Document ID
 * @param {string} props.documentType - Document type (invoice, sales_order, etc.)
 * @param {string} props.currentStatus - Current document status
 * @param {number} props.currentStep - Current step index
 * @param {Object} props.documentData - Document data
 * @param {Function} props.onStatusChange - Status change callback
 * @param {Function} props.onStepChange - Step change callback
 * @param {Function} props.onApprove - Approval callback
 * @param {Function} props.onReject - Rejection callback
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onSave - Save callback
 * @param {boolean} props.showActions - Show action buttons
 * @param {boolean} props.showProgress - Show progress indicator
 * @param {boolean} props.compact - Compact mode
 * @param {Object} props.customConfig - Custom approval configuration
 */
const DocumentApprovalFlow = ({
  documentId,
  documentType = 'generic',
  currentStatus = 'draft',
  currentStep = 0,
  documentData = {},
  onStatusChange,
  onStepChange,
  onApprove,
  onReject,
  onSubmit,
  onSave,
  showActions = true,
  showProgress = true,
  compact = false,
  customConfig = null,
  className = '',
  style = {}
}) => {
  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Hooks
  const { hasPermission, userRBAC } = usePermissions();
  const auditTrail = useAuditTrail({
    documentType,
    documentId,
    collection: `${documentType}s`,
    enabled: !!documentId
  });

  // Get approval configuration
  const config = useMemo(() => {
    return customConfig || DOCUMENT_APPROVAL_CONFIGS[documentType] || DOCUMENT_APPROVAL_CONFIGS.generic;
  }, [documentType, customConfig]);

  // Calculate current step based on status
  const calculatedStep = useMemo(() => {
    if (currentStep !== undefined && currentStep !== null) {
      return currentStep;
    }
    
    const stepIndex = config.steps.findIndex(step => step.status === currentStatus);
    return stepIndex >= 0 ? stepIndex : 0;
  }, [currentStatus, currentStep, config.steps]);

  // Permission checks
  const permissions = useMemo(() => {
    const currentStepConfig = config.steps[calculatedStep];
    const nextStepConfig = config.steps[calculatedStep + 1];
    
    return {
      canView: hasPermission(`${config.department}.view`),
      canEdit: hasPermission(`${config.department}.edit`),
      canReview: hasPermission(`${config.department}.review`),
      canApprove: hasPermission(`${config.department}.approve`),
      canCurrentStep: currentStepConfig ? hasPermission(currentStepConfig.permission) : false,
      canNextStep: nextStepConfig ? hasPermission(nextStepConfig.permission) : false,
      canReject: hasPermission(`${config.department}.approve`) || hasPermission(`${config.department}.review`)
    };
  }, [config, calculatedStep, hasPermission]);

  // Status helpers
  const getStatusColor = useCallback((status) => {
    const colors = {
      'draft': '#d9d9d9',
      'review': '#faad14',
      'approved': '#52c41a',
      'rejected': '#ff4d4f',
      'completed': '#52c41a',
      'in_progress': '#1890ff',
      'pending': '#faad14'
    };
    return colors[status] || '#d9d9d9';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      'draft': <FileTextOutlined />,
      'review': <ClockCircleOutlined />,
      'approved': <CheckCircleOutlined />,
      'rejected': <CloseCircleOutlined />,
      'completed': <CheckCircleOutlined />,
      'in_progress': <ClockCircleOutlined />,
      'pending': <ExclamationCircleOutlined />
    };
    return icons[status] || <FileTextOutlined />;
  }, []);

  // Action handlers
  const handleApprove = useCallback(async () => {
    if (!permissions.canApprove) {
      showPermissionWarning('CANNOT_APPROVE', {
        context: `ต้องการสิทธิ์ ${config.department}.approve`
      });
      return;
    }

    setIsProcessing(true);
    try {
      const nextStep = calculatedStep + 1;
      const nextStatus = config.steps[nextStep]?.status || 'approved';
      
      // Create approval data
      const approvalData = {
        status: nextStatus,
        step: nextStep,
        approvedBy: userRBAC?.uid,
        approvedAt: Date.now(),
        approvalComment,
        previousStatus: currentStatus
      };

      // Call audit trail approval
      if (auditTrail.approveDocument) {
        await auditTrail.approveDocument(approvalComment || 'อนุมัติเอกสาร');
      }

      // Call parent callbacks
      if (onApprove) {
        await onApprove(approvalData);
      }
      
      if (onStatusChange) {
        await onStatusChange(nextStatus, approvalData);
      }
      
      if (onStepChange) {
        await onStepChange(nextStep, approvalData);
      }

      setShowApprovalModal(false);
      setApprovalComment('');
      
    } catch (error) {
      console.error('Approval failed:', error);
      showPermissionWarning('NO_PERMISSION', {
        customMessage: {
          title: 'การอนุมัติไม่สำเร็จ',
          description: error.message || 'เกิดข้อผิดพลาดในการอนุมัติเอกสาร'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    permissions.canApprove, 
    config, 
    calculatedStep, 
    currentStatus, 
    approvalComment, 
    userRBAC, 
    auditTrail,
    onApprove, 
    onStatusChange, 
    onStepChange
  ]);

  const handleReject = useCallback(async () => {
    if (!permissions.canReject) {
      showPermissionWarning('CANNOT_APPROVE', {
        context: `ต้องการสิทธิ์ ${config.department}.approve หรือ ${config.department}.review`
      });
      return;
    }

    if (!rejectionReason.trim()) {
      showPermissionWarning('NO_PERMISSION', {
        customMessage: {
          title: 'กรุณาระบุเหตุผล',
          description: 'กรุณาระบุเหตุผลในการปฏิเสธเอกสาร'
        }
      });
      return;
    }

    setIsProcessing(true);
    try {
      const rejectionData = {
        status: 'rejected',
        step: calculatedStep,
        rejectedBy: userRBAC?.uid,
        rejectedAt: Date.now(),
        rejectionReason,
        previousStatus: currentStatus
      };

      // Call audit trail rejection
      if (auditTrail.rejectDocument) {
        await auditTrail.rejectDocument(rejectionReason);
      }

      // Call parent callbacks
      if (onReject) {
        await onReject(rejectionData);
      }
      
      if (onStatusChange) {
        await onStatusChange('rejected', rejectionData);
      }

      setShowRejectionModal(false);
      setRejectionReason('');
      
    } catch (error) {
      console.error('Rejection failed:', error);
      showPermissionWarning('NO_PERMISSION', {
        customMessage: {
          title: 'การปฏิเสธไม่สำเร็จ',
          description: error.message || 'เกิดข้อผิดพลาดในการปฏิเสธเอกสาร'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    permissions.canReject,
    config,
    calculatedStep,
    currentStatus,
    rejectionReason,
    userRBAC,
    auditTrail,
    onReject,
    onStatusChange
  ]);

  const handleSubmitForReview = useCallback(async () => {
    if (!permissions.canEdit) {
      showPermissionWarning('CANNOT_EDIT', {
        context: `ต้องการสิทธิ์ ${config.department}.edit`
      });
      return;
    }

    setIsProcessing(true);
    try {
      const nextStep = calculatedStep + 1;
      const nextStatus = config.steps[nextStep]?.status || 'review';
      
      const submitData = {
        status: nextStatus,
        step: nextStep,
        submittedBy: userRBAC?.uid,
        submittedAt: Date.now(),
        previousStatus: currentStatus
      };

      // Call parent callbacks
      if (onSubmit) {
        await onSubmit(submitData);
      }
      
      if (onStatusChange) {
        await onStatusChange(nextStatus, submitData);
      }
      
      if (onStepChange) {
        await onStepChange(nextStep, submitData);
      }

    } catch (error) {
      console.error('Submit failed:', error);
      showPermissionWarning('NO_PERMISSION', {
        customMessage: {
          title: 'การส่งเอกสารไม่สำเร็จ',
          description: error.message || 'เกิดข้อผิดพลาดในการส่งเอกสาร'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    permissions.canEdit,
    config,
    calculatedStep,
    currentStatus,
    userRBAC,
    onSubmit,
    onStatusChange,
    onStepChange
  ]);

  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress) return null;

    const progressPercent = ((calculatedStep + 1) / config.steps.length) * 100;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Text strong>ความคืบหน้า</Text>
          <Text type="secondary">{calculatedStep + 1} / {config.steps.length}</Text>
        </div>
        <Progress 
          percent={progressPercent} 
          status={currentStatus === 'rejected' ? 'exception' : 'active'}
          strokeColor={getStatusColor(currentStatus)}
        />
      </div>
    );
  };

  // Render current status
  const renderCurrentStatus = () => {
    const statusLabel = config.statusLabels[currentStatus] || currentStatus;
    
    return (
      <div className="mb-4">
        <Space size="middle">
          <Tag 
            icon={getStatusIcon(currentStatus)} 
            color={getStatusColor(currentStatus)}
            style={{ fontSize: '14px', padding: '4px 12px' }}
          >
            {statusLabel}
          </Tag>
          {documentData.lastModifiedAt && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              อัปเดตล่าสุด: {new Date(documentData.lastModifiedAt).toLocaleString('th-TH')}
            </Text>
          )}
        </Space>
      </div>
    );
  };

  // Render action buttons
  const renderActions = () => {
    if (!showActions) return null;

    const currentStepConfig = config.steps[calculatedStep];
    const isLastStep = calculatedStep >= config.steps.length - 1;
    const isDraft = currentStatus === 'draft';
    const isRejected = currentStatus === 'rejected';
    const isCompleted = currentStatus === 'completed' || currentStatus === 'approved';

    return (
      <div className="mt-4">
        <Space size="middle" wrap>
          {/* Submit for Review Button */}
          {(isDraft || isRejected) && permissions.canEdit && (
            <PermissionButton
              type="primary"
              icon={<SendOutlined />}
              permission={`${config.department}.edit`}
              onClick={handleSubmitForReview}
              loading={isProcessing}
              warningType="CANNOT_EDIT"
            >
              ส่งตรวจสอบ
            </PermissionButton>
          )}

          {/* Approve Button */}
          {!isDraft && !isCompleted && !isLastStep && permissions.canApprove && (
            <ApproveButton
              permission={`${config.department}.approve`}
              onClick={() => setShowApprovalModal(true)}
              loading={isProcessing}
            >
              อนุมัติ
            </ApproveButton>
          )}

          {/* Reject Button */}
          {!isDraft && !isCompleted && permissions.canReject && (
            <PermissionButton
              type="danger"
              icon={<CloseCircleOutlined />}
              permission={`${config.department}.approve`}
              onClick={() => setShowRejectionModal(true)}
              loading={isProcessing}
              warningType="CANNOT_APPROVE"
            >
              ปฏิเสธ
            </PermissionButton>
          )}

          {/* Revert Button (for rejected documents) */}
          {isRejected && permissions.canEdit && (
            <PermissionButton
              icon={<UndoOutlined />}
              permission={`${config.department}.edit`}
              onClick={() => onStatusChange && onStatusChange('draft')}
              loading={isProcessing}
              warningType="CANNOT_EDIT"
            >
              แก้ไขใหม่
            </PermissionButton>
          )}
        </Space>
      </div>
    );
  };

  return (
    <PermissionGate permission={`${config.department}.view`}>
      <Card 
        className={`document-approval-flow ${className}`}
        style={style}
        size={compact ? 'small' : 'default'}
        title={
          <Space>
            <UserOutlined />
            <Text strong>การอนุมัติเอกสาร</Text>
          </Space>
        }
      >
        {renderProgress()}
        {renderCurrentStatus()}
        
        {/* Current Step Information */}
        <div className="mb-4">
          <Text strong>ขั้นตอนปัจจุบัน: </Text>
          <Text>{config.steps[calculatedStep]?.title || 'ไม่ระบุ'}</Text>
        </div>

        {renderActions()}

        {/* Approval Modal */}
        <Modal
          title="อนุมัติเอกสาร"
          open={showApprovalModal}
          onOk={handleApprove}
          onCancel={() => setShowApprovalModal(false)}
          confirmLoading={isProcessing}
          okText="อนุมัติ"
          cancelText="ยกเลิก"
        >
          <Form layout="vertical">
            <Form.Item label="ความเห็นเพิ่มเติม (ไม่บังคับ)">
              <TextArea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="ระบุความเห็นเพิ่มเติม..."
                rows={3}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Rejection Modal */}
        <Modal
          title="ปฏิเสธเอกสาร"
          open={showRejectionModal}
          onOk={handleReject}
          onCancel={() => setShowRejectionModal(false)}
          confirmLoading={isProcessing}
          okText="ปฏิเสธ"
          cancelText="ยกเลิก"
          okButtonProps={{ danger: true }}
        >
          <Form layout="vertical">
            <Form.Item 
              label="เหตุผลในการปฏิเสธ" 
              required
            >
              <TextArea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธ..."
                rows={3}
                required
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </PermissionGate>
  );
};

DocumentApprovalFlow.propTypes = {
  documentId: PropTypes.string.isRequired,
  documentType: PropTypes.string,
  currentStatus: PropTypes.string,
  currentStep: PropTypes.number,
  documentData: PropTypes.object,
  onStatusChange: PropTypes.func,
  onStepChange: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onSubmit: PropTypes.func,
  onSave: PropTypes.func,
  showActions: PropTypes.bool,
  showProgress: PropTypes.bool,
  compact: PropTypes.bool,
  customConfig: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object
};

export default DocumentApprovalFlow;
export { DOCUMENT_APPROVAL_CONFIGS }; 