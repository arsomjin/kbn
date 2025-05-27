import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

/**
 * BooleanSelector component for selecting true/false values with icons
 * @param {Object} props - Component props
 * @param {boolean} props.hasAll - Whether to include "All" option (currently unused but kept for compatibility)
 * @param {string} props.branchCode - Branch code for styling adjustments
 * @param {Object} ref - Forward ref for component access
 * @returns {JSX.Element} Boolean selector component with check/close icons
 */
export default forwardRef(({ hasAll, branchCode, ...props }, ref) => {
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

  const booleanOptions = [
    {
      label: <CheckOutlined className="text-green-600 dark:text-green-400" />,
      value: true,
      title: t('components.booleanSelector.true'),
    },
    {
      label: <CloseOutlined className="text-red-600 dark:text-red-400" />,
      value: false,
      title: t('components.booleanSelector.false'),
    },
  ];

  return (
    <Select
      ref={selectRef}
      dropdownStyle={branchCode ? { minWidth: 80 } : undefined}
      placeholder={t('components.booleanSelector.placeholder')}
      {...props}
    >
      {booleanOptions.map((item, index) => (
        <Option key={index} value={item.value} title={item.title}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
});
