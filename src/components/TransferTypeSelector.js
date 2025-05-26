/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { TransferType, TransferInType } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ placeholder, hasAll, transferIn, ...props }, ref) => {
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

  let MObject = transferIn ? TransferInType : TransferType;

  const Options = Object.keys(MObject).map(k => {
    return (
      <Option value={k} key={k}>
        {MObject[k]}
      </Option>
    );
  });

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || 'ประเภทการเคลื่อนไหว'}
      {...props}
      style={{ ...props.style, minWidth: 150 }}
    >
      {hasAll
        ? [
            <Option key="all" value="all">
              ทั้งหมด
            </Option>,
            ...Options
          ]
        : Options}
    </Select>
  );
});
