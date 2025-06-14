/**
 * Approval History Component
 * 
 * Displays the complete approval timeline for a document including
 * all status changes, approvals, rejections, and user actions.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Timeline, Card, Space, Typography, Avatar, Tag, Tooltip, Empty } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SendOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';

import ApprovalStatusBadge from './ApprovalStatusBadge';
import { formatUserDisplayName, formatGeographicContext } from '../AuditTrail/utils';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale('th');

const { Text, Paragraph } = Typography;

/**
 * Action type configuration for timeline display
 */
const ACTION_CONFIG = {
  'create': {
    icon: <EditOutlined />,
    color: '#1890ff',
    label: 'สร้างเอกสาร',
    description: 'สร้างเอกสารใหม่'
  },
  'update': {
    icon: <EditOutlined />,
    color: '#faad14',
    label: 'แก้ไขเอกสาร',
    description: 'แก้ไขข้อมูลเอกสาร'
  },
  'submit': {
    icon: <SendOutlined />,
    color: '#1890ff',
    label: 'ส่งเอกสาร',
    description: 'ส่งเอกสารเพื่อตรวจสอบ'
  },
  'approve': {
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    label: 'อนุมัติ',
    description: 'อนุมัติเอกสาร'
  },
  'reject': {
    icon: <CloseCircleOutlined />,
    color: '#ff4d4f',
    label: 'ปฏิเสธ',
    description: 'ปฏิเสธเอกสาร'
  },
  'cancel': {
    icon: <CloseCircleOutlined />,
    color: '#8c8c8c',
    label: 'ยกเลิก',
    description: 'ยกเลิกเอกสาร'
  },
  'complete': {
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    label: 'เสร็จสิ้น',
    description: 'ดำเนินการเสร็จสิ้น'
  }
};

/**
 * Approval History Component
 * @param {Object} props
 * @param {Array} props.auditTrail - Audit trail entries
 * @param {Array} props.statusHistory - Status history entries
 * @param {Array} props.employees - Employee data for user lookup
 * @param {Array} props.branches - Branch data for geographic context
 * @param {boolean} props.showUserDetails - Show detailed user information
 * @param {boolean} props.showGeographicInfo - Show geographic context
 * @param {boolean} props.showComments - Show comments/notes
 * @param {number} props.maxItems - Maximum items to display
 * @param {boolean} props.compact - Compact display mode
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
const ApprovalHistory = ({
  auditTrail = [],
  statusHistory = [],
  employees = [],
  branches = [],
  showUserDetails = true,
  showGeographicInfo = true,
  showComments = true,
  maxItems = 20,
  compact = false,
  className = '',
  style = {}
}) => {
  // Combine and sort all history entries
  const combinedHistory = useMemo(() => {
    const combined = [];
    
    // Add audit trail entries
    auditTrail.forEach(entry => {
      combined.push({
        ...entry,
        type: 'audit',
        timestamp: entry.time || entry.timestamp,
        sortKey: entry.time || entry.timestamp || 0
      });
    });
    
    // Add status history entries
    statusHistory.forEach(entry => {
      combined.push({
        ...entry,
        type: 'status',
        action: entry.status, // Map status to action for consistency
        timestamp: entry.time || entry.timestamp,
        sortKey: entry.time || entry.timestamp || 0
      });
    });
    
    // Sort by timestamp (newest first)
    return combined
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, maxItems);
  }, [auditTrail, statusHistory, maxItems]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'ไม่ระบุเวลา';
    
    const date = dayjs(timestamp);
    const formatted = date.format('DD/MM/YYYY HH:mm:ss');
    const relative = date.fromNow();
    
    return (
      <Tooltip title={formatted}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {relative}
        </Text>
      </Tooltip>
    );
  };

  // Get user display name
  const getUserDisplayName = (userInfo) => {
    return formatUserDisplayName(userInfo, employees);
  };

  // Get geographic context
  const getGeographicInfo = (entry) => {
    if (!showGeographicInfo || !entry.geographic) return null;
    return formatGeographicContext(entry.geographic, branches);
  };

  // Render timeline item
  const renderTimelineItem = (entry, index) => {
    const actionConfig = ACTION_CONFIG[entry.action] || {
      icon: <ClockCircleOutlined />,
      color: '#d9d9d9',
      label: entry.action || 'ไม่ระบุ',
      description: 'การดำเนินการ'
    };

    const userDisplayName = getUserDisplayName(entry.userInfo);
    const geographicInfo = getGeographicInfo(entry);

    return {
      key: entry.id || `${entry.type}_${index}`,
      dot: (
        <Avatar
          size={compact ? 24 : 32}
          icon={actionConfig.icon}
          style={{ 
            backgroundColor: actionConfig.color,
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      ),
      children: (
        <div className="approval-history-item">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <Space size="small" wrap>
                <Text strong style={{ fontSize: compact ? '13px' : '14px' }}>
                  {actionConfig.label}
                </Text>
                {entry.status && (
                  <ApprovalStatusBadge 
                    status={entry.status} 
                    size={compact ? 'small' : 'default'}
                  />
                )}
              </Space>
              
              {showUserDetails && (
                <div className="mt-1">
                  <Space size="small">
                    <UserOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                    <Text style={{ fontSize: '12px', color: '#595959' }}>
                      {userDisplayName}
                    </Text>
                  </Space>
                </div>
              )}
            </div>
            
            <div className="text-right">
              {formatTimestamp(entry.timestamp)}
            </div>
          </div>

          {/* Comments/Notes */}
          {showComments && (entry.notes || entry.comment || entry.rejectionReason) && (
            <div className="mb-2">
              <Paragraph 
                style={{ 
                  fontSize: '13px',
                  margin: 0,
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${actionConfig.color}`
                }}
              >
                {entry.notes || entry.comment || entry.rejectionReason}
              </Paragraph>
            </div>
          )}

          {/* Geographic Information */}
          {geographicInfo && (
            <div className="mt-2">
              <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                📍 {geographicInfo}
              </Text>
            </div>
          )}

          {/* Additional metadata for audit entries */}
          {entry.type === 'audit' && entry.changes && Object.keys(entry.changes).length > 0 && (
            <div className="mt-2">
              <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                แก้ไข: {Object.keys(entry.changes).join(', ')}
              </Text>
            </div>
          )}
        </div>
      )
    };
  };

  // Empty state
  if (combinedHistory.length === 0) {
    return (
      <Card className={className} style={style}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ไม่มีประวัติการอนุมัติ"
          style={{ padding: '20px 0' }}
        />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined />
          <Text strong>ประวัติการอนุมัติ</Text>
          <Tag color="blue">{combinedHistory.length} รายการ</Tag>
        </Space>
      }
      className={`approval-history ${className}`}
      style={style}
      size={compact ? 'small' : 'default'}
    >
      <Timeline
        mode="left"
        items={combinedHistory.map(renderTimelineItem)}
        style={{
          paddingTop: '8px'
        }}
      />
      
      {combinedHistory.length >= maxItems && (
        <div className="text-center mt-4">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            แสดง {maxItems} รายการล่าสุด
          </Text>
        </div>
      )}
    </Card>
  );
};

ApprovalHistory.propTypes = {
  auditTrail: PropTypes.array,
  statusHistory: PropTypes.array,
  employees: PropTypes.array,
  branches: PropTypes.array,
  showUserDetails: PropTypes.bool,
  showGeographicInfo: PropTypes.bool,
  showComments: PropTypes.bool,
  maxItems: PropTypes.number,
  compact: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ApprovalHistory;