import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';

const { Option } = Select;

/**
 * WithHoldingTax Document Selector Component
 * Provides dropdown selection for tax document types (ภงด.)
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

  const taxDocumentTypes = [
    { value: 1, label: t('taxDocument.type1') },
    { value: 3, label: t('taxDocument.type3') },
    { value: 53, label: t('taxDocument.type53') },
  ];

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('taxDocument.placeholder')}
      dropdownStyle={{
        minWidth: isMobile ? 160 : 200,
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
      {taxDocumentTypes.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
});
