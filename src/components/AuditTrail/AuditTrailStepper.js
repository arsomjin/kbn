/**
 * Audit Trail Stepper Component
 * Displays document status progression with user actions, timestamps, and geographic context
 * Integrated with RBAC system for multi-province audit compliance
 */

import React, { useState } from 'react';
import { Steps, Tooltip, Tag, Button, Drawer, Timeline, Card, Row, Col, Avatar, Typography } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/th';
import PropTypes from 'prop-types';

// Configure dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('th');

const { Step } = Steps;
const { Text, Paragraph } = Typography;

const AuditTrailStepper = ({
  steps = [],
  currentStep = 0,
  auditTrail = [],
  changeHistory = [],
  documentId,
  documentType,
  onStepClick,
  showChangeHistory = true,
  showAuditDetails = true
}) => {
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [auditDrawerVisible, setAuditDrawerVisible] = useState(false);
  
  const { hasPermission, userRole } = usePermissions();
  const { user } = useSelector(state => state.auth);
  const { branches, users } = useSelector(state => state.data);

  // Get user display name from UID
  const getUserDisplayName = (uid) => {
    if (!uid) return 'ระบบ';
    if (uid === user?.uid) return 'คุณ';
    const userData = users?.[uid];
    return userData?.displayName || userData?.name || `ผู้ใช้ ${uid.slice(-6)}`;
  };

  // Get branch display name
  const getBranchDisplayName = (branchCode) => {
    if (!branchCode) return 'ไม่ระบุ';
    const branch = branches?.[branchCode];
    return branch?.branchName || branchCode;
  };

  // Enhanced step rendering with audit information
  const renderStepContent = (step, index) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const auditInfo = auditTrail.find(audit => audit.step === index);
    
    let status = 'wait';
    if (isCompleted) status = 'finish';
    if (isCurrent) status = 'process';
    if (step.error) status = 'error';

    const stepIcon = auditInfo ? (
      <Avatar 
        size="small" 
        style={{ 
          backgroundColor: isCompleted ? '#52c41a' : isCurrent ? '#1890ff' : '#d9d9d9',
          color: 'white'
        }}
      >
        {auditInfo.actionBy === user?.uid ? 'คุณ' : getUserDisplayName(auditInfo.actionBy)?.charAt(0)}
      </Avatar>
    ) : undefined;

    const stepDescription = auditInfo ? (
      <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px' }}>
        <div>
          <UserOutlined className="mr-1" />
          {getUserDisplayName(auditInfo.actionBy)}
          {auditInfo.branchCode && (
            <>
              {' • '}
              <EnvironmentOutlined className="mr-1" />
              {getBranchDisplayName(auditInfo.branchCode)}
            </>
          )}
        </div>
        <div>
          <ClockCircleOutlined className="mr-1" />
          {dayjs(auditInfo.timestamp).format('DD/MM/YYYY HH:mm')}
        </div>
                  {auditInfo.notes && (
            <div style={{ marginTop: '2px', fontStyle: 'italic' }}>
              {auditInfo.notes}
            </div>
          )}
      </div>
    ) : null;

    return (
      <Step
        key={index}
        title={step.title}
        status={status}
        description={stepDescription}
        icon={stepIcon}
        onClick={() => onStepClick && onStepClick(index)}
        style={{ cursor: onStepClick ? 'pointer' : 'default' }}
      />
    );
  };

  // Change history timeline items
  const renderChangeHistory = () => {
    return changeHistory.map((change, index) => ({
      key: index,
      color: getChangeTypeColor(change.type),
      dot: getChangeTypeIcon(change.type),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>{getChangeTypeLabel(change.type)}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {dayjs(change.timestamp).format('DD/MM/YYYY HH:mm:ss')}
            </Text>
          </div>
          <div style={{ marginTop: '4px' }}>
            <Text type="secondary">
              โดย: {getUserDisplayName(change.changedBy)}
              {change.branchCode && ` • สาขา: ${getBranchDisplayName(change.branchCode)}`}
            </Text>
          </div>
          {change.changes && change.changes.length > 0 && (
            <div style={{ marginTop: '8px', background: '#fafafa', padding: '8px', borderRadius: '4px' }}>
              <Text strong style={{ fontSize: '12px' }}>การเปลี่ยนแปลง:</Text>
              {change.changes.map((changeItem, i) => (
                <div key={i} style={{ fontSize: '11px', marginTop: '2px' }}>
                  <Text code>{changeItem.field}</Text>: 
                  <Text type="secondary"> {changeItem.oldValue} </Text>
                  → <Text type="primary"> {changeItem.newValue}</Text>
                </div>
              ))}
            </div>
          )}
          {change.notes && (
            <Paragraph 
              style={{ fontSize: '12px', marginTop: '8px', marginBottom: 0 }}
              type="secondary"
            >
              หมายเหตุ: {change.notes}
            </Paragraph>
          )}
        </div>
      )
    }));
  };

  // Helper functions for change types
  const getChangeTypeColor = (type) => {
    const colors = {
      'created': '#52c41a',
      'edited': '#1890ff', 
      'approved': '#722ed1',
      'rejected': '#ff4d4f',
      'submitted': '#faad14',
      'cancelled': '#8c8c8c'
    };
    return colors[type] || '#d9d9d9';
  };

  const getChangeTypeIcon = (type) => {
    const icons = {
      'created': <CheckCircleOutlined />,
      'edited': <EditOutlined />,
      'approved': <CheckCircleOutlined />, 
      'rejected': <ExclamationCircleOutlined />,
      'submitted': <FileTextOutlined />,
      'cancelled': <ExclamationCircleOutlined />
    };
    return icons[type] || <ClockCircleOutlined />;
  };

  const getChangeTypeLabel = (type) => {
    const labels = {
      'created': 'สร้างเอกสาร',
      'edited': 'แก้ไขข้อมูล',
      'approved': 'อนุมัติเอกสาร',
      'rejected': 'ปฏิเสธเอกสาร', 
      'submitted': 'ส่งเอกสาร',
      'cancelled': 'ยกเลิกเอกสาร'
    };
    return labels[type] || type;
  };

  return (
    <div className="audit-trail-stepper">
      {/* Main Stepper with Audit Information */}
      <div style={{ position: 'relative' }}>
        <Steps current={currentStep} size="small" style={{ marginBottom: '16px' }}>
          {steps.map((step, index) => renderStepContent(step, index))}
        </Steps>

        {/* Action Buttons */}
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '8px' }}>
          {showChangeHistory && changeHistory.length > 0 && (
            <Tooltip title="ประวัติการเปลี่ยนแปลง">
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => setHistoryDrawerVisible(true)}
              >
                ประวัติ ({changeHistory.length})
              </Button>
            </Tooltip>
          )}
          
          {showAuditDetails && auditTrail.length > 0 && hasPermission('audit.view') && (
            <Tooltip title="รายละเอียดการตรวจสอบ">
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => setAuditDrawerVisible(true)}
              >
                Audit Trail
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Document Status Tags */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Tag color="blue">ID: {documentId}</Tag>
        <Tag color="green">ประเภท: {documentType}</Tag>
        {auditTrail.length > 0 && (
          <Tag color="orange">
            อัปเดตล่าสุด: {dayjs(auditTrail[auditTrail.length - 1]?.timestamp).fromNow()}
          </Tag>
        )}
      </div>

      {/* Change History Drawer */}
      <Drawer
        title="ประวัติการเปลี่ยนแปลงเอกสาร"
        placement="right"
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
        width={600}
      >
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row>
            <Col span={12}>
              <Text strong>เอกสารเลขที่:</Text> {documentId}
            </Col>
            <Col span={12}>
              <Text strong>ประเภท:</Text> {documentType}
            </Col>
          </Row>
        </Card>

        {changeHistory.length > 0 ? (
          <Timeline items={renderChangeHistory()} />
        ) : (
          <div style={{ textAlign: 'center', color: '#8c8c8c', marginTop: '40px' }}>
            ไม่มีประวัติการเปลี่ยนแปลง
          </div>
        )}
      </Drawer>

      {/* Audit Trail Drawer */}
      <Drawer
        title="Audit Trail - รายละเอียดการตรวจสอบ"
        placement="right"
        onClose={() => setAuditDrawerVisible(false)}
        open={auditDrawerVisible}
        width={700}
      >
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Document ID:</Text><br />
              <Text code>{documentId}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Document Type:</Text><br />
              <Text>{documentType}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Current Step:</Text><br />
              <Text>{steps[currentStep]?.title || 'N/A'}</Text>
            </Col>
          </Row>
        </Card>

        {auditTrail.map((audit, index) => (
          <Card key={index} size="small" style={{ marginBottom: '12px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Step:</Text> {steps[audit.step]?.title || `Step ${audit.step}`}<br />
                <Text strong>Action:</Text> {audit.action}<br />
                <Text strong>User:</Text> {getUserDisplayName(audit.actionBy)}
              </Col>
              <Col span={12}>
                <Text strong>Timestamp:</Text><br />
                <Text>{dayjs(audit.timestamp).format('DD/MM/YYYY HH:mm:ss')}</Text><br />
                <Text strong>Branch:</Text> {getBranchDisplayName(audit.branchCode)}
              </Col>
            </Row>
            {audit.notes && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                <Text strong>Notes:</Text><br />
                <Text>{audit.notes}</Text>
              </div>
            )}
          </Card>
        ))}
      </Drawer>
    </div>
  );
};

AuditTrailStepper.propTypes = {
  steps: PropTypes.array.isRequired,
  currentStep: PropTypes.number,
  auditTrail: PropTypes.array,
  changeHistory: PropTypes.array, 
  documentId: PropTypes.string.isRequired,
  documentType: PropTypes.string.isRequired,
  onStepClick: PropTypes.func,
  showChangeHistory: PropTypes.bool,
  showAuditDetails: PropTypes.bool
};

export default AuditTrailStepper; 