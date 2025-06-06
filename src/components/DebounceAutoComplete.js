import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { AutoComplete, Spin } from 'antd';
import debounce from 'lodash/debounce';

const DebounceAutoComplete = forwardRef(({ fetchOptions, debounceTimeout = 800, mode, hasAll, ...props }, ref) => {
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const fetchRef = React.useRef(0);

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

  useEffect(() => {
    // Get initial options from default value.
    props.value && debounceFetcher(props.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = value => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current || !newOptions) {
          // for fetch callback order
          setFetching(false);
          return;
        }
        //  showLog({ newOptions });
        setOptions(hasAll ? [{ label: 'ทั้งหมด', value: 'all' }, ...newOptions] : newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [debounceTimeout, fetchOptions, hasAll]);

  // showLog({ options });

  return (
    <AutoComplete
      ref={selectRef}
      showSearch
      mode={mode}
      // labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      // loading={fetching}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      disabled={props?.disabled}
      {...props}
    />
  );
});

export default DebounceAutoComplete;
