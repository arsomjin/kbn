import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Timeline, 
  Collapse, 
  Button, 
  Tooltip, 
  Space, 
  Tag, 
  Typography, 
  Avatar, 
  Empty,
  Spin,
  Alert
} from 'antd';
import { 
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CheckCircleTwoTone,
  EyeOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import PropTypes from 'prop-types';

import { 
  formatUserDisplayName, 
  formatGeographicContext, 
  formatChange,
  getStatusColor,
  getActionColor,
  sortAuditEntries
} from './utils';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../PermissionGate';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale('th');

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

const AuditHistory = ({
  auditTrail = [],
  statusHistory = [],
  loading = false,
  error = null,
  className = '',
  config = {},
  onApprove,
  onViewDetails,
  onStatusChange,
  showApprovalButton = true,
  showGeographicInfo = true,
  showChangeDetails = true,
  compact = false
}) => {
  const [activeKey, setActiveKey] = useState(['audit', 'status']);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { branches, employees } = useSelector((state) => state.data);
  
  // Custom hooks
  const { hasPermission } = usePermissions();

  // Permission checks - use document flow permissions
  const canViewAuditTrail = hasPermission('accounting.view') || hasPermission('sales.view') || hasPermission('service.view') || hasPermission('inventory.view') || hasPermission('*');
  const canApprove = hasPermission('accounting.approve') || hasPermission('sales.approve') || hasPermission('service.approve') || hasPermission('*');
  const canViewDetails = canViewAuditTrail;

  // Sorted entries
  const sortedAuditTrail = useMemo(() => sortAuditEntries(auditTrail), [auditTrail]);
  const sortedStatusHistory = useMemo(() => sortAuditEntries(statusHistory), [statusHistory]);

  // Current status check
  const isApproved = useMemo(() => {
    return sortedStatusHistory.length > 0 && 
           sortedStatusHistory[0].status === 'approved';
  }, [sortedStatusHistory]);

  // Helper functions
  const getUserName = (userInfo) => {
    return formatUserDisplayName(userInfo, employees);
  };

  const getGeographicInfo = (entry) => {
    return formatGeographicContext(entry.geographic, branches);
  };

  const formatTimestamp = (timestamp, showRelative = true) => {
    const date = dayjs(timestamp);
    const formatted = date.format('DD/MM/YYYY HH:mm:ss');
    
    if (!showRelative) return formatted;
    
    const relative = date.fromNow();
    return (
      <Tooltip title={formatted}>
        <span>{relative}</span>
      </Tooltip>
    );
  };

  const renderChanges = (changes) => {
    if (!changes || !showChangeDetails) return null;
    
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-md">
        <Text strong className="text-sm">การเปลี่ยนแปลง:</Text>
        <ul className="mt-1 mb-0 text-sm">
          {Object.entries(changes).map(([key, change]) => (
            <li key={key} className="text-gray-700">
              {formatChange(key, change)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const getActionIcon = (action) => {
    const icons = {
      'create': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'update': <EditOutlined style={{ color: '#1890ff' }} />,
      'delete': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'approve': <CheckCircleTwoTone twoToneColor="#52c41a" />,
      'reject': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'submit': <FileTextOutlined style={{ color: '#faad14' }} />,
      'cancel': <ExclamationCircleOutlined style={{ color: '#8c8c8c' }} />
    };
    
    return icons[action] || <ClockCircleOutlined />;
  };

  const getActionLabel = (action) => {
    const labels = {
      'create': 'สร้างเอกสาร',
      'update': 'แก้ไขเอกสาร',
      'delete': 'ลบเอกสาร',
      'approve': 'อนุมัติเอกสาร',
      'reject': 'ปฏิเสธเอกสาร',
      'submit': 'ส่งเอกสาร',
      'cancel': 'ยกเลิกเอกสาร'
    };
    
    return labels[action] || action;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'draft': <EditOutlined style={{ color: '#d9d9d9' }} />,
      'submitted': <FileTextOutlined style={{ color: '#faad14' }} />,
      'reviewed': <EyeOutlined style={{ color: '#1890ff' }} />,
      'approved': <CheckCircleTwoTone twoToneColor="#52c41a" />,
      'rejected': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'cancelled': <ExclamationCircleOutlined style={{ color: '#8c8c8c' }} />
    };
    
    return icons[status] || <ClockCircleOutlined />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'ฉบับร่าง',
      'submitted': 'ส่งแล้ว',
      'reviewed': 'ตรวจสอบแล้ว',
      'approved': 'อนุมัติแล้ว',
      'rejected': 'ปฏิเสธ',
      'cancelled': 'ยกเลิก'
    };
    
    return labels[status] || status;
  };

  const handleApprove = () => {
    if (!canApprove || !user) return;
    
    const approvalEntry = {
      id: `approval_${Date.now()}`,
      status: 'approved',
      time: Date.now(),
      uid: user.uid || 'system',
      userInfo: {
        uid: user.uid,
        displayName: user.displayName || user.name,
        name: user.name,
        email: user.email,
        employeeCode: user.employeeCode
      },
      comment: 'อนุมัติและดำเนินการเสร็จสิ้น'
    };
    
    if (onApprove) {
      onApprove(approvalEntry);
    }
  };

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Render audit trail timeline
  const renderAuditTimeline = () => {
    if (!canViewAuditTrail) {
      return (
        <Alert
          message="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดู Audit Trail"
          type="warning"
          showIcon
        />
      );
    }

    if (sortedAuditTrail.length === 0) {
      return <Empty description="ไม่มีข้อมูล Audit Trail" />;
    }

    return (
      <Timeline>
        {sortedAuditTrail.map((entry) => {
          const isExpanded = expandedEntries.has(entry.id || '');
          
          return (
            <Timeline.Item
              key={entry.id || `audit_${entry.time}`}
              color={getActionColor(entry.action)}
              dot={getActionIcon(entry.action)}
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <Text strong className="text-base">
                      {getActionLabel(entry.action)}
                    </Text>
                    {entry.step && (
                      <Tag color="blue" className="ml-2">
                        ขั้นตอนที่ {entry.step}
                      </Tag>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatTimestamp(entry.time)}
                  </div>
                </div>

                {/* User info */}
                <div className="flex items-center space-x-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text className="text-sm">
                    โดย: <Text strong>{getUserName(entry.userInfo)}</Text>
                  </Text>
                  {showGeographicInfo && entry.geographic && (
                    <>
                      <Text type="secondary">•</Text>
                      <Text className="text-sm text-gray-500">
                        <EnvironmentOutlined className="mr-1" />
                        {getGeographicInfo(entry)}
                      </Text>
                    </>
                  )}
                </div>

                {/* Notes */}
                {entry.notes && (
                  <Paragraph className="text-sm text-gray-600 mb-2">
                    {entry.notes}
                  </Paragraph>
                )}

                {/* Changes */}
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => toggleEntryExpansion(entry.id || '')}
                      className="p-0 h-auto"
                    >
                      {isExpanded ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียดการเปลี่ยนแปลง'}
                    </Button>
                    {isExpanded && renderChanges(entry.changes)}
                  </div>
                )}

                {/* View details button */}
                {canViewDetails && onViewDetails && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetails(entry)}
                    className="p-0 h-auto"
                  >
                    ดูรายละเอียดเพิ่มเติม
                  </Button>
                )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };

  // Render status history timeline
  const renderStatusTimeline = () => {
    if (sortedStatusHistory.length === 0) {
      return <Empty description="ไม่มีประวัติสถานะ" />;
    }

    return (
      <Timeline>
        {sortedStatusHistory.map((entry) => (
          <Timeline.Item
            key={entry.id || `status_${entry.time}`}
            color={getStatusColor(entry.status)}
            dot={getStatusIcon(entry.status)}
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <Text strong className="text-base">
                    {getStatusLabel(entry.status)}
                  </Text>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {formatTimestamp(entry.time)}
                </div>
              </div>

              {/* User info */}
              <div className="flex items-center space-x-2">
                <Avatar size="small" icon={<UserOutlined />} />
                <Text className="text-sm">
                  โดย: <Text strong>{getUserName(entry.userInfo)}</Text>
                </Text>
                {showGeographicInfo && entry.geographic && (
                  <>
                    <Text type="secondary">•</Text>
                    <Text className="text-sm text-gray-500">
                      <EnvironmentOutlined className="mr-1" />
                      {getGeographicInfo(entry)}
                    </Text>
                  </>
                )}
              </div>

              {/* Comment */}
              {entry.comment && (
                <Paragraph className="text-sm text-gray-600 mb-0">
                  {entry.comment}
                </Paragraph>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  if (loading) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Spin size="large" />
        <div className="mt-2">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="เกิดข้อผิดพลาด"
        description={error}
        type="error"
        showIcon
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Approval button */}
      <PermissionGate permission="audit.approve">
        {showApprovalButton && !isApproved && (
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<CheckCircleTwoTone twoToneColor="#fff" />}
              onClick={handleApprove}
              size="large"
            >
              อนุมัติและดำเนินการเสร็จสิ้น
            </Button>
          </div>
        )}
      </PermissionGate>

      {/* Audit History Panels */}
      <Collapse
        activeKey={activeKey}
        onChange={setActiveKey}
        ghost={compact}
      >
        <PermissionGate permission="audit.view">
          <Panel
            header={
              <Space>
                <HistoryOutlined />
                <span>Audit Trail</span>
                <Tag color="blue">{sortedAuditTrail.length} รายการ</Tag>
              </Space>
            }
            key="audit"
          >
            <Card className={compact ? 'shadow-none border-0' : ''}>
              {renderAuditTimeline()}
            </Card>
          </Panel>
        </PermissionGate>

        <Panel
          header={
            <Space>
              <ClockCircleOutlined />
              <span>ประวัติสถานะ</span>
              <Tag color="green">{sortedStatusHistory.length} รายการ</Tag>
            </Space>
          }
          key="status"
        >
          <Card className={compact ? 'shadow-none border-0' : ''}>
            {renderStatusTimeline()}
          </Card>
        </Panel>
      </Collapse>
    </div>
  );
};

AuditHistory.propTypes = {
  auditTrail: PropTypes.array,
  statusHistory: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  config: PropTypes.object,
  onApprove: PropTypes.func,
  onViewDetails: PropTypes.func,
  onStatusChange: PropTypes.func,
  showApprovalButton: PropTypes.bool,
  showGeographicInfo: PropTypes.bool,
  showChangeDetails: PropTypes.bool,
  compact: PropTypes.bool
};

export default AuditHistory; 