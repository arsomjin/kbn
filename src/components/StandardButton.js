/**
 * StandardButton Component
 * Ensures consistent button styling across the KBN application
 */

import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined 
} from '@ant-design/icons';

const StandardButton = ({
  variant = 'default', // 'primary', 'danger', 'text', 'link', 'default'
  size = 'default', // 'small', 'default', 'large'
  children,
  style = {},
  ...props
}) => {
  // Base styling that applies to all buttons
  const baseStyle = {
    borderRadius: '6px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    ...style
  };

  // Size-specific styling
  const sizeStyles = {
    small: {
      height: '32px',
      minWidth: '72px',
      fontSize: '14px',
      padding: '4px 12px'
    },
    default: {
      height: '40px',
      minWidth: '88px',
      fontSize: '14px',
      padding: '6px 16px'
    },
    large: {
      height: '48px',
      minWidth: '104px',
      fontSize: '16px',
      padding: '8px 20px'
    }
  };

  // Variant-specific styling
  const variantStyles = {
    primary: {
      boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(24, 144, 255, 0.3)',
        transform: 'translateY(-1px)'
      }
    },
    danger: {
      boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(255, 77, 79, 0.3)',
        transform: 'translateY(-1px)'
      }
    },
    text: {
      color: '#1890ff',
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: 'rgba(24, 144, 255, 0.06)',
        border: '1px solid rgba(24, 144, 255, 0.2)'
      }
    },
    link: {
      padding: '0',
      height: 'auto',
      minWidth: 'auto'
    },
    default: {
      border: '1px solid #d9d9d9',
      '&:hover': {
        borderColor: '#40a9ff',
        color: '#40a9ff'
      }
    }
  };

  // Determine button type for Ant Design
  const getButtonType = () => {
    switch (variant) {
      case 'primary': return 'primary';
      case 'danger': return undefined; // We'll use danger prop instead
      case 'text': return 'text';
      case 'link': return 'link';
      default: return 'default';
    }
  };

  // Combine all styles and classes
  const finalStyle = {
    ...baseStyle,
    ...sizeStyles[size]
  };

  const buttonClass = `standard-button ${size === 'small' ? 'standard-button-small' : ''}`;

  return (
    <Button
      type={getButtonType()}
      danger={variant === 'danger'}
      size={size}
      style={finalStyle}
      className={buttonClass}
      {...props}
    >
      {children}
    </Button>
  );
};

StandardButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'danger', 'text', 'link', 'default']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  children: PropTypes.node,
  style: PropTypes.object
};

export default StandardButton;

// Export convenience components
export const PrimaryButton = (props) => <StandardButton variant="primary" {...props} />;
export const DangerButton = (props) => <StandardButton variant="danger" {...props} />;
export const TextButton = (props) => <StandardButton variant="text" {...props} />;
export const LinkButton = (props) => <StandardButton variant="link" {...props} />;

// Export action-specific buttons for common use cases
export const ApproveButton = (props) => (
  <PrimaryButton icon={<CheckOutlined />} {...props}>
    อนุมัติ
  </PrimaryButton>
);

export const RejectButton = (props) => (
  <DangerButton icon={<CloseOutlined />} {...props}>
    ปฏิเสธ
  </DangerButton>
);

export const ViewButton = (props) => (
  <TextButton icon={<EyeOutlined />} {...props}>
    ดูรายละเอียด
  </TextButton>
);

export const EditButton = (props) => (
  <TextButton icon={<EditOutlined />} {...props}>
    แก้ไข
  </TextButton>
);

export const DeleteButton = (props) => (
  <DangerButton icon={<DeleteOutlined />} {...props}>
    ลบ
  </DangerButton>
);

export const SaveButton = (props) => (
  <PrimaryButton icon={<SaveOutlined />} {...props}>
    บันทึก
  </PrimaryButton>
);

export const CancelButton = (props) => (
  <StandardButton {...props}>
    ยกเลิก
  </StandardButton>
); 