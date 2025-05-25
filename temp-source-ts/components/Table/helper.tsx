import React from 'react';
import { Tooltip, Typography, Tag, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import numeral from 'numeral';
import dayjs from 'dayjs';
import { CheckOutlined, InfoCircleOutlined, CheckOutlined as Check, CloseOutlined as Close } from '@ant-design/icons';
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
} from '../../data/Constant';
import { isDateTypeField, parser } from '../../utils/functions';
import { getNameFromEmployeeCode } from 'modules/Utils';
import { Numb } from '../../utils/number';
import type {
  PriceTypeKey,
  WitholdingTax as WitholdingTaxType,
  WitholdingTaxDoc as WitholdingTaxDocType
} from '../../data/Constant';

const { Text } = Typography;

interface ColumnWidth {
  onHeaderCell: () => { style: { minWidth: number } };
}

interface ColumnWidths {
  [key: string]: ColumnWidth;
}

interface TableSummaryProps {
  pageData: any[];
  dataLength: number;
  startAt: number;
  sumKeys?: string[];
  align?: 'left' | 'center' | 'right';
  labelAlign?: 'left' | 'center' | 'right';
  sumClassName?: { [key: string]: string };
  noDecimal?: boolean;
  columns?: any[];
  label?: string;
  hasSection?: boolean;
  skipColumns?: string[];
  customAlign?: { [key: string]: 'left' | 'center' | 'right' };
}

interface Column {
  dataIndex: string;
  title: string;
  titleAlign?: 'left' | 'center' | 'right';
  width?: number;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  render?: (text: any, record?: any) => React.ReactNode;
  children?: Column[];
}

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

export const getIndexFromColumns = (columns: Column[]): string[] => {
  const result: string[] = [];

  const traverse = (cols: Column[]) => {
    cols.forEach(col => {
      if (col.children && Array.isArray(col.children)) {
        traverse(col.children);
      } else {
        result.push(col.dataIndex);
      }
    });
  };

  traverse(columns);
  return result;
};

