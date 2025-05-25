import React from 'react';
import { Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';

export interface StepperProps {
  steps?: string[];
  activeStep?: number;
  alternativeLabel?: boolean; // Not used in AntD, but kept for API compatibility
  style?: React.CSSProperties;
  className?: string;
  [key: string]: any;
}

/**
 * Stepper component using Ant Design Steps.
 * If no steps prop is provided, uses default translated steps: Record, Review, Approve.
 */
const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep = 0,
  alternativeLabel, // ignored for AntD
  style,
  className,
  ...props
}) => {
  const { t } = useTranslation('inputPrice');
  const defaultSteps = [
    t('inputPrice.step.record', 'บันทึกรายการ'),
    t('inputPrice.step.review', 'ตรวจสอบ'),
    t('inputPrice.step.approve', 'อนุมัติ')
  ];
  const stepItems = (steps && steps.length > 0 ? steps : defaultSteps).map(title => ({ title }));
  return (
    <div style={{ width: '80%', minWidth: isMobile ? '100%' : 400 }}>
      <Steps current={activeStep} items={stepItems} style={style} className={className} size='small' {...props} />
    </div>
  );
};

export default Stepper;
