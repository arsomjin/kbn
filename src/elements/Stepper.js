import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

export default function CustomizedSteppers({ steps = [], activeStep = 0, alternativeLabel = true, ...props }) {
  return (
    <Stepper alternativeLabel={alternativeLabel} activeStep={activeStep} {...props}>
      {steps.map(label => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
