import { Typography } from '@material-ui/core';
import React, { forwardRef, Fragment, memo, useCallback } from 'react';
import { FormSelect } from 'shards-react';

const Selector = forwardRef((props, ref) => {
  const { children, focusNextField, onChange, initialWords, error, ...mProps } = props;
  // showLog('select_remaining_props', mProps);

  const styles = {
    errorTxt: {
      color: '#f50057',
      margin: 5,
      fontSize: '14px'
    }
  };

  const _onChange = useCallback(
    e => {
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      if (focusNextField) {
        form.elements[index + focusNextField].focus();
        e.preventDefault();
      }
      onChange && onChange(e);
    },
    [focusNextField, onChange]
  );

  return (
    <Fragment>
      <FormSelect onChange={_onChange} {...mProps}>
        {initialWords
          ? [
              <option key="init" value="" disabled hidden>
                {initialWords}
              </option>,
              ...children
            ]
          : children}
      </FormSelect>
      {!!error && (
        <Typography component="p" style={styles.errorTxt}>
          {error}
        </Typography>
      )}
    </Fragment>
  );
});

export default memo(Selector);
