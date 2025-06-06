/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { PaymentMethod } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ placeholder, isBaac, ...props }, ref) => {
  const selectMethodRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectMethodRef.current.focus();
      },

      blur: () => {
        selectMethodRef.current.blur();
      },

      clear: () => {
        selectMethodRef.current.clear();
      },

      isFocused: () => {
        return selectMethodRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        selectMethodRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  return (
    <Select
      ref={selectMethodRef}
      placeholder={placeholder || 'วิธีโอนเงิน'}
      dropdownStyle={{ minWidth: 150 }}
      {...props}
    >
      {Object.keys(PaymentMethod).map(sl => (
        <Option key={sl} value={sl}>
          {PaymentMethod[sl]}
        </Option>
      ))}
    </Select>
  );
});
