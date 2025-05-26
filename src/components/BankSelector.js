/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { ThaiBanks } from 'data/Constant';
const { Option } = Select;

export default forwardRef((props, ref) => {
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
    <Select ref={selectRef} placeholder="ธนาคาร" {...props}>
      {Object.keys(ThaiBanks).map(k => (
        <Option key={k} value={k}>
          {ThaiBanks[k].name}
        </Option>
      ))}
    </Select>
  );
});
