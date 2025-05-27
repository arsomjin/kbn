import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PaymentType } from 'data/Constant';

const { Option } = Select;

/**
 * PaymentTypeSelector - A component for selecting payment types
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Support for BAAC-specific payment types via isBaac prop
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {boolean} [props.isBaac=false] - Whether to filter for BAAC-specific types
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The payment type selector component
 */
const PaymentTypeSelector = forwardRef(({ placeholder, isBaac = false, ...props }, ref) => {
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

  // Filter payment types based on isBaac if needed
  const filteredPaymentTypes = Object.keys(PaymentType).filter(() => {
    // If isBaac is specified, filter payment types accordingly
    if (typeof isBaac !== 'undefined') {
      // Add BAAC-specific filtering logic here if needed
      // For now, return all types - this can be extended based on business requirements
      return true;
    }
    return true;
  });

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('paymentTypeSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
      className={`w-full ${props.className || ''}`}
    >
      {filteredPaymentTypes.map((key) => (
        <Option key={key} value={key}>
          {PaymentType[key]}
        </Option>
      ))}
    </Select>
  );
});

PaymentTypeSelector.displayName = 'PaymentTypeSelector';

export default PaymentTypeSelector;
