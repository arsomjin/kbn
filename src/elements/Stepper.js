import React from 'react';
import PropTypes from 'prop-types';
import { Steps } from 'antd';

const { Step } = Steps;

/**
 * Unified KBN Stepper Component
 * - Uses Ant Design 4.x compatible syntax with <Steps.Step> children
 * - Integrates with unified theme system
 * - Supports both string and object formats for backward compatibility
 * - Applies nature theme styling automatically
 */
export default function CustomizedSteppers({ 
  steps = [], 
  activeStep = 0, 
  alternativeLabel = true, 
  direction = 'horizontal',
  size = 'default',
  className = '',
  style = {},
  ...props 
}) {
  // Convert steps to normalized format
  const normalizeStep = (step, index) => {
    if (typeof step === 'string') {
      return {
        title: step,
        description: alternativeLabel ? `ขั้นตอนที่ ${index + 1}` : undefined
      };
    } else if (typeof step === 'object' && step.title) {
      return {
        title: step.title,
        description: step.description,
        subTitle: step.subTitle,
        icon: step.icon,
        status: step.status
      };
    } else {
      return {
        title: `ขั้นตอน ${index + 1}`,
        description: 'รายละเอียดขั้นตอน'
      };
    }
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  const normalizedSteps = steps.map(normalizeStep);

  // Apply unified theme styling
  const unifiedStyle = {
    fontFamily: 'var(--nature-font-family)',
    ...style
  };

  const unifiedClassName = `nature-stepper ${className}`.trim();

  return (
    <Steps
      current={activeStep}
      direction={direction}
      size={size}
      className={unifiedClassName}
      style={unifiedStyle}
      {...props}
    >
      {normalizedSteps.map((step, index) => (
        <Step
          key={`step-${index}`}
          title={step.title}
          description={step.description}
          subTitle={step.subTitle}
          icon={step.icon}
          status={step.status}
        />
      ))}
    </Steps>
  );
}

CustomizedSteppers.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        subTitle: PropTypes.string,
        icon: PropTypes.node,
        status: PropTypes.oneOf(['wait', 'process', 'finish', 'error'])
      })
    ])
  ),
  activeStep: PropTypes.number,
  alternativeLabel: PropTypes.bool,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['default', 'small']),
  className: PropTypes.string,
  style: PropTypes.object
};
