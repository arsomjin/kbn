import React from 'react';
import classNames from 'classnames';
import { Typography, Row, Col } from 'antd';
import { Stepper } from 'elements';

const { Title } = Typography;

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  editing?: boolean;
  steps?: string[];
  activeStep?: number;
  showStepper?: boolean;
  [key: string]: any;
}

/**
 * PageTitle component that can optionally include a stepper
 * Responsive design for mobile and desktop views
 */
const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  className,
  editing,
  steps,
  activeStep = 0,
  showStepper = false,
  ...attrs
}) => {
  const classes = classNames(className, 'page-header bg-light mb-4', {
    editing: editing
  });

  // If no stepper is needed, return the simple version
  if (!showStepper || !steps || steps.length === 0) {
    return (
      <div className={classes} {...attrs}>
        <div className='px-4 py-3'>
          <span className='text-uppercase font-medium page-subtitle text-primary d-block'>{subtitle}</span>
          <Title level={3} className={`page-title m-0 ${editing ? 'text-warning' : ''}`}>
            {title}
          </Title>
        </div>
      </div>
    );
  }

  // With stepper version (mobile and desktop responsive)
  return (
    <div className={classes} {...attrs}>
      <Row>
        {/* Mobile view - stacked layout */}
        <Col xs={24} md={0}>
          <div className='text-center py-3'>
            <h2 className='text-xl font-medium mb-0'>{title}</h2>
            {subtitle && <div className='text-muted text-sm'>{subtitle}</div>}
          </div>
          <div className='px-2 pb-3'>
            <Stepper steps={steps} activeStep={activeStep} alternativeLabel={true} />
          </div>
        </Col>

        {/* Desktop view - horizontal layout */}
        <Col xs={0} md={24}>
          <div className='flex items-center justify-between px-4 py-2'>
            <div>
              <h2 className='text-xl font-medium mb-0'>{title}</h2>
              {subtitle && <div className='text-muted small'>{subtitle}</div>}
            </div>
            <div style={{ minWidth: '50%' }}>
              <Stepper steps={steps} activeStep={activeStep} alternativeLabel={false} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PageTitle;
