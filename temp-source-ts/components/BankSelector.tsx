/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select, SelectProps } from 'antd';
import { ThaiBanks } from 'data/Constant';

const { Option } = Select;

type BankSelectorProps = Omit<SelectProps, 'ref'>;

export interface BankSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (props: Record<string, any>) => void;
}

type BankKey = keyof typeof ThaiBanks;

const BankSelector = forwardRef<BankSelectorRef, BankSelectorProps>((props, ref) => {
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

      setNativeProps(nativeProps: Record<string, any>) {
        selectRef.current?.setNativeProps(nativeProps);
      }
    }),
    []
  );

  return (
    <Select ref={selectRef} placeholder='ธนาคาร' {...props}>
      {(Object.keys(ThaiBanks) as BankKey[]).map(k => (
        <Option key={k} value={k}>
          {ThaiBanks[k].name}
        </Option>
      ))}
    </Select>
  );
});

BankSelector.displayName = 'BankSelector';

export default BankSelector;
