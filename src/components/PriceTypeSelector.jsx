import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PriceType } from 'data/Constant';

const { Option } = Select;

/**
 * PriceTypeSelector - A component for selecting price types
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The price type selector component
 */
const PriceTypeSelector = forwardRef(({ placeholder, ...props }, ref) => {
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
      placeholder={placeholder || t('priceTypeSelector.placeholder')}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
      style={{ ...props.style }}
      className={`w-full ${props.className || ''}`}
    >
      {Object.keys(PriceType).map((key) => (
        <Option value={key} key={key}>
          {PriceType[key]}
        </Option>
      ))}
    </Select>
  );
});

PriceTypeSelector.displayName = 'PriceTypeSelector';

export default PriceTypeSelector;
