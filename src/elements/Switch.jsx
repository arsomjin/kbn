import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Switch } from 'antd';

export default forwardRef((props, ref) => {
  const { value, ...mProps } = props;

  const swRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        swRef.current.focus();
      },

      blur: () => {
        swRef.current.blur();
      },

      clear: () => {
        swRef.current.clear();
      },

      isFocused: () => {
        return swRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        swRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  return <Switch ref={swRef} checked={value} {...mProps} />;
});
