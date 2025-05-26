/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { Seller } from 'data/Constant';
const { Option } = Select;

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
    <Select ref={selectRef} placeholder={placeholder || 'ผู้จำหน่าย'} {...props}>
      {Object.keys(Seller).map(sl => (
        <Option key={sl} value={sl}>
          {Seller[sl]}
        </Option>
      ))}
    </Select>
  );
});
