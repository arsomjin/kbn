/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { VehicleGroup } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ hasAll, hasDrone, ...props }, ref) => {
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

  let VGroup = { ...VehicleGroup };
  if (!hasDrone) {
    delete VGroup.drone;
  }

  let arr = Object.keys(VGroup || {}).map(k => ({
    label: VGroup[k].name,
    value: k
  }));

  return (
    <Select
      ref={selectRef}
      placeholder={props?.placeholder || 'กลุ่มรถ'}
      dropdownStyle={{ minWidth: 140 }}
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
            ...arr.map(it => (
              <Option key={it.value} value={it.value}>
                {it.label}
              </Option>
            )),
            <Option key="all" value="all">
              ทั้งหมด
            </Option>
          ]
        : arr.map(it => (
            <Option key={it.value} value={it.value}>
              {it.label}
            </Option>
          ))}
    </Select>
  );
});
