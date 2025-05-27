/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
const { Option } = Select;

export default forwardRef(({ hasAll, ...props }, ref) => {
  const { userGroups } = useSelector(state => state.data);

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
    <Select ref={selectRef} placeholder={props?.placeholder || 'กลุ่ม'} {...props}>
      {hasAll
        ? [
            <Option key="all" value="all">
              ทุกระดับ
            </Option>,
            ...Object.keys(userGroups).map(key => (
              <Option key={key} value={key}>
                {userGroups[key].userGroupName}
              </Option>
            ))
          ]
        : Object.keys(userGroups).map(key => (
            <Option key={key} value={key}>
              {userGroups[key].userGroupName}
            </Option>
          ))}
    </Select>
  );
});
