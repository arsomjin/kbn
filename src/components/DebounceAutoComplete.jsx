import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { AutoComplete, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

/**
 * DebounceAutoComplete - A debounced AutoComplete component with modern React patterns
 * @param {Object} props - Component props
 * @param {Function} props.fetchOptions - Function to fetch options based on search value
 * @param {number} props.debounceTimeout - Debounce timeout in milliseconds
 * @param {string} props.mode - AutoComplete mode (multiple, tags)
 * @param {boolean} props.hasAll - Include "All" option in results
 * @param {boolean} props.disabled - Disable the component
 * @param {string} props.value - Current value
 * @param {string} props.placeholder - Placeholder text
 */
const DebounceAutoComplete = forwardRef(
  (
    {
      fetchOptions,
      debounceTimeout = 800,
      mode,
      hasAll = false,
      disabled = false,
      placeholder,
      value,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    const selectRef = useRef();

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
        clear: () => {
          selectRef.current?.clear();
        },
        isFocused: () => {
          return selectRef.current?.isFocused();
        },
        setNativeProps(nativeProps) {
          selectRef.current?.setNativeProps(nativeProps);
        },
      }),
      [],
    );

    /**
     * Load options with proper cleanup and state management
     */
    const loadOptions = useCallback(
      async (searchValue) => {
        if (!fetchOptions || !searchValue) {
          setOptions(hasAll ? [{ label: t('components.common.all'), value: 'all' }] : []);
          return;
        }

        fetchRef.current += 1;
        const fetchId = fetchRef.current;
        setOptions([]);
        setFetching(true);

        try {
          const newOptions = await fetchOptions(searchValue);

          // Check if this is still the latest request
          if (fetchId !== fetchRef.current) {
            return;
          }

          if (newOptions && Array.isArray(newOptions)) {
            const allOption = hasAll ? [{ label: t('components.common.all'), value: 'all' }] : [];
            setOptions([...allOption, ...newOptions]);
          } else {
            setOptions(hasAll ? [{ label: t('components.common.all'), value: 'all' }] : []);
          }
        } catch (error) {
          console.error('Error fetching options:', error);
          setOptions(hasAll ? [{ label: t('components.common.all'), value: 'all' }] : []);
        } finally {
          setFetching(false);
        }
      },
      [fetchOptions, hasAll, t],
    );

    /**
     * Debounced fetcher with proper cleanup
     */
    const debounceFetcher = useMemo(() => {
      return debounce(loadOptions, debounceTimeout);
    }, [loadOptions, debounceTimeout]);

    // Initialize options when component mounts or value changes
    useEffect(() => {
      if (value) {
        debounceFetcher(value);
      }

      // Cleanup debounced function on unmount
      return () => {
        debounceFetcher.cancel();
      };
    }, [value, debounceFetcher]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        debounceFetcher.cancel();
      };
    }, [debounceFetcher]);

    return (
      <AutoComplete
        ref={selectRef}
        showSearch
        mode={mode}
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : t('components.common.noData')}
        options={options}
        disabled={disabled}
        placeholder={placeholder || t('components.autoComplete.placeholder')}
        className="w-full"
        allowClear
        {...props}
      />
    );
  },
);

DebounceAutoComplete.displayName = 'DebounceAutoComplete';

export default DebounceAutoComplete;