export const columnWidths: ColumnWidths = {
  id: { onHeaderCell: () => ({ style: { minWidth: 50 } }) },
  productCode: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  pCode: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  serviceCode: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  productName: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  productType: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  partType: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  vehicleType: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  serviceItemType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  storeLocationCode: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  partLocationCode: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  isUsed: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  import: { onHeaderCell: () => ({ style: { minWidth: 60 } }) },
  unit: { onHeaderCell: () => ({ style: { minWidth: 60 } }) },
  unitPrice: { onHeaderCell: () => ({ style: { minWidth: 130 } }) },
  discount: { onHeaderCell: () => ({ style: { minWidth: 130 } }) },
  total: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  amount: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  amtReceived: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  amtFull: { onHeaderCell: () => ({ style: { minWidth: 130 } }) },
  operation: { onHeaderCell: () => ({ style: { minWidth: 45 } }) },
  branchCode: { onHeaderCell: () => ({ style: { minWidth: 110 } }) },
  payToBranch: { onHeaderCell: () => ({ style: { minWidth: 110 } }) },
  branch: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  date: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  inputDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  incomeDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  transferDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  importDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  receivedDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  recordedDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  transferInDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  transferOutDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  exportDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  saleDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  docDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  receiveDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  deliverDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  deliveredDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  decalRecordedDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  decalWithdrawDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  depositDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  deliverTime: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  arrivalTime: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  appointmentTime: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  year: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  seller: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  payer: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  paymentType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  paymentMethod: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  senderEmployee: { onHeaderCell: () => ({ style: { minWidth: 150 } }) },
  receiverEmployee: { onHeaderCell: () => ({ style: { minWidth: 150 } }) },
  salesPerson: { onHeaderCell: () => ({ style: { minWidth: 150 } }) },
  technicianId: { onHeaderCell: () => ({ style: { minWidth: 150 } }) },
  technician: { onHeaderCell: () => ({ style: { minWidth: 150 } }) },
  person: { onHeaderCell: () => ({ style: { minWidth: 150 } }) },
  sender: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  recordedBy: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  verifiedBy: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  deliveredBy: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  receivedBy: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  employeeId: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  employeeCode: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  depositor: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  expenseCategoryId: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  expenseName: { onHeaderCell: () => ({ style: { minWidth: 240 } }) },
  item: { onHeaderCell: () => ({ style: { minWidth: 240 } }) },
  expenseBranch: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  department: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  balance: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  expenseAccountName: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  expenseAccountNameId: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  dealer: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  billNo: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  isVatIncluded: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  receiver: { onHeaderCell: () => ({ style: { minWidth: 220 } }) },
  bank: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  selfBank: { onHeaderCell: () => ({ style: { minWidth: 160 } }) },
  selfBankId: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  accNo: { onHeaderCell: () => ({ style: { minWidth: 130 } }) },
  selfAccNo: { onHeaderCell: () => ({ style: { minWidth: 130 } }) },
  remark: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  bankName: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  selfBankName: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  refNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  payInNo: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  taxInvoiceNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  docNo: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  whTaxDoc: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  vehicleNo: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  turnOverVehicleNo: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  itemType: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  prefix: { onHeaderCell: () => ({ style: { minWidth: 70 } }) },
  firstName: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  nickName: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  lastName: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  userGroup: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  saleNo: { onHeaderCell: () => ({ style: { minWidth: 160 } }) },
  bookNo: { onHeaderCell: () => ({ style: { minWidth: 160 } }) },
  assessmentResult: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  assessmentDate: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  saleType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  engineNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  turnOverEngineNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  pressureBladeNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  bucketNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  sugarcanePickerNo: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  chassisNumber: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  importType: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  isDecal: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  isTakeOut: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  peripheralNo: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  turnoverPeripheralNo: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  priceType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  hasWHTax: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  whTax: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  VAT: { onHeaderCell: () => ({ style: { minWidth: 140 } }) },
  ledgerCompleted: { onHeaderCell: () => ({ style: { minWidth: 48 } }) },
  taxInvoiceCompleted: { onHeaderCell: () => ({ style: { minWidth: 48 } }) },
  vehicleItemType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  qty: { onHeaderCell: () => ({ style: { minWidth: 60 } }) },
  returnQty: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  percentage: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  amtOilType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  amtPartType: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  netPrice: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  netTotal: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  AD_Discount: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  SKCDiscount: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  SKCManualDiscount: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  discountCoupon: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  discountPointRedeem: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  sourceOfData: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  customerName: { onHeaderCell: () => ({ style: { minWidth: 200 } }) },
  orderTypeDesc: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  model: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  orderNo: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  vehicleRegNumber: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  gasCost: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  distance: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  origin: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  fromOrigin: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  destination: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  toDestination: { onHeaderCell: () => ({ style: { minWidth: 120 } }) },
  transferType: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  deliverType: { onHeaderCell: () => ({ style: { minWidth: 100 } }) },
  giveaways: { onHeaderCell: () => ({ style: { minWidth: 160 } }) },
  customer: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  picker: { onHeaderCell: () => ({ style: { minWidth: 180 } }) },
  address: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  moo: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  village: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  tambol: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  amphoe: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  province: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  postcode: { onHeaderCell: () => ({ style: { minWidth: 80 } }) },
  phoneNumber: { onHeaderCell: () => ({ style: { minWidth: 120 } }) }
};

interface GetRenderColumnsOptions {
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  size?: 'small' | 'middle' | 'large';
  db?: any;
  isEditing?: boolean;
}

interface CustomColumnType<T> extends ColumnType<T> {
  titleAlign?: 'left' | 'center' | 'right';
  editable?: boolean;
}

type CellProps = {
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  size?: 'small' | 'middle' | 'large';
  db?: any;
  isEditing?: boolean;
  columns: CustomColumnType<any>[];
  record: any;
  dataIndex: string;
  title: string;
  editable?: boolean;
  handleSave: (record: any) => void;
  editingCell: { key: string; dataIndex: string } | null;
  setEditingCell: (cell: { key: string; dataIndex: string } | null) => void;
  rowKey: string;
  rowIndex: number;
  colIndex: number;
  align?: 'left' | 'center' | 'right';
};

