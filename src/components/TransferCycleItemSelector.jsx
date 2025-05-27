import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

// Transfer cycle item definitions
const TransferCycleItems = {
  hqTransfer: {
    name: 'รายจ่ายเงินโอนสำนักงานใหญ่',
    itemId: 'hqTransfer',
  },
  purchaseTransfer: {
    name: 'เงินโอนค่าซื้อสินค้า',
    itemId: 'purchaseTransfer',
  },
  referralFee: {
    name: 'ค่าแนะนำ',
    itemId: 'referralFee',
  },
};

/**
 * TransferCycleItemSelector - A component for selecting transfer cycle items
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Optional "All" option for filtering scenarios
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {boolean} [props.hasAll=false] - Whether to include "All" option
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The transfer cycle item selector component
 */
const TransferCycleItemSelector = forwardRef(({ hasAll = false, placeholder, ...props }, ref) => {
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

  const transferCycleOptions = Object.keys(TransferCycleItems).map((key) => (
    <Option key={key} value={key}>
      {TransferCycleItems[key].name}
    </Option>
  ));

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('transferCycleItemSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      className={`text-primary w-full ${props.className || ''}`}
      {...props}
    >
      {hasAll && (
        <Option key="all" value="all">
          {t('common.all')}
        </Option>
      )}
      {transferCycleOptions}
    </Select>
  );
});

TransferCycleItemSelector.displayName = 'TransferCycleItemSelector';

export default TransferCycleItemSelector;
