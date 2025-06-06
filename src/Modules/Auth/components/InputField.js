import React, { forwardRef, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

export default forwardRef((props, ref) => {
  const { error, autoCap, lastField, preventAutoSubmit, onKeyPress, type, ...mProps } = props;

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(sh => !sh);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const styles = {
    errorTxt: {
      color: '#ff669c',
      //   color: '#f50057',
      margin: 5,
      fontSize: '14px'
    },
    inputLabel: { color: 'lightgrey' },
    input: {
      color: '#fff',
      backgroundColor: 'rgba(205,205,205,0.3)',
      textTransform: autoCap ? 'capitalize' : 'lowercase'
    },
    adornment: {
      backgroundColor: 'transparent'
    }
  };
  return (
    <TextField
      variant="filled"
      margin="normal"
      required
      fullWidth
      type={showPassword ? 'text' : type}
      InputLabelProps={{ style: styles.inputLabel }}
      InputProps={{
        endAdornment:
          type === 'password' ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ) : null,
        style: styles.input,
        autoCapitalize: autoCap || 'none'
      }}
      error={!!error}
      helperText={error}
      FormHelperTextProps={{ style: styles.errorTxt }}
      onKeyPress={e => {
        if (e.key === 'Enter') {
          if (lastField) {
            e.target.blur();
          }
          // if (preventAutoSubmit) {
          //   e.preventDefault();
          // }
          const form = e.target.form;
          const index = Array.prototype.indexOf.call(form, e.target);
          form.elements[index + 1].focus();
          e.preventDefault();
          onKeyPress && onKeyPress(e);
        }
      }}
      {...mProps}
    />
  );
});
