/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
const { Option } = Select;

export default forwardRef(({ placeholder, hasAll, optionData, ...props }, ref) => {
  const selectRef = useRef();
  // showLog('common_selector_props', props);
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

  const Options = Array.isArray(optionData)
    ? optionData.map(it => (
        <Option value={it} key={it}>
          {it}
        </Option>
      ))
    : Object.keys(optionData).map(k => {
        return (
          <Option value={k} key={k}>
            {optionData[k] || k}
          </Option>
        );
      });

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || 'รายการ'}
      dropdownStyle={{ minWidth: 100, ...props.dropdownStyle }}
      {...props}
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
