/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { NotificationStatus } from 'data/Constant';
const { Option } = Select;

export default forwardRef(({ hasAll, ...props }, ref) => {
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

  const getClassNameFromStatus = key => {
    switch (key) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'info':
        return 'text-primary';
      case 'warning':
        return 'text-warning';

      default:
        return 'text-secondary';
    }
  };
  return (
    <Select ref={selectRef} placeholder={props?.placeholder || 'สถานะ'} {...props}>
      {Object.keys(NotificationStatus).map(key => (
        <Option key={key} value={key}>
          <strong className={getClassNameFromStatus(key)}>{NotificationStatus[key]}</strong>
        </Option>
      ))}
    </Select>
  );
});
