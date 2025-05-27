import React from 'react';
import { Radio } from 'antd';
import { useResponsive } from 'hooks/useResponsive';

/**
 * Toggles - Modern toggle button group component with responsive design
 * @param {Object} props - Component props
 * @param {Array} props.buttons - Array of button objects with { value, label, style? }
 * @param {number} props.buttonWidth - Fixed width for each button (default: 80)
 * @param {boolean} props.dynamicWidth - Allow buttons to use dynamic width
 * @param {boolean} props.disabled - Disable the entire group
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.size - Button size ('small', 'middle', 'large')
 */
const Toggles = ({
  buttons = [],
  buttonWidth = 80,
  dynamicWidth = false,
  disabled = false,
  value,
  onChange,
  size = 'middle',
  className = '',
  ...props
}) => {
  const { isMobile } = useResponsive();

  // Adjust button width for mobile
  const actualButtonWidth = isMobile && !dynamicWidth ? Math.min(buttonWidth, 70) : buttonWidth;

  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <Radio.Group
      buttonStyle="solid"
      disabled={disabled}
      value={value}
      onChange={onChange}
      size={size}
      className={`${className} ${isMobile ? 'w-full' : ''}`}
      {...props}
    >
      {buttons.map((button, index) => (
        <Radio.Button
          key={button.key || button.value || index}
          style={{
            ...(!dynamicWidth && { width: actualButtonWidth }),
            textAlign: 'center',
            ...(isMobile && dynamicWidth && { flex: 1 }),
            ...button.style,
          }}
          value={button.value}
          disabled={button.disabled || disabled}
          className={`
            transition-all duration-200 
            hover:shadow-md 
            dark:border-gray-600 
            dark:text-gray-300
            ${button.className || ''}
          `}
        >
          <span className="truncate" title={button.label}>
            {button.label}
          </span>
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default Toggles;
