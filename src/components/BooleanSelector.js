/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { Check, Close } from '@material-ui/icons';
const { Option } = Select;

export default forwardRef(({ hasAll, branchCode, ...props }, ref) => {
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
    <Select ref={selectRef} dropdownStyle={branchCode ? { minWidth: 80 } : undefined} {...props}>
      {[
        [
          { label: <Check />, value: true },
          { label: <Close />, value: false }
        ].map((it, i) => (
          <Option key={i} value={it.value}>
            {it.label}
          </Option>
        ))
      ]}
    </Select>
  );
});
