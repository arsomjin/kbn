/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Radio } from 'antd';
import { DataInputType } from 'data/Constant';

export default forwardRef(({ placeholder, ...props }, ref) => {
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
    <Radio.Group
      ref={selectRef}
      // buttonStyle="solid"
      placeholder={placeholder || 'วิธีบันทึกรายการ'}
      {...props}
    >
      <Radio.Button value="importFromFile">{DataInputType.importFromFile}</Radio.Button>
      <Radio.Button value="manualInput">{DataInputType.manualInput}</Radio.Button>
    </Radio.Group>
  );
});
