import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Typography } from 'antd';

const { Title, Text } = Typography;

/**
 * FormSectionTitle Component
 *
 * Displays a section title and description for form sections
 * Features modern Ant Design components with responsive design and dark mode support
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The form section's title
 * @param {string} props.description - The form section's description
 * @returns {JSX.Element} The form section title component
 */
const FormSectionTitle = ({ title, description }) => {
  return (
    <Row className="mx-4 mb-6">
      <Col span={24} className="mb-3">
        <Title level={5} className="form-text m-0 dark:text-gray-200">
          {title}
        </Title>
        <Text type="secondary" className="form-text m-0 dark:text-gray-400">
          {description}
        </Text>
      </Col>
    </Row>
  );
};

FormSectionTitle.propTypes = {
  /**
   * The form section's title.
   */
  title: PropTypes.string,
  /**
   * The form section's description.
   */
  description: PropTypes.string,
};

FormSectionTitle.defaultProps = {
  title: 'Title',
  description: 'Description',
};

export default FormSectionTitle;
