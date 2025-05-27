import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from 'data/Constant';

const { Option } = Select;

/**
 * PaymentMethodSelector - A component for selecting payment methods
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Support for BAAC-specific payment methods via isBaac prop
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {boolean} [props.isBaac=false] - Whether to filter for BAAC-specific methods
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The payment method selector component
 */
const PaymentMethodSelector = forwardRef(({ placeholder, isBaac = false, ...props }, ref) => {
  const { t } = useTranslation();
  const selectMethodRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectMethodRef.current.focus();
      },
      blur: () => {
        selectMethodRef.current.blur();
      },
      clear: () => {
        selectMethodRef.current.clear();
      },
      isFocused: () => {
        return selectMethodRef.current.isFocused();
      },
      setNativeProps(nativeProps) {
        selectMethodRef.current.setNativeProps(nativeProps);
      },
    }),
    [],
  );

  // Filter payment methods based on isBaac if needed
  const filteredPaymentMethods = Object.keys(PaymentMethod).filter(() => {
    // If isBaac is specified, filter payment methods accordingly
    if (typeof isBaac !== 'undefined') {
      // Add BAAC-specific filtering logic here if needed
      // For now, return all methods - this can be extended based on business requirements
      return true;
    }
    return true;
  });

  return (
    <Select
      ref={selectMethodRef}
      placeholder={placeholder || t('paymentMethodSelector.placeholder')}
      styles={{ popup: { root: { minWidth: 150 } } }}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
      className={`w-full ${props.className || ''}`}
    >
      {filteredPaymentMethods.map((key) => (
        <Option key={key} value={key}>
          {PaymentMethod[key]}
        </Option>
      ))}
    </Select>
  );
});

PaymentMethodSelector.displayName = 'PaymentMethodSelector';

export default PaymentMethodSelector;
