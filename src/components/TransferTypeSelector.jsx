import React, { forwardRef, useRef, useImperativeHandle, useMemo } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { TransferType, TransferInType } from 'data/Constant';

const { Option } = Select;

/**
 * TransferTypeSelector - Modern transfer type selector component
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {boolean} props.hasAll - Include "All" option in the list
 * @param {boolean} props.transferIn - Use TransferInType instead of TransferType
 * @param {boolean} props.disabled - Disable the component
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler function
 * @param {Object} props.style - Additional inline styles
 */
const TransferTypeSelector = forwardRef(
  (
    {
      placeholder,
      hasAll = false,
      transferIn = false,
      disabled = false,
      value,
      onChange,
      style = {},
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const selectRef = useRef();

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
          return selectRef.current?.isFocused();
        },
        setNativeProps(nativeProps) {
          selectRef.current?.setNativeProps(nativeProps);
        },
      }),
      [],
    );

    /**
     * Generate options based on transfer type
     */
    const options = useMemo(() => {
      const transferObject = transferIn ? TransferInType : TransferType;

      const baseOptions = Object.keys(transferObject).map((key) => ({
        value: key,
        label: transferObject[key],
        key: key,
      }));

      if (hasAll) {
        return [
          {
            value: 'all',
            label: t('components.common.all'),
            key: 'all',
          },
          ...baseOptions,
        ];
      }

      return baseOptions;
    }, [transferIn, hasAll, t]);

    return (
      <Select
        ref={selectRef}
        placeholder={placeholder || t('components.transferType.placeholder')}
        disabled={disabled}
        value={value}
        onChange={onChange}
        style={{
          minWidth: 150,
          ...style,
        }}
        className="w-full"
        allowClear
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
        {...props}
      >
        {options.map((option) => (
          <Option value={option.value} key={option.key} title={option.label}>
            {option.label}
          </Option>
        ))}
      </Select>
    );
  },
);

TransferTypeSelector.displayName = 'TransferTypeSelector';

export default TransferTypeSelector;
