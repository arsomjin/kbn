/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { StoreVehicleLocation, StorePartLocation } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ placeholder, isPart, isUsed, ...props }, ref) => {
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
      }
    }),
    []
  );

  let optionArr = Object.keys(isPart ? StorePartLocation : StoreVehicleLocation)
    .map(k => ({
      key: k,
      value: isPart ? StorePartLocation[k] : StoreVehicleLocation[k]
    }))
    .filter(l => (isUsed ? l?.value.indexOf('มือสอง') > -1 : l?.value.indexOf('มือสอง') === -1));

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || 'คลัง'}
      {...props}
      style={{ ...props.style, maxWidth: 320 }}
      dropdownStyle={{ minWidth: 280 }}
    >
      {optionArr.map(it => (
        <Option key={it.key} value={it.value}>
          {`${it.key} - ${it.value}`}
        </Option>
      ))}
    </Select>
  );
});
