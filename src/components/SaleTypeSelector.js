/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { SaleType } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ placeholder, hasAll, onlyLeasing, includeReservation, ...props }, ref) => {
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

  const Options = Object.keys(SaleType).map(k => {
    if (onlyLeasing) {
      return ['baac', 'sklLeasing', 'kbnLeasing'].includes(k) ? (
        <Option value={k} key={k}>
          {SaleType[k]}
        </Option>
      ) : null;
    }
    if (!includeReservation && k === 'reservation') {
      return null;
    }
    return (
      <Option value={k} key={k}>
        {SaleType[k]}
      </Option>
    );
  });

  return (
    <Select
      ref={selectRef}
      placeholder={placeholder || 'ประเภทการขาย'}
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
