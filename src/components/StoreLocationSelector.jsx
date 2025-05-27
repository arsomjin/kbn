import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { StoreVehicleLocation, StorePartLocation } from 'data/Constant';

const { Option } = Select;

/**
 * StoreLocationSelector - A component for selecting store locations
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Support for parts vs vehicles location filtering
 * - Support for used vs new item filtering
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {boolean} [props.isPart=false] - Whether to show parts locations vs vehicle locations
 * @param {boolean} [props.isUsed] - Filter for used/new items (undefined = all)
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The store location selector component
 */
const StoreLocationSelector = forwardRef(
  ({ placeholder, isPart = false, isUsed, ...props }, ref) => {
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

    // Filter location options based on part/vehicle type and used/new status
    const locationOptions = Object.keys(isPart ? StorePartLocation : StoreVehicleLocation)
      .map((key) => ({
        key,
        value: isPart ? StorePartLocation[key] : StoreVehicleLocation[key],
      }))
      .filter((location) => {
        // Filter by used/new status if specified
        if (typeof isUsed !== 'undefined') {
          const isUsedLocation = location?.value.indexOf('มือสอง') > -1;
          return isUsed ? isUsedLocation : !isUsedLocation;
        }
        return true;
      });

    return (
      <Select
        ref={selectRef}
        placeholder={placeholder || t('storeLocationSelector.placeholder')}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...props}
        style={{ ...props.style, maxWidth: 320 }}
        styles={{ popup: { root: { minWidth: 280 } } }}
        className={`w-full ${props.className || ''}`}
      >
        {locationOptions.map((location) => (
          <Option key={location.key} value={location.value}>
            {`${location.key} - ${location.value}`}
          </Option>
        ))}
      </Select>
    );
  },
);

StoreLocationSelector.displayName = 'StoreLocationSelector';

export default StoreLocationSelector;
