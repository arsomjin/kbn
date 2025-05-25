import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

const { Option } = Select;

interface CommonSelectorProps extends Omit<SelectProps, 'ref'> {
  placeholder?: string;
  hasAll?: boolean;
  optionData: string[] | Record<string, string>;
}

export interface CommonSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const CommonSelector = forwardRef<CommonSelectorRef, CommonSelectorProps>(
  ({ placeholder, hasAll, optionData, ...props }, ref) => {
    const selectRef = useRef<any>(null);

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
          return selectRef.current?.isFocused() ?? false;
        },
        setNativeProps: (nativeProps: any) => {
          selectRef.current?.setNativeProps?.(nativeProps);
        }
      }),
      []
    );

    const Options = Array.isArray(optionData)
      ? optionData.map(it => (
          <Option value={it} key={it}>
            {it}
          </Option>
        ))
      : Object.keys(optionData).map(k => (
          <Option value={k} key={k}>
            {optionData[k] || k}
          </Option>
        ));

    return (
      <Select
        ref={selectRef}
        placeholder={placeholder || 'รายการ'}
        dropdownStyle={{ minWidth: 100, ...props.dropdownStyle }}
        {...props}
      >
        {hasAll
          ? [
              <Option key='all' value='all'>
                ทั้งหมด
              </Option>,
              ...Options
            ]
          : Options}
      </Select>
    );
  }
);

CommonSelector.displayName = 'CommonSelector';

export default CommonSelector;
