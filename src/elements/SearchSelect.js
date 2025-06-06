import { Typography } from '@material-ui/core';
import React, { forwardRef, Fragment, memo, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';

const SearchSelect = forwardRef((props, ref) => {
  const { error, lastField, preventAutoSubmit, onKeyPress, focusNextField, size, height, noOptionsMessage, ...mProps } =
    props;

  const { theme } = useSelector(state => state.global);

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
      }
    }),
    []
  );

  let mHeight = height || '32px';
  if (size && !height) {
    switch (size) {
      case 'small':
        mHeight = '26px';
        break;
      case 'large':
        mHeight = '38px';
        break;

      default:
        break;
    }
  }

  const styles = {
    errorTxt: {
      color: '#f50057',
      margin: 5,
      fontSize: '14px'
    }
  };

  const mStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: 'none',
      height: mHeight,
      minHeight: mHeight,
      ...(error ? { borderColor: theme.colors.notification } : {})
      // You can also use state.isFocused to conditionally style based on the focus state
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      height: mHeight,
      padding: '0 6px'
    }),

    input: (provided, state) => ({
      ...provided,
      margin: '0px'
    }),
    indicatorSeparator: state => ({
      display: 'none'
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      height: mHeight
    }),
    placeholder: state => ({
      ...state,
      color: 'lightgray'
    })
  };

  return (
    <Fragment>
      <Select
        styles={mStyles}
        onKeyDown={e => {
          console.log('key', e.key);
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
            form.elements[index + nextFocus] && form.elements[index + nextFocus].focus();
            e.preventDefault();
            onKeyPress && onKeyPress(e);
          }
        }}
        noOptionsMessage={() => noOptionsMessage || 'ไม่มีข้อมูล'}
        isDisabled={mProps?.disabled || mProps?.readOnly}
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
