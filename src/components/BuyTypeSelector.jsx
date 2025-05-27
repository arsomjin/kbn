import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { BuyType } from 'data/Constant';

const { Option } = Select;

/**
 * BuyTypeSelector component for selecting purchase types
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {boolean} props.isBaac - Whether to include BAAC option (currently disabled)
 * @param {Object} ref - Forward ref for component access
 * @returns {JSX.Element} BuyType selector component
 */
export default forwardRef(({ placeholder, isBaac, ...props }, ref) => {
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
      placeholder={placeholder || t('components.buyTypeSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {Object.keys(BuyType).map((key) => (
        <Option key={key} value={key}>
          {BuyType[key]}
        </Option>
      ))}
      {/* {isBaac && (
        <Option value="baac" key="baac">
          {t('components.buyTypeSelector.baacOption')}
        </Option>
      )} */}
    </Select>
  );
});
