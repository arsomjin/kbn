/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { PriceType } from 'data/Constant';
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
    <Select ref={selectRef} placeholder={placeholder || 'ประเภทราคา'} {...props} style={{ ...props.style }}>
      {Object.keys(PriceType).map(k => (
        <Option value={k} key={k}>
          {PriceType[k]}
        </Option>
      ))}
    </Select>
  );
});
