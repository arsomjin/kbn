/**
 * Audit Trail Stepper Component
 * Space-saving minimal mode by default with expandable full mode
 * Integrates with ResponsiveStepper for full functionality
 */

import React, { useState } from 'react';
import { Card, Button, Progress, Typography, Space, Tooltip } from 'antd';
import { 
  ExpandOutlined, 
  CompressOutlined, 
  CheckOutlined, 
  LoadingOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import ResponsiveStepper from './ResponsiveStepper';
import './AuditTrailStepper.css';

const { Text } = Typography;

const AuditTrailStepper = ({
  steps = [],
  currentStep = 0,
  auditInfo = null,
  status = 'process',
  className = '',
  style = {},
  onStepClick = null,
  showFullByDefault = false,
  compactHeight = '56px',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(showFullByDefault);

  // Calculate progress percentage
  const progressPercent = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Get step status icon
  const getStepStatusIcon = (stepIndex) => {
    if (stepIndex < currentStep) return <CheckOutlined style={{ color: '#52c41a' }} />;
    if (stepIndex === currentStep) {
      switch (status) {
        case 'process': return <LoadingOutlined style={{ color: '#1890ff' }} />;
        case 'error': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
        default: return <LoadingOutlined style={{ color: '#1890ff' }} />;
      }
    }
    return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
  };

  // Get current step info
  const currentStepInfo = steps[currentStep] || {};
  const completedSteps = currentStep;
  const totalSteps = steps.length;

  // Get audit info for current step
  const currentAuditInfo = auditInfo?.find(audit => audit.step === currentStep);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Minimal compact view
  const renderMinimalView = () => (
    <Card 
      className={`audit-stepper-compact ${className}`}
      style={{ 
        height: compactHeight,
        ...style 
      }}
    >
      <div className="audit-stepper-left">
        <Space size="middle" align="center">
          {/* Step icon */}
          <div className="audit-stepper-icon">
            {getStepStatusIcon(currentStep)}
          </div>
          
          {/* Step info */}
          <div className="audit-stepper-info">
            <div className="audit-stepper-title">
              <Text strong>{currentStepInfo.title || `ขั้นตอนที่ ${currentStep + 1}`}</Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                ({completedSteps}/{totalSteps})
              </Text>
            </div>
            
            {/* Audit info if available */}
            {currentAuditInfo && (
              <div className="audit-stepper-audit">
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {currentAuditInfo.userDisplayName}
                  {currentAuditInfo.branchName && ` • ${currentAuditInfo.branchName}`}
                  {currentAuditInfo.timestamp && ` • ${currentAuditInfo.timestamp}`}
                </Text>
              </div>
            )}
          </div>
        </Space>
      </div>

      <div className="audit-stepper-right">
        <Space size="small" align="center">
          {/* Progress bar */}
          <div className="audit-stepper-progress">
            <Progress
              percent={progressPercent}
              size="small"
              showInfo={false}
              strokeColor="#1890ff"
              style={{ width: '80px' }}
            />
          </div>
          
          {/* Expand button */}
          <Tooltip title={isExpanded ? 'ย่อรายละเอียด' : 'ดูรายละเอียดทั้งหมด'}>
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleExpanded}
              className="audit-stepper-expand-btn"
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );

  // Full expanded view using ResponsiveStepper
  const renderExpandedView = () => (
    <Card 
      className={`audit-stepper-expanded ${className}`}
      style={style}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ขั้นตอนการดำเนินงาน</span>
          <Tooltip title="ย่อรายละเอียด">
            <Button
              type="text"
              size="small"
              icon={<CompressOutlined />}
              onClick={toggleExpanded}
            />
          </Tooltip>
        </div>
      }
    >
      <ResponsiveStepper
        steps={steps}
        currentStep={currentStep}
        auditInfo={auditInfo}
        status={status}
        onStepClick={onStepClick}
        theme="minimal"
        {...props}
      />
    </Card>
  );

  return (
    <div className="audit-trail-stepper">
      {isExpanded ? renderExpandedView() : renderMinimalView()}
    </div>
  );
};

AuditTrailStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    style: PropTypes.object
  })),
  currentStep: PropTypes.number,
  auditInfo: PropTypes.array,
  status: PropTypes.oneOf(['wait', 'process', 'finish', 'error']),
  className: PropTypes.string,
  style: PropTypes.object,
  onStepClick: PropTypes.func,
  showFullByDefault: PropTypes.bool,
  compactHeight: PropTypes.string
};

export default AuditTrailStepper; 