export const getRenderColumns = <T extends Record<string, any>>(
  columns: CustomColumnType<T>[],
  db: any,
  handleSave: (record: T) => void,
  editingCell: { key: string; dataIndex: string } | null,
  setEditingCell: (cell: { key: string; dataIndex: string } | null) => void,
  options: GetRenderColumnsOptions = {}
): ColumnType<T>[] => {
  const {
    dealers,
    branches,
    banks,
    departments,
    userGroups,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  } = db;

  return columns.map((col, colIndex) => {
    let formattedTitle: React.ReactNode =
      typeof col.title === 'function' ? undefined : <div className='text-center'>{col.title}</div>;
    if (col?.titleAlign) {
      switch (col.titleAlign) {
        case 'left':
          formattedTitle = typeof col.title === 'function' ? undefined : <div className='text-left'>{col.title}</div>;
          break;
        case 'right':
          formattedTitle = typeof col.title === 'function' ? undefined : <div className='text-right'>{col.title}</div>;
          break;
        default:
          break;
      }
    }

    const widthProps = {
      ...(columnWidths[col.dataIndex as string] || {}),
      ...(col.width ? { onHeaderCell: () => ({ style: { minWidth: col.width } }) } : {})
    };

    const hasTooltip = ['productName', 'seller'].includes(col.dataIndex as string);
    const isCurrency = checkIsCurrency(col.dataIndex as string);
    const isNumber = ['import', 'qty', 'distance'].includes(col.dataIndex as string);
    const isDate = isDateTypeField(col.dataIndex as string) || col.dataIndex === 'date';
    const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(col.dataIndex as string);

    let mCol: ColumnType<T> = {
      ...col,
      ...widthProps,
      title: formattedTitle,
      align:
        col.align === 'start'
          ? 'left'
          : col.align === 'end'
            ? 'right'
            : col.align === 'left' || col.align === 'right' || col.align === 'center'
              ? col.align
              : 'left'
    };

    let renderFn = col.render;
    if (!renderFn) {
      if (isCurrency) {
        renderFn = (text: number) => {
          const value = Number(text);
          return (
            <div className={!text && text !== 0 ? 'transparent' : ''}>
              {text || text === 0 ? numeral(value).format('0,0.00') : '-'}
            </div>
          );
        };
      } else if (isNumber) {
        renderFn = (text: number) => {
          const value = Number(text);
          return (
            <div className={!text && text !== 0 ? 'transparent' : ''}>
              {text || text === 0 ? numeral(value).format('0,0') : '-'}
            </div>
          );
        };
      } else if (isDate) {
        renderFn = (text: string) => (
          <div className={!text ? 'transparent' : ''}>
            {text === 'N/A' ? text : !!text ? dayjs(text).format('D/MM/YYYY') : ''}
          </div>
        );
      } else if (isBoolean) {
        renderFn = (txt: boolean) => (
          <div className={`text-center ${txt ? 'text-success' : 'text-warning'}`}>{txt ? <Check /> : <Close />}</div>
        );
      } else if (hasTooltip) {
        renderFn = (text: string) => (
          <Tooltip placement='topLeft' title={text}>
            {text}
          </Tooltip>
        );
      } else {
        renderFn = (text: any) => {
          return <div className={!text ? 'transparent' : ''}>{text || '-'}</div>;
        };
      }

      switch (col.dataIndex) {
        case 'id':
          mCol = {
            ...mCol,
            render: (text: string) => <div>{String(text || colIndex + 1)}</div>
          };
          break;
        case 'dealer':
        case 'receiver':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && dealers[text]
                  ? `${dealers[text]?.dealerPrefix || ''}${
                      dealers[text].dealerName
                    } ${dealers[text]?.dealerLastName || ''}`.trim()
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'branchCode':
        case 'payToBranch':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && branches[text] ? branches[text].branchName : text || '-'}
              </div>
            )
          };
          break;
        case 'selfBank':
        case 'selfBankId':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && banks[text] ? `${banks[text].bankName} - ${banks[text].accNo} - ${banks[text].name}` : '-'}
              </div>
            )
          };
          break;
        case 'expenseBranch':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && branches[text] ? branches[text].branchName : '-'}
              </div>
            )
          };
          break;
        case 'department':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && departments[text] ? departments[text].department : '-'}
              </div>
            )
          };
          break;
        case 'userGroup':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && userGroups[text] ? userGroups[text].userGroupName : '-'}
              </div>
            )
          };
          break;
        case 'expenseCategoryId':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && expenseCategories[text] ? expenseCategories[text].expenseCategoryName : '-'}
              </div>
            )
          };
          break;
        case 'expenseAccountNameId':
          mCol = {
            ...mCol,
            render: (text: string) => {
              return (
                <div className={!text ? 'transparent' : ''}>
                  {text && expenseAccountNames[text] ? expenseAccountNames[text].expenseName : '-'}
                </div>
              );
            }
          };
          break;
        case 'expenseAccountName':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && expenseAccountNames[text] ? expenseAccountNames[text].expenseName : '-'}
              </div>
            )
          };
          break;
        case 'payer':
        case 'picker':
        case 'senderEmployee':
        case 'receiverEmployee':
        case 'sender':
        case 'recordedBy':
        case 'verifiedBy':
        case 'deliveredBy':
        case 'receivedBy':
        case 'person':
        case 'employeeId':
        case 'depositor':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && employees[text]
                  ? `${employees[text].firstName}${employees[text].nickName ? `(${employees[text].nickName})` : ''}`
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'executiveId':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text && executives[text]
                  ? `คุณ${executives[text].firstName}${
                      executives[text].nickName ? `(${executives[text].nickName})` : ''
                    } ${executives[text].lastName || ''}`
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'employeeCode':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {getNameFromEmployeeCode({ employeeCode: text, employees }) || '-'}
              </div>
            )
          };
          break;
        case 'salesPerson':
        case 'technician':
        case 'technicianId':
          mCol = {
            ...mCol,
            render: (arr: string[] | string) => {
              let content =
                arr && Array.isArray(arr)
                  ? arr.map((text, n) =>
                      text && employees[text]
                        ? `${employees[text].firstName}${
                            employees[text].nickName ? `(${employees[text].nickName})` : ''
                          }${n < arr.length - 1 ? ', ' : ''}`
                        : text || '-'
                    )
                  : arr && employees[arr]
                    ? `${employees[arr].firstName}${
                        employees[arr].nickName ? `(${employees[arr].nickName})` : ''
                      }${colIndex < arr.length - 1 ? ', ' : ''}`
                    : arr || '-';
              return <div className={!arr ? 'transparent' : ''}>{content}</div>;
            }
          };
          break;
        case 'priceType':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>{text ? (PriceType[text as PriceTypeKey] ?? text) : '-'}</div>
            )
          };
          break;
        case 'hasWHTax':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text && (WitholdingTax as Record<string, string>)[text]
                  ? (WitholdingTax as Record<string, string>)[text]
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'whTaxDoc':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text && (WitholdingTaxDoc as Record<string, string>)[text]
                  ? (WitholdingTaxDoc as Record<string, string>)[text]
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'paymentType':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text && (PaymentType as Record<string, string>)[text]
                  ? (PaymentType as Record<string, string>)[text]
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'paymentMethod':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text && (PaymentMethod as Record<string, string>)[text]
                  ? (PaymentMethod as Record<string, string>)[text]
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'buyType':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text && (BuyType as Record<string, string>)[text]
                  ? (BuyType as Record<string, string>)[text]
                  : text || '-'}
              </div>
            )
          };
          break;
        case 'vehicleItemType':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text ? ((VehicleItemType as Record<string, string>)[text] ?? text) : '-'}
              </div>
            )
          };
          break;
        case 'importType':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text && text !== '0' ? 'transparent' : ''}>
                {text ? ((OtherVehicleImportType as Record<string, string>)[text] ?? text) : '-'}
              </div>
            )
          };
          break;
        case 'ledgerCompleted':
          mCol = {
            ...mCol,
            render: (txt: boolean) => (
              <div className='d-flex align-items-center justify-content-center'>
                {txt ? (
                  <CheckOutlined className='text-success' twoToneColor='#52c41a' />
                ) : (
                  <InfoCircleOutlined className='text-warning' spin />
                )}
              </div>
            )
          };
          break;
        case 'taxInvoiceCompleted':
          mCol = {
            ...mCol,
            render: (txt: boolean) => (
              <div className='d-flex align-items-center justify-content-center'>
                {txt ? (
                  <CheckOutlined className='text-success' twoToneColor='#52c41a' />
                ) : (
                  <InfoCircleOutlined className='text-warning' spin />
                )}
              </div>
            )
          };
          break;
        case 'phoneNumber':
          mCol = {
            ...mCol,
            render: (text: string) => (
              <div className={!text ? 'transparent' : ''}>
                {text ? `${parser(text).slice(0, 3)}-${parser(text).slice(3, 6)}-${parser(text).slice(-4)}` : '-'}
              </div>
            )
          };
          break;
        case 'saleType':
          mCol = {
            ...mCol,
            render: (text: string) => <div>{text ? ((SaleType as Record<string, string>)[text] ?? text) : '-'}</div>
          };
          break;
        case 'transferType':
          mCol = {
            ...mCol,
            render: (text: string) => <div>{text ? ((TransferType as Record<string, string>)[text] ?? text) : '-'}</div>
          };
          break;
        case 'deliverType':
          mCol = {
            ...mCol,
            render: (text: string) => <div>{text ? ((DeliveryType as Record<string, string>)[text] ?? text) : '-'}</div>
          };
          break;
        case 'isUsed':
          mCol = {
            ...mCol,
            render: (text: boolean) => <div>{!!text ? 'มือสอง' : 'ใหม่'}</div>
          };
          break;
        case 'giveaways':
          mCol = {
            ...mCol,
            render: (arr: Array<{ name: string; total: number }>) => (
              <span>{arr ? arr.map((tag, i) => <Tag key={i}>{`${tag.name} x${tag.total}`}</Tag>) : '-'}</span>
            )
          };
          break;
        case 'vehicleNo':
        case 'peripheralNo':
        case 'engineNo':
        case 'pressureBladeNo':
        case 'bucketNo':
        case 'sugarcanePickerNo':
        case 'sourceOfData':
        case 'turnOverVehicleNo':
        case 'turnOverPeripheralNo':
        case 'turnOverEngineNo':
        case 'itemType':
          mCol = {
            ...mCol,
            render: (arr: string[] | string) => (
              <span>{arr ? (Array.isArray(arr) ? arr.map((tag, i) => <Tag key={i}>{tag}</Tag>) : arr) : '-'}</span>
            )
          };
          break;
        case 'toDestination':
          mCol = {
            ...mCol,
            render: (text: string, record: any) => {
              return (
                <div>{text ? (record.transferType === 'sold' ? text : branches[text]?.branchName || text) : '-'}</div>
              );
            }
          };
          break;
        case 'customer':
          mCol = {
            ...mCol,
            render: (text: string, record: any) => {
              if (record?.customer && typeof record.customer === 'string') {
                return <div>{record.customer}</div>;
              }
              if (record?.customerName && typeof record.customerName === 'string') {
                return <div>{record.customerName}</div>;
              }
              if (!!record?.prefix && !!record?.firstName) {
                return <div>{`${record.prefix}${record.firstName} ${record.lastName || ''}`.trim()}</div>;
              }
              return <div>{text || '-'}</div>;
            }
          };
          break;
        case 'origin':
        case 'fromOrigin':
          mCol = {
            ...mCol,
            render: (text: string, record: any) => {
              return <div>{text ? (text === 'SKC' ? 'SKC' : branches[text]?.branchName || text) : '-'}</div>;
            }
          };
          break;
      }
    }

    if (!mCol.render) {
      mCol.render = renderFn;
    }

    if (col.editable) {
      const onCell = (record: T, index?: number): CellProps => ({
        columns,
        record,
        dataIndex: col.dataIndex as string,
        title: typeof col.title === 'string' ? col.title : '',
        editable: col.editable,
        handleSave,
        editingCell,
        setEditingCell,
        rowKey: record.key,
        rowIndex: index || 0,
        colIndex,
        align:
          col.align === 'start'
            ? 'left'
            : col.align === 'end'
              ? 'right'
              : col.align === 'left' || col.align === 'right' || col.align === 'center'
                ? col.align
                : 'left',
        ...options
      });

      return {
        ...mCol,
        onCell
      };
    }
    return mCol;
  });
};

