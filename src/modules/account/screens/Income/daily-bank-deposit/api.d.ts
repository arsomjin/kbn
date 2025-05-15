import React from 'react';
import { BankDepositItem } from './types';

export const initItem: BankDepositItem;

export const getColumns: (isEdit: boolean) => Array<{
  title: string | React.ReactNode;
  dataIndex: string;
  editable?: boolean;
  required?: boolean;
  width?: number;
  ellipsis?: boolean;
  align?: 'center' | 'left' | 'right';
  number?: boolean;
  render?: (text: string) => React.ReactNode;
}>;

export const getInitItem: (order?: Partial<BankDepositItem>) => BankDepositItem;
export const renderInput: () => React.ReactNode; 