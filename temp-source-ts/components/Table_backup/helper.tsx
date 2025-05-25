import React from 'react';
import { Tooltip, Typography, Tag, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import numeral from 'numeral';
import { DateTime } from 'luxon';
import {
  CheckOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
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

// Define extended column type with additional properties
interface ExtendedColumnType extends Omit<ColumnType<TableData>, 'title'> {
  title?: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode);
  editable?: boolean;
  number?: boolean;
  required?: boolean;
  titleAlign?: 'left' | 'right' | 'center';
}

interface ColumnWithChildren extends ExtendedColumnType {
  children?: ColumnWithChildren[];
}

// Define ColumnProps type
interface ColumnProps {
  [key: string]: any;
}

// Create a value object for ColumnProps
const ColumnPropsMap: Record<string, any> = {};

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

// Update TableColumnConfig to match Ant Design's column type
type TableColumnConfig<T = any> = Omit<ColumnType<T>, 'title'> & {
  title?: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode);
};

interface GetRenderColumnsProps {
  columns: ColumnWithChildren[];
  handleSave?: (record: any) => void;
  db: any;
  isEditing?: (record: any) => boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  size?: 'small' | 'middle' | 'large';
}

export const getRenderColumns = ({
  columns,
  handleSave,
  db,
  isEditing,
  onKeyDown,
  onBlur,
  size
}: GetRenderColumnsProps): ColumnType<TableData>[] => {
  const {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  } = db;

  return columns.map((col: ColumnWithChildren, n: number) => {
    // Create base column configuration with proper typing
    let mCol: ColumnType<TableData> = {
      title: typeof col.title === 'function' ? col.title({}) : col.title,
      dataIndex: col.dataIndex || '',
      key: n.toString(),
      ...(col.width && { width: col.width }),
      ...(col.align && { align: col.align })
    };

    if (col.children || col.render) {
      return {
        ...mCol,
        ...col,
        children: col.children?.map(child => ({
          ...child,
          title: typeof child.title === 'function' ? child.title({}) : child.title,
          dataIndex: child.dataIndex || ''
        }))
      } as ColumnType<TableData>;
    }

    if ('titleAlign' in col && col.titleAlign) {
      switch (col.titleAlign) {
        case 'left':
          mCol = {
            ...mCol,
            title:
              typeof col.title === 'string'
                ? col.title
                : React.isValidElement(col.title)
                  ? col.title
                  : String(col.title)
          };
          break;
        case 'right':
          mCol = {
            ...mCol,
            title:
              typeof col.title === 'string'
                ? col.title
                : React.isValidElement(col.title)
                  ? col.title
                  : String(col.title)
          };
          break;
        default:
          break;
      }
    }

    const dataIndex = String(col.dataIndex);
    const hasTooltip = ['productName', 'seller'].includes(dataIndex);
    const isCurrency = checkIsCurrency(dataIndex);
    const isNumber = checkIsNumber(dataIndex);
    const isDate = isDateTypeField(dataIndex) || dataIndex === 'date';
    const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(dataIndex);

    if (hasTooltip) {
      mCol = {
        ...mCol,
        render: (text: string) => (
          <Tooltip placement='topLeft' title={text}>
            {text}
          </Tooltip>
        )
      };
    } else if (isCurrency) {
      mCol = {
        ...mCol,
        align: 'right',
        render: (text: number) => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0.00') : '-'}
          </div>
        )
      };
    } else if (isNumber) {
      mCol = {
        ...mCol,
        align: 'right',
        render: (text: number) => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0') : '-'}
          </div>
        )
      };
    } else if (isDate) {
      mCol = {
        ...mCol,
        align: 'center',
        render: (text: string) => (
          <div className={!text ? 'transparent' : ''}>
            {text === 'N/A' ? text : !!text ? DateTime.fromISO(text).toLocaleString(DateTime.DATE_MED) : ''}
          </div>
        )
      };
    } else if (isBoolean) {
      mCol = {
        ...mCol,
        align: 'center',
        render: txt => (
          <div className={`text-center ${txt ? 'text-success' : 'text-warning'}`}>
            {txt ? <CheckCircleOutlined /> : <CloseOutlined />}
          </div>
        )
      };
    } else {
      switch (dataIndex) {
        case 'id':
          mCol = {
            ...mCol,
            render: text => <div>{(text || n) + 1}</div>
          };
          break;
        case 'dealer':
        case 'receiver':
          mCol = {
            ...mCol,
            render: text => (
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
            render: text => (
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
            render: text => (
              <div className={!text ? 'transparent' : ''}>
                {text && banks[text] ? `${banks[text].bankName} - ${banks[text].accNo} - ${banks[text].name}` : '-'}
              </div>
            )
          };
          break;
        case 'expenseBranch':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text ? 'transparent' : ''}>
                {text && branches[text] ? branches[text].branchName : '-'}
              </div>
            )
          };
          break;
        case 'department':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text ? 'transparent' : ''}>
                {text && departments[text] ? departments[text].department : '-'}
              </div>
            )
          };
          break;
        case 'userGroup':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text ? 'transparent' : ''}>
                {text && userGroups[text] ? userGroups[text].userGroupName : '-'}
              </div>
            )
          };
          break;
        case 'expenseCategoryId':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text ? 'transparent' : ''}>
                {text && expenseCategories[text] ? expenseCategories[text].expenseCategoryName : '-'}
              </div>
            )
          };
          break;
        case 'expenseAccountNameId':
          mCol = {
            ...mCol,
            render: text => {
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
            render: text => (
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
            render: text => (
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
            render: text => (
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
            render: text => (
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
            render: arr => {
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
                    ? `${employees[arr].firstName}${employees[arr].nickName ? `(${employees[arr].nickName})` : ''}`
                    : arr || '-';
              return <div className={!arr ? 'transparent' : ''}>{content}</div>;
            }
          };
          break;
        case 'priceType':
          mCol = {
            ...mCol,
            render: text => <div className={!text ? 'transparent' : ''}>{text ? (PriceType as any)[text] : '-'}</div>
          };
          break;
        case 'hasWHTax':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && (WitholdingTax as any)[text] ? (WitholdingTax as any)[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'whTaxDoc':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && (WitholdingTaxDoc as any)[text] ? (WitholdingTaxDoc as any)[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'paymentType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && (PaymentType as any)[text] ? (PaymentType as any)[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'paymentMethod':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && (PaymentMethod as any)[text] ? (PaymentMethod as any)[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'buyType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && (BuyType as any)[text] ? (BuyType as any)[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'vehicleItemType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text ? (VehicleItemType as any)[text] : '-'}
              </div>
            )
          };
          break;
        case 'importType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text ? (OtherVehicleImportType as any)[text] : '-'}
              </div>
            )
          };
          break;
        case 'ledgerCompleted':
          mCol = {
            ...mCol,
            render: txt => (
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
            render: txt => (
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
            render: text => (
              <div className={!text ? 'transparent' : ''}>
                {text
                  ? `${String(parser(text)).slice(0, 3)}-${String(parser(text)).slice(3, 6)}-${String(parser(text)).slice(-4)}`
                  : '-'}
              </div>
            )
          };
          break;
        case 'saleType':
          mCol = {
            ...mCol,
            render: text => <div>{text ? (SaleType as any)[text] : '-'}</div>
          };
          break;
        case 'transferType':
          mCol = {
            ...mCol,
            render: text => <div>{text ? (TransferType as any)[text] : '-'}</div>
          };
          break;
        case 'deliverType':
          mCol = {
            ...mCol,
            render: text => <div>{text ? (DeliveryType as any)[text] : '-'}</div>
          };
          break;
        case 'isUsed':
          mCol = {
            ...mCol,
            render: text => <div>{!!text ? 'มือสอง' : 'ใหม่'}</div>
          };
          break;
        case 'giveaways':
          mCol = {
            ...mCol,
            render: (arr: any[]) => (
              <span>
                {arr ? arr.map((tag: any, i: number) => <Tag key={i}>{`${tag.name} x${tag.total}`}</Tag>) : '-'}
              </span>
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
            render: arr => (
              <span>
                {arr ? (Array.isArray(arr) ? arr.map((tag: any, i: number) => <Tag key={i}>{tag}</Tag>) : arr) : '-'}
              </span>
            )
          };
          break;
        case 'toDestination':
          mCol = {
            ...mCol,
            render: (text, record) => (
              <div>{text ? (record.transferType === 'sold' ? text : branches[text]?.branchName || text) : '-'}</div>
            )
          };
          break;
        case 'customer':
          mCol = {
            ...mCol,
            render: (text, record) => {
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
        default:
          mCol = {
            ...mCol,
            render: text => <div className={!text ? 'transparent' : ''}>{text || '-'}</div>
          };
          break;
      }
    }

    if (col.editable) {
      const cellObj = {
        number: col.number,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: React.isValidElement(col.title) ? col.title : <div className='text-center'>{String(col.title)}</div>,
        required: col.required,
        ...(typeof handleSave !== 'undefined' && { handleSave }),
        ...(typeof onKeyDown !== 'undefined' && { onKeyDown }),
        ...(typeof onBlur !== 'undefined' && { onBlur }),
        ...(typeof size !== 'undefined' && { size })
      };

      const columnProps = ColumnPropsMap[String(col.dataIndex)] || {};

      const resultForRowType: ColumnType<TableData> = {
        ...mCol,
        ...columnProps,
        ...(col.width && { width: col.width }),
        key: n.toString(),
        onCell: (record: TableData) => ({
          record,
          ...cellObj,
          ...(typeof isEditing === 'function' ? { editing: isEditing(record) } : {})
        })
      };

      const resultForCellType: ColumnType<TableData> = {
        ...mCol,
        ...columnProps,
        ...(col.width && { width: col.width }),
        key: n.toString(),
        onCell: (record: TableData) => ({
          record,
          ...cellObj
        })
      };

      return typeof isEditing === 'undefined' ? resultForCellType : resultForRowType;
    }

    const columnProps = ColumnPropsMap[String(col.dataIndex)] || {};

    return {
      ...mCol,
      key: n.toString(),
      ...columnProps,
      ...(col.width && { width: col.width }),
      ...(col.align && { align: col.align })
    } as ColumnType<TableData>;
  });
};

export const getValidationRules = (dataIndex: string): any[] => {
  // Common validation rules
  const rules: any[] = [];

  // Add field-specific validation
  if (dataIndex.includes('email')) {
    rules.push({
      type: 'email',
      message: 'Please enter a valid email address'
    });
  }

  if (dataIndex.includes('phone') || dataIndex.includes('mobile')) {
    rules.push({
      pattern: /^[0-9\-+()]*$/,
      message: 'Please enter a valid phone number'
    });
  }

  if (dataIndex.includes('price') || dataIndex.includes('amount') || dataIndex.includes('cost')) {
    rules.push({
      type: 'number',
      message: 'Please enter a valid number',
      transform: (value: string) => {
        if (value === '' || value === undefined || value === null) return undefined;
        return Number(value);
      }
    });
  }

  // Return the rules array
  return rules;
};
// ... rest of the file remains unchanged ...

export const ColumnProps = {
  id: {
    width: 50
  },
  productCode: {
    width: 180
  },
  pCode: {
    width: 180
  },
  serviceCode: {
    width: 180
  },
  productName: {
    width: 180
  },
  productType: {
    width: 100
  },
  partType: {
    width: 100
  },
  vehicleType: {
    width: 100
  },
  serviceItemType: {
    width: 120
  },
  storeLocationCode: {
    width: 120
  },
  partLocationCode: {
    width: 120
  },
  isUsed: {
    width: 100
  },
  import: {
    width: 60
  },
  unit: {
    width: 60
  },
  unitPrice: {
    width: 130
  },
  discount: {
    width: 130
  },
  total: {
    width: 140
  },
  amount: {
    width: 140
  },
  amtReceived: {
    width: 140
  },
  amtFull: {
    width: 130
  },
  operation: {
    width: 45
  },
  branchCode: {
    width: 110
  },
  payToBranch: {
    width: 110
  },
  branch: {
    width: 80
  },
  date: {
    width: 120
  },
  inputDate: {
    width: 120
  },
  incomeDate: {
    width: 120
  },
  transferDate: {
    width: 120
  },
  importDate: {
    width: 120
  },
  receivedDate: {
    width: 120
  },
  recordedDate: {
    width: 120
  },
  transferInDate: {
    width: 120
  },
  transferOutDate: {
    width: 120
  },
  exportDate: {
    width: 120
  },
  saleDate: {
    width: 120
  },
  docDate: {
    width: 120
  },
  receiveDate: {
    width: 120
  },
  deliverDate: {
    width: 120
  },
  deliveredDate: {
    width: 120
  },
  decalRecordedDate: {
    width: 120
  },
  decalWithdrawDate: {
    width: 120
  },
  depositDate: {
    width: 120
  },
  deliverTime: {
    width: 80
  },
  arrivalTime: {
    width: 80
  },
  appointmentTime: {
    width: 80
  },
  year: {
    width: 120
  },
  seller: {
    width: 180
  },
  payer: {
    width: 120
  },
  paymentType: {
    width: 120
  },
  paymentMethod: {
    width: 100
  },
  senderEmployee: {
    width: 150
  },
  receiverEmployee: {
    width: 150
  },
  salesPerson: {
    width: 150
  },
  technicianId: {
    width: 150
  },
  technician: {
    width: 150
  },
  person: {
    width: 150
  },
  sender: {
    width: 120
  },
  recordedBy: {
    width: 120
  },
  verifiedBy: {
    width: 120
  },
  deliveredBy: {
    width: 120
  },
  receivedBy: {
    width: 120
  },
  employeeId: {
    width: 120
  },
  employeeCode: {
    width: 120
  },
  depositor: {
    width: 120
  },
  expenseCategoryId: {
    width: 180
  },
  expenseName: {
    width: 240
  },
  item: {
    width: 240
  },
  expenseBranch: {
    width: 180
  },
  department: {
    width: 180
  },
  balance: {
    width: 120
  },
  expenseAccountName: {
    width: 200
  },
  expenseAccountNameId: {
    width: 200
  },
  dealer: {
    width: 180
  },
  billNo: {
    width: 140
  },
  isVatIncluded: {
    width: 100
  },
  receiver: {
    width: 220
  },
  bank: {
    width: 120
  },
  selfBank: {
    width: 160
  },
  selfBankId: {
    width: 180
  },
  accNo: {
    width: 130
  },
  selfAccNo: {
    width: 130
  },
  remark: {
    width: 180
  },
  bankName: {
    width: 200
  },
  selfBankName: {
    width: 200
  },
  refNo: {
    width: 180
  },
  payInNo: {
    width: 140
  },
  taxInvoiceNo: {
    width: 180
  },
  docNo: {
    width: 140
  },
  whTaxDoc: {
    width: 120
  },
  vehicleNo: {
    width: 200
  },
  turnOverVehicleNo: {
    width: 200
  },
  itemType: {
    width: 180
  },
  prefix: {
    width: 70
  },
  firstName: {
    width: 120
  },
  nickName: {
    width: 80
  },
  lastName: {
    width: 140
  },
  userGroup: {
    width: 120
  },
  saleNo: {
    width: 160
  },
  bookNo: {
    width: 160
  },
  assessmentResult: {
    width: 100
  },
  assessmentDate: {
    width: 120
  },
  saleType: {
    width: 120
  },
  engineNo: {
    width: 180
  },
  pressureBladeNo: {
    width: 180
  },
  bucketNo: {
    width: 180
  },
  sugarcanePickerNo: {
    width: 180
  },
  chassisNumber: {
    width: 140
  },
  importType: {
    width: 100
  },
  isDecal: {
    width: 80
  },
  isTakeOut: {
    width: 80
  },
  peripheralNo: {
    width: 200
  },
  priceType: {
    width: 120
  },
  hasWHTax: {
    width: 120
  },
  whTax: {
    width: 140
  },
  VAT: {
    width: 140
  },
  ledgerCompleted: {
    width: 48
  },
  taxInvoiceCompleted: {
    width: 48
  },
  vehicleItemType: {
    width: 120
  },
  qty: {
    width: 60
  },
  returnQty: {
    width: 100
  },
  percentage: {
    width: 80
  },
  amtOilType: {
    width: 120
  },
  amtPartType: {
    width: 120
  },
  netPrice: {
    width: 120
  },
  netTotal: {
    width: 120
  },
  AD_Discount: {
    width: 120
  },
  SKCDiscount: {
    width: 120
  },
  SKCManualDiscount: {
    width: 120
  },
  discountCoupon: {
    width: 120
  },
  discountPointRedeem: {
    width: 120
  },
  sourceOfData: {
    width: 180
  },
  customerName: {
    width: 200
  },
  orderTypeDesc: {
    width: 180
  },
  model: {
    width: 120
  },
  orderNo: {
    width: 120
  },
  vehicleRegNumber: {
    width: 100
  },
  gasCost: {
    width: 120
  },
  distance: {
    width: 120
  },
  origin: {
    width: 120
  },
  fromOrigin: {
    width: 120
  },
  destination: {
    width: 120
  },
  toDestination: {
    width: 120
  },
  transferType: {
    width: 100
  },
  deliverType: {
    width: 100
  },
  giveaways: {
    width: 160
  },
  customer: {
    width: 180
  },
  picker: {
    width: 180
  },
  address: {
    width: 80
  },
  moo: {
    width: 80
  },
  village: {
    width: 80
  },
  tambol: {
    width: 80
  },
  amphoe: {
    width: 80
  },
  province: {
    width: 80
  },
  postcode: {
    width: 80
  },
  phoneNumber: {
    width: 120
  }
};
