import React, { useState, useRef, useEffect } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import { SelectOption } from '../types/common';

export interface DebounceSelectProps<ValueType = SelectOption>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<ValueType extends SelectOption = SelectOption>({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value: string) => {
      console.log('DebounceSelect: Loading options for value:', value);
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then(newOptions => {
        console.log('DebounceSelect: Received options:', newOptions);
        if (fetchId !== fetchRef.current) {
          console.log('DebounceSelect: Ignoring stale results');
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  useEffect(() => {
    console.log('DebounceSelect: Current options:', options);
  }, [options]);

  return (
    <Select<ValueType>
      showSearch
      mode={props.mode || undefined}
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size='small' /> : null}
      {...props}
      options={options}
      value={props.value as ValueType}
    />
  );
}

export default DebounceSelect;
