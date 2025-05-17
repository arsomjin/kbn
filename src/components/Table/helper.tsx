import React from 'react';
import { Tooltip, Typography, Tag, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import numeral from 'numeral';
import { DateTime } from 'luxon';
import { CheckOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  PriceType,
  WitholdingTax,
  WitholdingTaxDoc,
  VehicleItemType,
  SaleType,
  TransferType,
  OtherVehicleImportType,
  DeliveryType,
  PaymentType,
  BuyType,
  PaymentMethod
} from 'data/Constant';
import { isDateTypeField, parser } from 'utils/functions';
import { getNameFromEmployeeCode } from 'modules/Utils';
import { Numb } from 'utils/number';
import { TableData } from './types';

const { Text } = Typography;

const checkIsCurrency = (dataIndex: string): boolean =>
  [
    'unitPrice',
    'total',
    'amount',
    'discount',
    'balance',
    'whTax',
    'netTotal',
    'totalIncludeVat',
    'VAT',
    'amtFull',
    'amtReceived',
    'partBeforeDiscount',
    'partDealerDiscount',
    'partSKCDiscount',
    'priceBeforeDiscount',
    'netPrice',
    'gasCost',
    'totalLoan'
  ].includes(dataIndex);

const checkIsNumber = (dataIndex: string): boolean => ['qty'].includes(dataIndex);

interface ColumnWithChildren extends ColumnType<TableData> {
  children?: ColumnWithChildren[];
}

export const getIndexFromColumns = (columns: ColumnWithChildren[]): string[] => {
  const result: string[] = [];

  const traverse = (cols: ColumnWithChildren[]) => {
    cols.forEach(col => {
      if (col.children && Array.isArray(col.children)) {
        traverse(col.children);
      } else if (col.dataIndex) {
        result.push(col.dataIndex.toString());
      }
    });
  };

  traverse(columns);
  return result;
};

// Add the missing getRenderColumns function and export it
export const getRenderColumns = (
  columns: any[],
  db: any,
  handleSave: (record: TableData, dataIndex: string, value: any) => void,
  editingCell: any,
  setEditingCell: (value: any) => void
): ColumnType<TableData>[] => {
  return columns.map((col: any) => {
    if (col.children) {
      return {
        ...col,
        children: col.children.map((childCol: any) => ({
          ...childCol,
          onCell: (record: TableData) => ({
            record,
            dataIndex: childCol.dataIndex,
            title: childCol.title,
            handleSave,
            editable: childCol.editable,
            db
          })
        }))
      };
    }
    
    return {
      ...col,
      onCell: (record: TableData) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        editable: col.editable,
        db
      })
    };
  });
};

// Add the missing getValidationRules function and export it
export const getValidationRules = (dataIndex: string): any[] => {
  if (dataIndex === 'phone' || dataIndex === 'mobile') {
    return [
      {
        validator: (_: any, value: any) => {
          if (!value || /^[0-9]{10}$/.test(value)) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('กรุณากรอกเบอร์โทรให้ถูกต้อง'));
        }
      }
    ];
  }
  
  return [];
};

// ... rest of the file remains unchanged ... 