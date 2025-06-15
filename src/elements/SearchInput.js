import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import './SearchInput.css';

const SearchInput = forwardRef((props, ref) => {
  const {
    placeholder = 'ค้นหา...',
    value,
    onChange,
    onSearch,
    size = 'default',
    allowClear = true,
    disabled = false,
    loading = false,
    enterButton = false,
    suffix,
    prefix,
    className = '',
    style = {},
    onPressEnter,
    onFocus,
    onBlur,
    maxLength,
    showCount = false,
    variant = 'outlined', // outlined, borderless, filled
    searchButtonProps = {},
    ...otherProps
  } = props;

  const inputRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      },
      select: () => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      },
      clear: () => {
        if (inputRef.current) {
          inputRef.current.clear();
        }
      },
      isFocused: () => {
        return inputRef.current ? inputRef.current.isFocused() : false;
      },
    }),
    []
  );

  const handleSearch = (searchValue, event) => {
    if (onSearch) {
      onSearch(searchValue, event);
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handlePressEnter = (e) => {
    if (onPressEnter) {
      onPressEnter(e);
    }
  };

  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Combine custom styles
  const combinedStyle = {
    width: '100%',
    ...style,
  };

  // Generate class names
  const classNames = [
    'custom-search-input',
    `custom-search-input--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Input.Search
      ref={inputRef}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      onPressEnter={handlePressEnter}
      onFocus={handleFocus}
      onBlur={handleBlur}
      size={size}
      allowClear={allowClear}
      disabled={disabled}
      loading={loading}
      enterButton={enterButton}
      suffix={suffix}
      prefix={prefix}
      className={classNames}
      style={combinedStyle}
      maxLength={maxLength}
      showCount={showCount}
      searchButtonProps={searchButtonProps}
      {...otherProps}
    />
  );
});

SearchInput.displayName = 'SearchInput';

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  enterButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  suffix: PropTypes.node,
  prefix: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  onPressEnter: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  maxLength: PropTypes.number,
  showCount: PropTypes.bool,
  variant: PropTypes.oneOf(['outlined', 'borderless', 'filled']),
  searchButtonProps: PropTypes.object,
};

export default SearchInput;
