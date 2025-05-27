import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

const { Option } = Select;

/**
 * CommonSelector Component
 *
 * A reusable selector component that can handle both array and object option data.
 * Provides optional "All" option and search functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {boolean} props.hasAll - Whether to include "All" option
 * @param {Array|Object} props.optionData - Data for selector options
 * @param {Object} ref - Component reference for imperative methods
 * @returns {React.ForwardRefExoticComponent} Common selector component
 */
export default forwardRef(({ placeholder, hasAll, optionData, ...props }, ref) => {
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

  const Options = Array.isArray(optionData)
    ? optionData.map((it) => (
        <Option value={it} key={it}>
          {it}
        </Option>
      ))
    : Object.keys(optionData || {}).map((k) => {
        return (
          <Option value={k} key={k}>
            {optionData[k] || k}
          </Option>
        );
      });

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('components.commonSelector.placeholder')}
      styles={{ popup: { root: { minWidth: 100, ...props.dropdownStyle } } }}
      showSearch
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {hasAll
        ? [
            <Option key="all" value="all">
              {t('common.all')}
            </Option>,
            ...Options,
          ]
        : Options}
    </Select>
  );
});
