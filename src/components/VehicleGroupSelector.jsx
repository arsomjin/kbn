import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import { VehicleGroup } from 'data/Constant';

const { Option } = Select;

/**
 * Vehicle Group Selector Component
 * Provides dropdown selection for vehicle groups with optional filters
 * @param {Object} props - Component props
 * @param {boolean} props.hasAll - Include "All" option
 * @param {boolean} props.hasDrone - Include drone option
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} ref - Component reference
 */
export default forwardRef(({ hasAll, hasDrone, placeholder, ...props }, ref) => {
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

  // Filter vehicle groups based on props
  let vehicleGroups = { ...VehicleGroup };
  if (!hasDrone) {
    delete vehicleGroups.drone;
  }

  const groupOptions = Object.keys(vehicleGroups || {}).map((key) => ({
    label: t(`vehicle.group.${key}`, { defaultValue: vehicleGroups[key].name }),
    value: key,
  }));

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || t('vehicle.group.placeholder')}
      dropdownStyle={{
        minWidth: isMobile ? 120 : 140,
        maxHeight: 300,
      }}
      className="w-full"
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      allowClear
      {...props}
    >
      {groupOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}

      {hasAll && (
        <Option key="all" value="all">
          {t('common.all')}
        </Option>
      )}
    </Select>
  );
});
