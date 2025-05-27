import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { Seller } from 'data/Constant';

const { Option } = Select;

/**
 * SellerSelector component for selecting seller types
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {Object} ref - Forward ref for component access
 * @returns {JSX.Element} Seller selector component
 */
export default forwardRef(({ placeholder, ...props }, ref) => {
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
      placeholder={placeholder || t('components.sellerSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {Object.keys(Seller).map((key) => (
        <Option key={key} value={key}>
          {Seller[key]}
        </Option>
      ))}
    </Select>
  );
});
