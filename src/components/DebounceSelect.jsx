import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

const DebounceSelect = forwardRef(
  ({ value, fetchOptions, debounceTimeout = 800, mode, hasAll, ...props }, ref) => {
    const { t } = useTranslation('components');

    const [fetching, setFetching] = React.useState(false);
    const [options, setOptions] = React.useState([]);

    const selectRef = useRef();

    const isMounted = React.useRef(true);
    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

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
        },
      }),
      [],
    );

    useEffect(() => {
      // Get initial options from default value.
      props.value && debounceFetcher(props.value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value]);

    const debounceFetcher = React.useMemo(() => {
      return debounce((value) => {
        if (!isMounted.current) return; // Check before any state update
        setOptions([]);
        setFetching(true);
        fetchOptions(value).then((newOptions) => {
          if (!isMounted.current) return; // Check again after async resolution
          if (!newOptions) {
            // for fetch callback order
            setFetching(false);
            return;
          }
          //  showLog({ newOptions });
          setOptions(
            hasAll ? [{ label: t('common.all'), value: 'all' }, ...newOptions] : newOptions,
          );
          setFetching(false);
        });
      }, debounceTimeout);
    }, [debounceTimeout, fetchOptions, hasAll, t]);

    // Cleanup: cancel the debounced function on unmount
    useEffect(() => {
      return () => {
        debounceFetcher.cancel();
      };
    }, [debounceFetcher]);

    // showLog({ options });

    return (
      <Select
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
        value={value || undefined}
        {...props}
      />
    );
  },
);

export default DebounceSelect;
