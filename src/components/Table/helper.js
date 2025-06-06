import React from 'react';
import { Tooltip, Typography, Tag, Table } from 'antd';
import numeral from 'numeral';
import moment from 'moment';
import { CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Check, Close } from '@material-ui/icons';
import {
  PriceType,
  WitholdingTax,
  WitholdingTaxDoc,
  VehicleItemType,
  SaleType,
  TransferType,
  OtherVehicleImportType,
  DeliveryType,
  PaymentType
} from 'data/Constant';
import { isDateTypeField, parser } from 'functions';
import { getNameFromEmployeeCode } from 'Modules/Utils';
import { BuyType } from 'data/Constant';
import { PaymentMethod } from 'data/Constant';
import { Numb } from 'utils/number';
const { Text } = Typography;

const checkIsCurrency = dataIndex =>
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

const checkIsNumber = dataIndex => ['qty'].includes(dataIndex);

export const getIndexFromColumns = columns => {
  // Recursively gather dataIndex from nested children arrays
  const result = [];

  const traverse = cols => {
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

export const columnWidths = {
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

export const getRenderColumns = (
  columns,
  db,
  handleSave,
  editingCell,
  setEditingCell,
  options = {} // options: { onKeyDown, onBlur, size, db, isEditing, ... }
) => {
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
    // Apply a consistent title formatting
    let formattedTitle = <div className="text-center">{col.title}</div>;
    if (col?.titleAlign) {
      switch (col.titleAlign) {
        case 'left':
          formattedTitle = <div className="text-left">{col.title}</div>;
          break;
        case 'right':
          formattedTitle = <div className="text-center">{col.title}</div>;
          break;

        default:
          break;
      }
    }

    // Merge default widths with custom column width (custom overrides default)
    const widthProps = {
      ...(columnWidths[col.dataIndex] || {}),
      ...(col.width ? { onHeaderCell: () => ({ style: { minWidth: col.width } }) } : {})
    };

    // // If the column is not editable, simply merge title and widthProps.
    // if (!col.editable) {
    //     return {
    //         ...col,
    //         ...widthProps,
    //         title: formattedTitle,
    //     };
    // }

    // let mCol = {
    //     ...col,
    //     ...widthProps,
    //     title: formattedTitle,
    // };

    const hasTooltip = ['productName', 'seller'].includes(col.dataIndex);
    const isCurrency = checkIsCurrency(col.dataIndex);
    const isNumber = ['import', 'qty', 'distance'].includes(col.dataIndex);
    const isDate = isDateTypeField(col.dataIndex) || col.dataIndex === 'date';
    const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(col.dataIndex);

    let mCol = {
      ...col,
      ...widthProps,
      title: formattedTitle,
      align: col.align || 'left'
    };

    let renderFn = col.render;
    if (!renderFn) {
      if (isCurrency) {
        renderFn = text => {
          // Force conversion to number
          const value = Number(text);
          return (
            <div className={!text && text !== 0 ? 'transparent' : ''}>
              {text || text === 0 ? numeral(value).format('0,0.00') : '-'}
            </div>
          );
        };
      } else if (isNumber) {
        renderFn = text => {
          const value = Number(text);
          return (
            <div className={!text && text !== 0 ? 'transparent' : ''}>
              {text || text === 0 ? numeral(value).format('0,0') : '-'}
            </div>
          );
        };
      } else if (isDate) {
        renderFn = text => (
          <div className={!text ? 'transparent' : ''}>
            {text === 'N/A' ? text : !!text ? moment(text, 'YYYY-MM-DD').format('D/MM/YYYY') : ''}
          </div>
        );
      } else if (isBoolean) {
        renderFn = txt => (
          <div className={`text-center ${txt ? 'text-success' : 'text-warning'}`}>{txt ? <Check /> : <Close />}</div>
        );
      } else if (hasTooltip) {
        renderFn = text => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        );
      } else {
        renderFn = text => {
          // if (typeof text === 'object' && text !== null) {
          //     return <div className={!text ? 'transparent' : ''}>{JSON.stringify(text)}</div>;
          // }
          return <div className={!text ? 'transparent' : ''}>{text || '-'}</div>;
        };
      }

      switch (col.dataIndex) {
        case 'id':
          mCol = {
            ...mCol,
            render: text => <div>{(text || colIndex) + 1}</div>
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
            render: text => <div className={!text ? 'transparent' : ''}>{text ? PriceType[text] : '-'}</div>
          };
          break;
        case 'hasWHTax':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && WitholdingTax[text] ? WitholdingTax[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'whTaxDoc':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && WitholdingTaxDoc[text] ? WitholdingTaxDoc[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'paymentType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && PaymentType[text] ? PaymentType[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'paymentMethod':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && PaymentMethod[text] ? PaymentMethod[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'buyType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && BuyType[text] ? BuyType[text] : text || '-'}
              </div>
            )
          };
          break;
        case 'vehicleItemType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>{text ? VehicleItemType[text] : '-'}</div>
            )
          };
          break;
        case 'importType':
          mCol = {
            ...mCol,
            render: text => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text ? OtherVehicleImportType[text] : '-'}
              </div>
            )
          };
          break;
        case 'ledgerCompleted':
          mCol = {
            ...mCol,
            render: txt => (
              <div className="d-flex align-items-center justify-content-center">
                {txt ? (
                  <CheckOutlined className="text-success" twoToneColor="#52c41a" />
                ) : (
                  <InfoCircleOutlined className="text-warning" spin />
                )}
              </div>
            )
          };
          break;
        case 'taxInvoiceCompleted':
          mCol = {
            ...mCol,
            render: txt => (
              <div className="d-flex align-items-center justify-content-center">
                {txt ? (
                  <CheckOutlined className="text-success" twoToneColor="#52c41a" />
                ) : (
                  <InfoCircleOutlined className="text-warning" spin />
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
                {text ? `${parser(text).slice(0, 3)}-${parser(text).slice(3, 6)}-${parser(text).slice(-4)}` : '-'}
              </div>
            )
          };
          break;
        case 'saleType':
          mCol = {
            ...mCol,
            render: text => <div>{text ? SaleType[text] : '-'}</div>
          };
          break;
        case 'transferType':
          mCol = {
            ...mCol,
            render: text => <div>{text ? TransferType[text] : '-'}</div>
          };
          break;
        case 'deliverType':
          mCol = {
            ...mCol,
            render: text => <div>{text ? DeliveryType[text] : '-'}</div>
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
            render: arr => (
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
            render: arr => (
              <span>{arr ? (Array.isArray(arr) ? arr.map((tag, i) => <Tag key={i}>{tag}</Tag>) : arr) : '-'}</span>
            )
          };
          break;
        case 'toDestination':
          mCol = {
            ...mCol,
            render: (text, record) => {
              return (
                <div>{text ? (record.transferType === 'sold' ? text : branches[text]?.branchName || text) : '-'}</div>
              );
            }
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
        case 'origin':
        case 'fromOrigin':
          mCol = {
            ...mCol,
            render: (text, record) => {
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
      return {
        ...mCol,
        onCell: (record, rowIndex) => ({
          columns,
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          editable: col.editable,
          handleSave, // parent function to update data
          editingCell, // current active cell (from state)
          setEditingCell, // function to update the active cell state
          rowKey: record.key, // row key, usually record.key
          rowIndex, // row index from onCell callback
          colIndex, // index of this column (for navigation, if needed)
          align: col.align,
          // Spread any additional options provided (e.g. onKeyDown, onBlur, size)
          ...options
        })
      };
    }
    return mCol;
  });
};

export const getValidationRules = dataIndex => {
  const isCurrency = checkIsCurrency(dataIndex);
  const isNumber = checkIsNumber(dataIndex);

  if (isCurrency || isNumber) {
    return [
      { required: true, message: 'ข้อมูลไม่ถูกต้อง' },
      {
        type: 'number',
        transform: value => Number(value),
        message: 'ค่าต้องเป็นตัวเลข'
      }
    ];
  }

  // Customize validation for non-currency fields:
  switch (dataIndex) {
    case 'productCode':
      return [{ required: true, message: 'จำเป็นต้องป้อนข้อมูล' }];
    // Add other cases as needed
    default:
      return [];
  }
};

export const TableSummary = ({
  pageData,
  dataLength,
  startAt,
  sumKeys,
  align = 'right', // global default alignment for summary cells
  labelAlign = 'right',
  sumClassName,
  noDecimal,
  columns,
  label,
  hasSection,
  skipColumns = [], // array of dataIndex values to skip
  customAlign = {} // object mapping dataIndex to an alignment value (e.g. { total: 'center', qty: 'right' })
}) => {
  if (dataLength === 0) {
    return null;
  }
  // Filter out any deleted items
  const filteredData = pageData.filter(l => !l.deleted);

  let total = 0;
  const sumObj = {};

  // Decide if we sum rows that are isSection or not
  const relevantRows = hasSection ? filteredData.filter(l => l?.isSection) : filteredData.filter(l => !l?.isSection);

  if (sumKeys && Array.isArray(sumKeys)) {
    sumKeys.forEach(k => {
      sumObj[k] = relevantRows.reduce((acc, elem) => acc + Numb(elem[k]), 0);
    });
  } else {
    // If no sumKeys provided, default to summing 'total'
    total = relevantRows.reduce((acc, elem) => acc + Numb(elem.total), 0);
  }

  if (pageData.length === 0) {
    return null;
  }

  // Helper function: get cell alignment for a given dataIndex.
  const getCellAlign = dataIndex => {
    return customAlign[dataIndex] || align;
  };

  return (
    <Table.Summary.Row className="bg-light">
      {/* Render empty cells for columns before summary cells */}
      {Array.from(new Array(startAt), (_, i) => (
        <Table.Summary.Cell key={i} />
      ))}
      <Table.Summary.Cell>
        <div style={{ textAlign: labelAlign }}>
          <Text>{label || 'ยอดรวม'}</Text>
        </div>
      </Table.Summary.Cell>

      {sumKeys && Array.isArray(sumKeys) ? (
        columns ? (
          // If columns are provided, use getIndexFromColumns to get a list of dataIndices.
          getIndexFromColumns(columns)
            .slice(startAt + 1)
            .map(colDataIndex => {
              // Skip columns if specified
              if (skipColumns.includes(colDataIndex)) {
                return <Table.Summary.Cell key={colDataIndex} />;
              }
              if (sumKeys.includes(colDataIndex)) {
                return (
                  <Table.Summary.Cell key={colDataIndex} align={getCellAlign(colDataIndex)}>
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
              return <Table.Summary.Cell key={colDataIndex} />;
            })
        ) : (
          // If no columns are passed, simply map over the sumObj keys.
          Object.keys(sumObj).map(k => {
            // Skip columns if specified.
            if (skipColumns.includes(k)) {
              return <Table.Summary.Cell key={k} />;
            }
            return (
              <Table.Summary.Cell key={k} align={getCellAlign(k)}>
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
        // If no sumKeys provided, default to showing the "total" column.
        <Table.Summary.Cell align={getCellAlign('total')}>
          <div style={{ textAlign: getCellAlign('total') }}>
            <Text className="text-primary">{numeral(total).format(noDecimal ? '0,0' : '0,0.00')}</Text>
          </div>
        </Table.Summary.Cell>
      )}
    </Table.Summary.Row>
  );
};
