/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
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
    <Select ref={selectRef} placeholder={placeholder || 'แบบแสดงภาษี หัก ณ ที่จ่าย'} {...props}>
      <Option value={1}>{'ภงด. 1'}</Option>
      <Option value={3}>{'ภงด. 3'}</Option>
      <Option value={53}>{'ภงด. 53'}</Option>
    </Select>
  );
});
