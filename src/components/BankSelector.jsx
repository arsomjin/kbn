import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { ThaiBanks } from 'data/Constant';

const { Option } = Select;

/**
 * BankSelector Component
 *
 * A selector component for Thai banks with search functionality.
 * Provides selection from predefined list of Thai banks.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} ref - Component reference for imperative methods
 * @returns {React.ForwardRefExoticComponent} Bank selector component
 */
export default forwardRef((props, ref) => {
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

  return (
    <Select
      ref={selectRef}
      placeholder={t('components.bankSelector.placeholder')}
      showSearch
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {Object.keys(ThaiBanks).map((k) => (
        <Option key={k} value={k}>
          {ThaiBanks[k].name}
        </Option>
      ))}
    </Select>
  );
});
