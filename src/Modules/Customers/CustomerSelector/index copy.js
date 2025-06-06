import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
const { Option } = Select;

export default forwardRef(({ onChange, placeholder, hasAll, ...props }, ref) => {
  const { customers } = useSelector(state => state.data);

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

  const handleChange = value => {
    onChange && onChange(value);
  };

  let Options = Object.keys(customers).map(dl => (
    <Option key={dl} value={dl}>{`${customers[dl].prefix}${customers[dl].firstName} ${customers[dl].lastName}`}</Option>
  ));

  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        placeholder={placeholder || 'ลูกค้า'}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        dropdownStyle={{ minWidth: 380 }}
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
    </>
  );
});
