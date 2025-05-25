import { ReactNode } from 'react';

export interface Option {
  label: string;
  value: string;
  key?: string;
  className?: string;
  [key: string]: any;
}

export interface ErrorWithMessage extends Error {
  message: string;
  snap?: {
    function: string;
  };
  [key: string]: any;
}

export interface SelectRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (props: any) => void;
}

export interface SelectOption {
  key?: string;
  label: ReactNode;
  value: string | number;
  [key: string]: any;
}
