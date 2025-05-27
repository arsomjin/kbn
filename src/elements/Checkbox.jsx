import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Checkbox } from 'antd';

const CustomCheckbox = forwardRef((props, ref) => {
  const { value, onChange, children, ...mProps } = props;

  const input = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        input.current.focus();
      },

      blur: () => {
        input.current.blur();
      },

      clear: () => {
        input.current.clear();
      },

      isFocused: () => {
        return input.current.isFocused();
      },

      setNativeProps(nativeProps) {
        input.current.setNativeProps(nativeProps);
      },
    }),
    [],
  );

  const _onChange = (e) => onChange && onChange(e.target.checked);

  return (
    <Checkbox ref={input} checked={value} onChange={_onChange} {...mProps}>
      {children}
    </Checkbox>
  );
});

export default CustomCheckbox;
