import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { SaleType } from 'data/Constant';

const { Option } = Select;

/**
 * SaleTypeSelector - A component for selecting sale types
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Filtering options for leasing-only and reservation inclusion
 * - Optional "All" option for filtering scenarios
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {boolean} [props.hasAll=false] - Whether to include "All" option
 * @param {boolean} [props.onlyLeasing=false] - Whether to show only leasing types
 * @param {boolean} [props.includeReservation=true] - Whether to include reservation type
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The sale type selector component
 */
const SaleTypeSelector = forwardRef(
  (
    { placeholder, hasAll = false, onlyLeasing = false, includeReservation = true, ...props },
    ref,
  ) => {
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

    const filteredSaleTypes = Object.keys(SaleType)
      .filter((key) => {
        // Filter for leasing only if specified
        if (onlyLeasing) {
          return ['baac', 'sklLeasing', 'kbnLeasing'].includes(key);
        }

        // Exclude reservation if not included
        if (!includeReservation && key === 'reservation') {
          return false;
        }

        return true;
      })
      .map((key) => (
        <Option value={key} key={key}>
          {SaleType[key]}
        </Option>
      ));

    return (
      <Select
        ref={selectRef}
        placeholder={placeholder || t('saleTypeSelector.placeholder')}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...props}
        style={{ ...props.style, minWidth: 150 }}
        className={`w-full ${props.className || ''}`}
      >
        {hasAll && (
          <Option key="all" value="all">
            {t('common.all')}
          </Option>
        )}
        {filteredSaleTypes}
      </Select>
    );
  },
);

SaleTypeSelector.displayName = 'SaleTypeSelector';

export default SaleTypeSelector;
