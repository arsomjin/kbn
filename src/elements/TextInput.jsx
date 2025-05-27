import { Input, Typography } from 'antd';
import React, { forwardRef, Fragment, memo, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TextInput = forwardRef((props, ref) => {
  const { error, lastField, onKeyPress, focusNextField, ...mProps } = props;

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

  const styles = {
    errorTxt: {
      color: '#f50057',
      margin: 5,
      fontSize: '14px',
    },
  };

  return (
    <>
      <Input
        ref={input}
        status={error ? 'error' : ''}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            if (lastField) {
              e.target.blur();
            }
            // if (preventAutoSubmit) {
            //   e.preventDefault();
            // }
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            let nextFocus = 1;
            if (focusNextField) {
              nextFocus = focusNextField;
            }
            form.elements[index + nextFocus].focus();
            e.preventDefault();
            onKeyPress && onKeyPress(e);
          }
        }}
        {...mProps}
      />
      {!!error && (
        <Typography.Text type="danger" style={styles.errorTxt}>
          {error}
        </Typography.Text>
      )}
    </>
  );
});

export default memo(TextInput);
