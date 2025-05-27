import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { NotificationStatus } from 'data/Constant';

const { Option } = Select;

/**
 * StatusSelector component for selecting notification statuses
 * @param {Object} props - Component props
 * @param {boolean} props.hasAll - Whether to include "All" option (currently unused but kept for compatibility)
 * @param {Object} ref - Forward ref for component access
 * @returns {JSX.Element} Status selector component
 */
export default forwardRef(({ hasAll, ...props }, ref) => {
  const { t } = useTranslation();
  const selectRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current.focus();
      },

      blur: () => {
        selectRef.current.blur();
      },

      clear: () => {
        selectRef.current.clear();
      },

      isFocused: () => {
        return selectRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        selectRef.current.setNativeProps(nativeProps);
      },
    }),
    [],
  );

  /**
   * Get appropriate CSS class for status styling
   * @param {string} key - Status key
   * @returns {string} CSS class name
   */
  const getClassNameFromStatus = (key) => {
    switch (key) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Select
      ref={selectRef}
      placeholder={props?.placeholder || t('components.statusSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {Object.keys(NotificationStatus).map((key) => (
        <Option key={key} value={key}>
          <strong className={getClassNameFromStatus(key)}>{NotificationStatus[key]}</strong>
        </Option>
      ))}
    </Select>
  );
});
