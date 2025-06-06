/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { distinctArr } from 'functions';
const { Option } = Select;

export default forwardRef(({ hasAll, isUsed, isVehicle, ...props }, ref) => {
  const { modelList } = useSelector(state => state.data);
  const selectRef = useRef();

  const { data } = modelList;

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

  let arr = Object.keys(data || {}).map(k => data[k]);

  arr = distinctArr(arr, ['productCode']);

  if (typeof isUsed !== 'undefined') {
    arr = arr.filter(l => (isUsed ? !!l.isUsed : !l.isUsed));
  }

  if (typeof isVehicle !== 'undefined') {
    arr = arr.filter(l => (isVehicle ? !!l.isVehicle : !l.isVehicle));
  }

  return (
    <Select
      ref={selectRef}
      placeholder={props?.placeholder || 'เลือก รุ่น / ชื่อสินค้า'}
      dropdownStyle={{ minWidth: 320 }}
      style={{ display: 'flex' }}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => {
        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      }}
      {...props}
    >
      {hasAll
        ? [
            <Option key="all" value="all">
              ทั้งหมด
            </Option>,
            ...arr.map(it => (
              <Option key={it._key} value={it.productPCode}>
                {`${it.model} ${it.productName}`}
              </Option>
            ))
          ]
        : arr.map(it => (
            <Option key={it._key} value={it.productPCode}>
              {`${it.model} ${it.productName}`}
            </Option>
          ))}
    </Select>
  );
});
