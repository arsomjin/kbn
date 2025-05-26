/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Select } from 'antd';
import { VehicleItemType } from 'data/Constant';

export default forwardRef(({ placeholder, ...props }, ref) => {
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

  return (
    <Select ref={selectRef} {...props} dropdownStyle={{ minWidth: 180 }}>
      {Object.keys(VehicleItemType).map(k => (
        <Select.Option value={k} key={k}>
          {VehicleItemType[k]}
        </Select.Option>
      ))}
    </Select>
  );
});
