import { Typography, Select } from 'antd';
import React, { forwardRef, Fragment, memo, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const SearchSelect = forwardRef((props, ref) => {
  const {
    error,
    lastField,
    onKeyPress,
    focusNextField,
    size,
    height,
    noOptionsMessage,
    options,
    placeholder,
    ...mProps
  } = props;

  const { t } = useTranslation();

  const input = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        input.current?.focus();
      },

      blur: () => {
        input.current?.blur();
      },

      clear: () => {
        input.current?.clear();
      },

      isFocused: () => {
        return input.current?.isFocused();
      },

      setNativeProps(nativeProps) {
        input.current?.setNativeProps(nativeProps);
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
    <Fragment>
      <Select
        ref={input}
        showSearch
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={options}
        size={size}
        style={{ height: height, width: '100%' }}
        notFoundContent={noOptionsMessage || t('common.noData')}
        disabled={mProps?.disabled || mProps?.readOnly}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (lastField) {
              e.target.blur();
            }
            const form = e.target.form;
            if (form) {
              const index = Array.prototype.indexOf.call(form, e.target);
              let nextFocus = 1;
              if (focusNextField) {
                nextFocus = focusNextField;
              }
              form.elements[index + nextFocus] && form.elements[index + nextFocus].focus();
            }
            e.preventDefault();
            onKeyPress && onKeyPress(e);
          }
        }}
        {...mProps}
      />
      {!!error && (
        <Typography component="p" style={styles.errorTxt}>
          {error}
        </Typography>
      )}
    </Fragment>
  );
});

export default memo(SearchSelect);
