import React from 'react';
import classNames from 'classnames';
import { Col, Typography } from 'antd';

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
  // eslint-disable-next-line no-unused-vars
  activeStep,
  // eslint-disable-next-line no-unused-vars
  showStepper,
  // eslint-disable-next-line no-unused-vars
  steps,
  ...attrs
}) => {
  const classes = classNames(className, 'text-center sm:text-left mb-0 sm:mb-0');

  return (
    <Col xs={24} sm={8} className={classes} {...attrs}>
      {subtitle && (
        <Text
          type="secondary"
          className="uppercase text-xs tracking-wide block mb-1 dark:text-gray-400"
        >
          {subtitle}
        </Text>
      )}
      <Title
        level={3}
        className={`m-0 dark:text-gray-100 ${
          editing ? 'text-yellow-600 dark:text-yellow-400' : ''
        }`}
      >
        {title}
      </Title>
    </Col>
  );
};

export default PageTitle;
