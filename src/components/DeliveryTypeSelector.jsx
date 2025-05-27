import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeliveryType } from 'data/Constant';

const { Option } = Select;

/**
 * DeliveryTypeSelector - A component for selecting delivery types
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
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {boolean} [props.hasAll=false] - Whether to include "All" option
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The delivery type selector component
 */
const DeliveryTypeSelector = forwardRef(({ placeholder, hasAll = false, ...props }, ref) => {
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

  const deliveryOptions = Object.keys(DeliveryType).map((key) => (
    <Option value={key} key={key}>
      {DeliveryType[key]}
    </Option>
  ));

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('deliveryTypeSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
      style={{
        ...props.style,
        minWidth: 150,
      }}
      className={`w-full ${props.className || ''}`}
    >
      {hasAll && (
        <Option key="all" value="all">
          {t('common.all')}
        </Option>
      )}
      {deliveryOptions}
    </Select>
  );
});

DeliveryTypeSelector.displayName = 'DeliveryTypeSelector';

export default DeliveryTypeSelector;
