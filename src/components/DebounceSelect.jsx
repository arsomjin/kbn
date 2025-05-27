import React, { useState, useRef, useEffect } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';

function DebounceSelect({ fetchOptions, debounceTimeout = 800, hasAll, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value) => {
      console.log('DebounceSelect: Loading options for value:', value);
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        console.log('DebounceSelect: Received options:', newOptions);
        if (fetchId !== fetchRef.current) {
          console.log('DebounceSelect: Ignoring stale results');
          return;
        }

        // Add "All" option if hasAll is true and options exist
        let finalOptions = newOptions || [];
        if (hasAll && finalOptions.length > 0) {
          finalOptions = [{ label: 'All', value: 'all', key: 'all' }, ...finalOptions];
        }

        setOptions(finalOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout, hasAll]);

  useEffect(() => {
    console.log('DebounceSelect: Current options:', options);
  }, [options]);

  // Transform value to ensure it's in the correct format for labelInValue
  const transformValue = (value) => {
    if (!value) return value;

    // If labelInValue is not set, return as is
    if (!props.labelInValue) return value;

    // Handle array values (multiple/tags mode)
    if (Array.isArray(value)) {
      return value.map((item) => {
        // If already in correct format, return as is
        if (typeof item === 'object' && item !== null && 'value' in item) {
          return item;
        }

        // Find corresponding option to get the label
        const option = options.find((opt) => opt.value === item);
        return {
          value: item,
          label: option ? option.label : item,
        };
      });
    }

    // Handle single values
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return value;
    }

    // Find corresponding option to get the label
    const option = options.find((opt) => opt.value === value);
    return {
      value: value,
      label: option ? option.label : value,
    };
  };

  // Extract hasAll and other non-DOM props to prevent them from being passed to Select
  const { value, onChange, ...selectProps } = props;

  const handleChange = (newValue) => {
    console.log('DebounceSelect: onChange called with:', newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Select
      showSearch
      mode={selectProps.mode || undefined}
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...selectProps}
      options={options}
      value={transformValue(value)}
      onChange={handleChange}
    />
  );
}

export default DebounceSelect;