export const getValidationRules = (dataIndex: string) => {
  const isCurrency = checkIsCurrency(dataIndex);
  const isNumber = checkIsNumber(dataIndex);

  if (isCurrency || isNumber) {
    return [
      { required: true, message: 'ข้อมูลไม่ถูกต้อง' },
      {
        type: 'number',
        transform: (value: any) => Number(value),
        message: 'ค่าต้องเป็นตัวเลข'
      }
    ];
  }

  switch (dataIndex) {
    case 'productCode':
      return [{ required: true, message: 'จำเป็นต้องป้อนข้อมูล' }];
    default:
      return [];
  }
};

export const renderPriceType = (text: string) => {
  return PriceType[text as PriceTypeKey] ?? text;
};

export const renderWitholdingTax = (text: string) => {
  return (WitholdingTax as Record<string, string>)[text] ?? text;
};

export const renderWitholdingTaxDoc = (text: string) => {
  return (WitholdingTaxDoc as Record<string, string>)[text] ?? text;
};

export const renderPaymentType = (text: string) => {
  return (PaymentType as Record<string, string>)[text] ?? text;
};

export const renderPaymentMethod = (text: string) => {
  return (PaymentMethod as Record<string, string>)[text] ?? text;
};

export const TableSummary: React.FC<TableSummaryProps> = ({
  pageData,
  dataLength,
  startAt,
  sumKeys,
  align = 'right',
  labelAlign = 'right',
  sumClassName,
  noDecimal,
  columns,
  label,
  hasSection,
  skipColumns = [],
  customAlign = {}
}) => {
  if (dataLength === 0) {
    return null;
  }

  const filteredData = pageData.filter(l => !l.deleted);
  const relevantRows = hasSection ? filteredData.filter(l => l?.isSection) : filteredData.filter(l => !l?.isSection);

  const sumObj: { [key: string]: number } = {};
  let total = 0;

  if (sumKeys && Array.isArray(sumKeys)) {
    sumKeys.forEach(k => {
      sumObj[k] = relevantRows.reduce((acc, elem) => {
        const value = Numb(elem[k]);
        return acc + value;
      }, 0);
    });
  } else {
    total = relevantRows.reduce((acc, elem) => {
      const value = Numb(elem.total);
      return acc + value;
    }, 0);
  }

  if (pageData.length === 0) {
    return null;
  }

  const getCellAlign = (dataIndex: string) => {
    return customAlign[dataIndex] || align;
  };

  return (
    <Table.Summary.Row className='bg-light'>
      {Array.from(new Array(startAt), (_, i) => (
        <Table.Summary.Cell key={i} index={i} />
      ))}
      <Table.Summary.Cell index={startAt}>
        <div style={{ textAlign: labelAlign }}>
          <Text>{label || 'ยอดรวม'}</Text>
        </div>
      </Table.Summary.Cell>

      {sumKeys && Array.isArray(sumKeys) ? (
        columns ? (
          getIndexFromColumns(columns)
            .slice(startAt + 1)
            .map((colDataIndex, idx) => {
              if (skipColumns.includes(colDataIndex)) {
                return <Table.Summary.Cell key={colDataIndex} index={startAt + idx + 1} />;
              }
              if (sumKeys.includes(colDataIndex)) {
                return (
                  <Table.Summary.Cell key={colDataIndex} index={startAt + idx + 1} align={getCellAlign(colDataIndex)}>
                    <div style={{ textAlign: getCellAlign(colDataIndex) }}>
                      <Text
                        className={
                          sumClassName && sumClassName[colDataIndex] ? sumClassName[colDataIndex] : 'text-primary'
                        }
                      >
                        {numeral(sumObj[colDataIndex]).format(noDecimal ? '0,0' : '0,0.00')}
                      </Text>
                    </div>
                  </Table.Summary.Cell>
                );
              }
              return <Table.Summary.Cell key={colDataIndex} index={startAt + idx + 1} />;
            })
        ) : (
          Object.keys(sumObj).map((k, idx) => {
            if (skipColumns.includes(k)) {
              return <Table.Summary.Cell key={k} index={startAt + idx + 1} />;
            }
            return (
              <Table.Summary.Cell key={k} index={startAt + idx + 1} align={getCellAlign(k)}>
                <div style={{ textAlign: getCellAlign(k) }}>
                  <Text className={sumClassName && sumClassName[k] ? sumClassName[k] : 'text-primary'}>
                    {numeral(sumObj[k]).format(noDecimal ? '0,0' : '0,0.00')}
                  </Text>
                </div>
              </Table.Summary.Cell>
            );
          })
        )
      ) : (
        <Table.Summary.Cell index={startAt + 1} align={getCellAlign('total')}>
          <div style={{ textAlign: getCellAlign('total') }}>
            <Text className='text-primary'>{numeral(total).format(noDecimal ? '0,0' : '0,0.00')}</Text>
          </div>
        </Table.Summary.Cell>
      )}
    </Table.Summary.Row>
  );
};
