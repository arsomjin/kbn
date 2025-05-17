import React, { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import { Select, Spin } from "antd";
import type { SelectProps, RefSelectProps } from "antd/es/select";
// @ts-ignore
import debounce from "lodash/debounce";

export interface OptionType {
  label: string;
  value: string;
  [key: string]: any;
}

export interface DebounceSelectProps extends Omit<SelectProps<any>, "options" | "onSearch"> {
  value?: any;
  fetchOptions: (value: string) => Promise<OptionType[]>;
  debounceTimeout?: number;
  mode?: "multiple" | "tags";
  hasAll?: boolean;
}

const DebounceSelect = forwardRef<RefSelectProps, DebounceSelectProps>(
  (
    { value, fetchOptions, debounceTimeout = 800, mode, hasAll, ...props },
    ref
  ) => {
    const [fetching, setFetching] = React.useState(false);
    const [options, setOptions] = React.useState<OptionType[]>([]);
    const selectRef = useRef<RefSelectProps>(null);
    const isMounted = useRef(true);

    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => {
        selectRef.current?.focus();
      },
      blur: () => {
        selectRef.current?.blur();
      },
      scrollTo: (...args: any[]) => {
        // @ts-ignore
        selectRef.current?.scrollTo?.(...args);
      },
      get nativeElement() {
        // @ts-ignore
        return selectRef.current?.nativeElement ?? document.createElement('div');
      }
    }), []);

    useEffect(() => {
      if (value) debounceFetcher(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const debounceFetcher = React.useMemo(() => {
      return debounce((search: string) => {
        if (!isMounted.current) return;
        setOptions([]);
        setFetching(true);
        fetchOptions(search).then(newOptions => {
          if (!isMounted.current) return;
          if (!newOptions) {
            setFetching(false);
            return;
          }
          setOptions(hasAll ? [{ label: "ทั้งหมด", value: "all" }, ...newOptions] : newOptions);
          setFetching(false);
        });
      }, debounceTimeout);
    }, [debounceTimeout, fetchOptions, hasAll]);

    useEffect(() => {
      return () => {
        debounceFetcher.cancel();
      };
    }, [debounceFetcher]);

    return (
      <Select
        ref={selectRef}
        showSearch
        mode={mode}
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        options={options}
        disabled={props?.disabled}
        value={value || undefined}
        {...props}
      />
    );
  }
);

DebounceSelect.displayName = "DebounceSelect";

export default DebounceSelect; 