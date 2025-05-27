import React from 'react';
import classNames from 'classnames';
import { Row, Col, Typography } from 'antd';
import { Stepper } from 'elements';

const { Title, Text } = Typography;

/**
 * PageTitle Component
 *
 * A reusable page title component with subtitle support
 * Features modern Ant Design typography, responsive design, and dark mode support
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The main page title
 * @param {string} props.subtitle - The page subtitle
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.editing - Whether the page is in editing mode (shows warning color)
 * @param {number} props.activeStep - Current active step (not used in DOM)
 * @param {boolean} props.showStepper - Whether to show stepper (not used in DOM)
 * @param {Array} props.steps - Array of steps (not used in DOM)
 * @returns {JSX.Element} The page title component
 */
const PageTitle = ({
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
    editing: editing,
  });

  // If no stepper is needed, return the simple version
  if (!showStepper || !steps || steps.length === 0) {
    return (
      <div className={classes} {...attrs}>
        <div className="px-4 py-3">
          <span className="text-uppercase font-medium page-subtitle text-primary d-block">
            {subtitle}
          </span>
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
          <div className="text-center py-3">
            <h2 className="text-xl font-medium mb-0">{title}</h2>
            {subtitle && <div className="text-muted text-sm">{subtitle}</div>}
          </div>
          <div className="px-2 pb-3">
            <Stepper steps={steps} activeStep={activeStep} />
          </div>
        </Col>

        {/* Desktop view - horizontal layout */}
        <Col xs={0} md={24}>
          <div className="flex items-center justify-between px-4 py-2">
            <div>
              <h2 className="text-xl font-medium mb-0">{title}</h2>
              {subtitle && <div className="text-muted small">{subtitle}</div>}
            </div>
            <div style={{ minWidth: '50%' }}>
              <Stepper steps={steps} activeStep={activeStep} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PageTitle;
