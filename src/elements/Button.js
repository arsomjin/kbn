import React, { forwardRef } from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';

/**
 * Enhanced Custom Button Component
 * Flexible, accessible, and professionally styled
 */

// Size variants
const SIZES = {
  small: {
    height: '28px',
    fontSize: '12px',
    padding: '4px 12px',
    minWidth: '60px'
  },
  medium: {
    height: '32px',
    fontSize: '14px',
    padding: '6px 16px',
    minWidth: '72px'
  },
  large: {
    height: '40px',
    fontSize: '16px',
    padding: '8px 20px',
    minWidth: '88px'
  },
  xlarge: {
    height: '48px',
    fontSize: '16px',
    padding: '12px 24px',
    minWidth: '100px'
  }
};

// Style variants
const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
  },
  secondary: {
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
    border: '1px solid #d9d9d9',
    color: '#595959',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  success: {
    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)'
  },
  warning: {
    background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(250, 173, 20, 0.2)'
  },
  danger: {
    background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
    border: 'none',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(255, 77, 79, 0.2)'
  },
  ghost: {
    background: 'transparent',
    border: '1px solid #d9d9d9',
    color: '#595959',
    boxShadow: 'none'
  },
  text: {
    background: 'transparent',
    border: 'none',
    color: '#1890ff',
    boxShadow: 'none'
  }
};

// Base styles that apply to all buttons
const getBaseStyle = (size = 'medium', variant = 'primary', disabled = false) => {
  const sizeStyle = SIZES[size] || SIZES.medium;
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  
  return {
    borderRadius: '8px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...sizeStyle,
    ...variantStyle,
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed',
      boxShadow: 'none'
    })
  };
};

// Hover styles
const getHoverStyle = (variant = 'primary', disabled = false) => {
  if (disabled) return {};
  
  const hoverStyles = {
    primary: {
      background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
    },
    secondary: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
    },
    success: {
      background: 'linear-gradient(135deg, #73d13d 0%, #52c41a 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
    },
    warning: {
      background: 'linear-gradient(135deg, #ffc53d 0%, #faad14 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)'
    },
    danger: {
      background: 'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)'
    },
    ghost: {
      background: 'rgba(24, 144, 255, 0.05)',
      borderColor: '#1890ff',
      color: '#1890ff'
    },
    text: {
      background: 'rgba(24, 144, 255, 0.1)',
      color: '#096dd9'
    }
  };
  
  return hoverStyles[variant] || hoverStyles.primary;
};

const CustomButton = forwardRef(({ 
  children,
  size = 'medium',
  variant = 'primary',
  type,
  style = {},
  className = '',
  disabled = false,
  loading = false,
  icon,
  block = false,
  htmlType = 'button',
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props 
}, ref) => {
  // Determine Ant Design type based on variant
  const getAntType = () => {
    if (type) return type; // Allow override
    
    switch (variant) {
      case 'primary': return 'primary';
      case 'danger': return 'primary';
      case 'ghost': return 'ghost';
      case 'text': return 'text';
      default: return 'default';
    }
  };

  // Combine styles
  const baseStyle = getBaseStyle(size, variant, disabled);
  const combinedStyle = {
    ...baseStyle,
    ...style,
    ...(block && { width: '100%' })
  };

  // Handle hover effects
  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      const hoverStyle = getHoverStyle(variant, disabled);
      Object.assign(e.target.style, hoverStyle);
    }
    onMouseEnter && onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      // Reset to base style
      Object.assign(e.target.style, baseStyle);
    }
    onMouseLeave && onMouseLeave(e);
  };

  return (
    <Button
      ref={ref}
      type={getAntType()}
      size={size === 'xlarge' ? 'large' : size}
      style={combinedStyle}
      className={`custom-button custom-button-${variant} custom-button-${size} ${className}`}
      disabled={disabled}
      loading={loading}
      icon={icon}
      block={block}
      htmlType={htmlType}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Button>
  );
});

// Set display name for debugging
CustomButton.displayName = 'CustomButton';

// PropTypes for validation
CustomButton.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'text']),
  type: PropTypes.oneOf(['primary', 'ghost', 'dashed', 'link', 'text', 'default']),
  style: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  block: PropTypes.bool,
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func
};

// Default props
CustomButton.defaultProps = {
  size: 'medium',
  variant: 'primary',
  disabled: false,
  loading: false,
  block: false,
  htmlType: 'button'
};

export default CustomButton;
