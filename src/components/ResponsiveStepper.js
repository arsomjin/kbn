/**
 * Responsive Stepper Component
 * Replaces shards-react stepper with modern, responsive design
 * Integrates with audit trail system and supports all device screens
 */

import React from 'react';
import { Steps, Card, Typography, Tag } from 'antd';
import { 
  CheckOutlined, 
  LoadingOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import './ResponsiveStepper.css';

const { Step } = Steps;
const { Text } = Typography;

const ResponsiveStepper = ({
  steps = [],
  currentStep = 0,
  direction = 'horizontal',
  size = 'default',
  status = 'process',
  showDescription = true,
  showProgress = true,
  className = '',
  style = {},
  onStepClick = null,
  responsive = true,
  theme = 'default', // 'default', 'minimal', 'modern'
  auditInfo = null, // Audit trail integration
  ...props
}) => {
  // Responsive breakpoint detection
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-adjust direction and size for mobile
  const finalDirection = responsive && isMobile ? 'vertical' : direction;
  const finalSize = responsive && isMobile ? 'small' : size;

  // Get step status based on current step
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'finish';
    if (stepIndex === currentStep) return status;
    return 'wait';
  };

  // Get step icon based on status and audit info
  const getStepIcon = (stepIndex, stepStatus) => {
    const auditStep = auditInfo?.find(audit => audit.step === stepIndex);
    
    if (auditStep && stepStatus === 'finish') {
      return <CheckOutlined style={{ color: '#52c41a' }} />;
    }
    
    switch (stepStatus) {
      case 'finish':
        return <CheckOutlined />;
      case 'process':
        return <LoadingOutlined />;
      case 'error':
        return <ExclamationCircleOutlined />;
      case 'wait':
      default:
        return stepIndex + 1;
    }
  };

  // Enhanced step rendering with audit information
  const renderStep = (step, index) => {
    const stepStatus = getStepStatus(index);
    const auditStep = auditInfo?.find(audit => audit.step === index);
    const isClickable = onStepClick && (index <= currentStep || stepStatus === 'finish');

    // Step description with audit info
    const stepDescription = showDescription ? (
      <div className="stepper-description">
        {step.description && (
          <div className="step-desc-text">{step.description}</div>
        )}
        {auditStep && (
          <div className="step-audit-info">
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {auditStep.userDisplayName} • {auditStep.timestamp}
              {auditStep.branchName && ` • ${auditStep.branchName}`}
            </Text>
          </div>
        )}
        {step.status && (
          <Tag 
            size="small" 
            color={getStatusColor(step.status)}
            style={{ marginTop: '4px' }}
          >
            {step.status}
          </Tag>
        )}
      </div>
    ) : null;

    return (
      <Step
        key={index}
        title={step.title}
        description={stepDescription}
        status={stepStatus}
        icon={getStepIcon(index, stepStatus)}
        onClick={isClickable ? () => onStepClick(index) : undefined}
        style={{
          cursor: isClickable ? 'pointer' : 'default',
          ...(step.style || {})
        }}
        className={`
          stepper-step 
          ${isClickable ? 'stepper-step-clickable' : ''}
          ${stepStatus === 'process' ? 'stepper-step-current' : ''}
          ${theme !== 'default' ? `stepper-step-${theme}` : ''}
        `}
      />
    );
  };

  // Get status color for tags
  const getStatusColor = (status) => {
    const colors = {
      'pending': '#faad14',
      'in_progress': '#1890ff',
      'completed': '#52c41a',
      'approved': '#52c41a',
      'rejected': '#ff4d4f',
      'cancelled': '#d9d9d9'
    };
    return colors[status] || '#d9d9d9';
  };

  // Progress percentage for progress bar
  const progressPercent = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const stepperClassName = `
    responsive-stepper
    responsive-stepper-${theme}
    responsive-stepper-${finalDirection}
    ${responsive ? 'responsive-stepper-responsive' : ''}
    ${className}
  `;

  return (
    <div className={stepperClassName} style={style}>
      {/* Progress bar for mobile */}
      {showProgress && responsive && isMobile && (
        <div className="stepper-progress-bar">
          <div 
            className="stepper-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="stepper-progress-text">
            ขั้นตอน {currentStep + 1} จาก {steps.length}
          </div>
        </div>
      )}

      {/* Main stepper */}
      <Steps
        direction={finalDirection}
        size={finalSize}
        current={currentStep}
        status={status}
        responsive={false} // We handle responsiveness ourselves
        className="stepper-steps"
        {...props}
      >
        {steps.map((step, index) => renderStep(step, index))}
      </Steps>

      {/* Mobile step details - only show when there's useful content */}
      {responsive && isMobile && showDescription && currentStep < steps.length && steps[currentStep]?.description && (
        <Card 
          size="small" 
          className="stepper-mobile-details"
          style={{ marginTop: '12px', backgroundColor: '#fff' }}
        >
          <div className="stepper-mobile-current">
            <Text strong>{steps[currentStep]?.title}</Text>
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {steps[currentStep].description}
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

ResponsiveStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    style: PropTypes.object
  })),
  currentStep: PropTypes.number,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['default', 'small']),
  status: PropTypes.oneOf(['wait', 'process', 'finish', 'error']),
  showDescription: PropTypes.bool,
  showProgress: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  onStepClick: PropTypes.func,
  responsive: PropTypes.bool,
  theme: PropTypes.oneOf(['default', 'minimal', 'modern']),
  auditInfo: PropTypes.array
};

export default ResponsiveStepper; 