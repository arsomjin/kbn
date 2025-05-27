import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';

const { Option } = Select;

/**
 * WithHoldingTax Selector Component
 * Provides dropdown selection for withholding tax percentages
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} ref - Component reference
 */
export default forwardRef(({ placeholder, ...props }, ref) => {
  const { t } = useTranslation('components');
  const selectRef = useRef();
  const { isMobile } = useResponsive();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current?.focus();
      },

      blur: () => {
        selectRef.current?.blur();
      },

      clear: () => {
        selectRef.current?.clear();
      },

      isFocused: () => {
        return selectRef.current?.isFocused() || false;
      },

      setNativeProps(nativeProps) {
        selectRef.current?.setNativeProps?.(nativeProps);
      },
    }),
    [],
  );

  const withHoldingTaxOptions = [
    { value: 0, label: t('withHoldingTax.none') },
    { value: 1, label: t('withHoldingTax.rate1') },
    { value: 2, label: t('withHoldingTax.rate2') },
    { value: 3, label: t('withHoldingTax.rate3') },
    { value: 5, label: t('withHoldingTax.rate5') },
  ];

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('withHoldingTax.placeholder')}
      dropdownStyle={{
        minWidth: isMobile ? 120 : 140,
        maxHeight: 200,
      }}
      className="w-full"
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {withHoldingTaxOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
});
