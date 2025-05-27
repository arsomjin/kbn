import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import { VehicleItemType } from 'data/Constant';

const { Option } = Select;

/**
 * Vehicle Item Type Selector Component
 * Provides dropdown selection for vehicle item types
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} ref - Component reference
 */
const VehicleItemTypeSelector = forwardRef(({ placeholder, ...props }, ref) => {
  const { t } = useTranslation('components');
  const selectRef = useRef();
  const { isMobile } = useResponsive();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current?.focus();
      },

      blur: () => {
        selectRef.current?.blur();
      },

      clear: () => {
        selectRef.current?.clear();
      },

      isFocused: () => {
        return selectRef.current?.isFocused() || false;
      },

      setNativeProps(nativeProps) {
        selectRef.current?.setNativeProps?.(nativeProps);
      },
    }),
    [],
  );

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('vehicle.itemType.placeholder')}
      dropdownStyle={{
        minWidth: isMobile ? 160 : 180,
        maxHeight: 300,
      }}
      className="w-full"
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {Object.keys(VehicleItemType).map((key) => (
        <Option value={key} key={key}>
          {t(`vehicle.itemType.${key}`, { defaultValue: VehicleItemType[key] })}
        </Option>
      ))}
    </Select>
  );
});

export default VehicleItemTypeSelector;
