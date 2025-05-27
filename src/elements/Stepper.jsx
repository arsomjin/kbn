import React from 'react';
import { Steps } from 'antd';

export default function CustomizedSteppers({
  steps = [],
  activeStep = 0,
  alternativeLabel = true,
  ...props
}) {
  // Convert steps to Ant Design format
  const stepItems = steps.map((label, index) => ({
    title: label,
    key: index.toString(),
  }));

  return (
    <Steps
      current={activeStep}
      items={stepItems}
      direction={alternativeLabel ? 'horizontal' : 'vertical'}
      {...props}
    />
  );
}
