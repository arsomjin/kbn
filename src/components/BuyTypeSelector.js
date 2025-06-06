/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { BuyType } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ placeholder, isBaac, ...props }, ref) => {
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
    <Select ref={selectRef} placeholder={placeholder || 'การชำระเงิน'} {...props}>
      {Object.keys(BuyType).map(sl => (
        <Option key={sl} value={sl}>
          {BuyType[sl]}
        </Option>
      ))}
      {/* {isBaac && (
        <Option value="baac" key="baac">
          ลูกหนี้ สกต/ธกส
        </Option>
      )} */}
    </Select>
  );
});
