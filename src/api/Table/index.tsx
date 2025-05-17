import React, { useRef, KeyboardEvent, useContext } from 'react';
import { Form, Popconfirm, Tooltip, Select, Table, Typography, Tag, FormInstance } from 'antd';
import { Rule } from 'antd/es/form';
import numeral from 'numeral';
import { DateTime } from 'luxon';
import { 
  CheckOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined, 
  EditOutlined,
  CheckCircleOutlined,
  RightOutlined,
  CloseOutlined
} from '@ant-design/icons';
import DealerSelector from 'components/DealerSelector';
import BranchSelector from 'components/BranchSelector';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
import DepartmentSelector from 'components/DepartmentSelector';
import ExpenseNameSelector from 'components/ExpenseNameSelector';
import EmployeeSelector from 'components/EmployeeSelector';
import WithHoldingTaxDocSelector from 'components/WithHoldingTaxDocSelector';
import BankSelector from 'components/BankSelector';
import VehicleSelector from 'components/VehicleSelector';
import DocSelector from 'components/DocSelector';
import StoreLocationSelector from 'components/StoreLocationSelector';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { useSelector } from 'react-redux';
import WithHoldingTaxSelector from 'components/WithHoldingTaxSelector';
import SelfBankSelector from 'components/SelfBankSelector';
import VehicleItemTypeSelector from 'components/VehicleItemTypeSelector';
import { DatePicker, Input, Button } from 'elements';
import CommonSelector from 'components/CommonSelector';
import {
  Seller,
  PriceType,
  WitholdingTax,
  WitholdingTaxDoc,
  VehicleItemType,
  SaleType,
  TransferType,
  OtherVehicleImportType,
  ProductType,
  VehicleType,
  WVehicleType,
  DeliveryType,
  PaymentType
} from 'data/Constant';
import PaymentTypeSelector from 'components/PaymentTypeSelector';
import PaymentMethodSelector from 'components/PaymentMethodSelector';
import CustomerSelector from 'components/CustomerSelector';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { showLog, isDateTypeField, validateMobileNumber, Numb, parser, showWarning } from 'utils/functions';
import BooleanSelector from 'components/BooleanSelector';
import { createArrOfLength } from 'utils/functions';
import ServiceSelector from 'components/ServiceSelector';
import { getNameFromEmployeeCode } from 'modules/Utils';
import BuyTypeSelector from 'components/BuyTypeSelector';
import { BuyType } from 'data/Constant';
import ExecutiveSelector from 'components/ExecutiveSelector';
import { PaymentMethod } from 'data/Constant';
import { ColumnProps } from './helper';
import {
  TableBaseRecord,
  TableColumnConfig,
  TableContext,
  TableEventHandlers,
  TableState,
  EditableRowProps,
  EditableCellProps,
  GetInputNodeProps,
  GetRenderColumnsProps,
  GetColumnsProps,
  CreateValidatorProps,
  TableSummaryProps,
  GetRulesProps,
  GetIndexFromColumnsProps,
  GetColumnDataIndexProps,
  GetColumnTitlesProps
} from 'types/table';

const { Option } = Select;
const { Text } = Typography;

const EditableContext = React.createContext<FormInstance | null>(null);

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false} scrollToFirstError>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

// Helper function to handle Enter key behavior
const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    const value = e.currentTarget.value;
    showLog('Current value:', value);
  }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, dataIndex: string, handlers: TableEventHandlers<any>): void => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    handlers.onKeyDown?.(e.key, dataIndex);
  }
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement>, dataIndex: string, handlers: TableEventHandlers<any>): void => {
  e.preventDefault();
  e.stopPropagation();
  handlers.onBlur?.(dataIndex);
};

const handleSelect = (handlers: TableEventHandlers<any>): void => {
  handlers.onSelect?.();
};

export const getInputNode = ({
  dataIndex,
  number,
  ref,
  save,
  size,
  record,
  onBlur,
  path
}: GetInputNodeProps): React.ReactNode => {
  const mProps = {
    ref,
    ...(typeof onBlur === 'function' && { onBlur: save }),
    ...(number && { number: true })
  };

  const selectProps = {
    ...(typeof save === 'function' && { onSelect: save })
  };

  const dateProps = {
    ref,
    ...(typeof save === 'function' && { onChange: save })
  };

  const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(dataIndex);
  const isSale = ['/sale-machines', '/sale-booking'].includes(path || '');
  const isWarehouse = ['/warehouse/export-by-transfer'].includes(path || '');

  let inputNode = <Input {...mProps} size={size || 'small'} />;

  if (isBoolean) {
    inputNode = <BooleanSelector {...mProps} size={size || 'small'} />;
  } else {
    switch (dataIndex) {
      case 'payer':
      case 'senderEmployee':
      case 'picker':
      case 'receiverEmployee':
      case 'sender':
      case 'recordedBy':
      case 'verifiedBy':
      case 'deliveredBy':
      case 'receivedBy':
      case 'person':
      case 'employeeId':
      case 'employeeCode':
      case 'depositor':
        inputNode = (
          <EmployeeSelector 
            placeholder="ชื่อ (ชื่อเล่น)" 
            size={size || 'small'} 
            allowNotInList 
            {...selectProps} 
          />
        );
        break;

      case 'executiveId':
        inputNode = (
          <ExecutiveSelector placeholder="ผู้บริหาร" size={size || 'small'} allowNotInList {...selectProps} />
        );
        break;

      case 'expenseBranch':
        inputNode = <BranchSelector placeholder="ค่าใช้จ่ายประจำสาขา" size={size || 'small'} {...selectProps} />;
        break;

      case 'department':
        inputNode = <DepartmentSelector placeholder="แผนก" size={size || 'small'} {...selectProps} />;
        break;

      case 'expenseCategoryId':
        inputNode = <ExpenseCategorySelector placeholder="หมวดรายจ่าย" size={size || 'small'} {...selectProps} />;
        break;

      case 'expenseAccountNameId':
      case 'expenseAccountName':
        inputNode = (
          <ExpenseNameSelector
            placeholder="ชื่อบัญชี"
            size={size}
            {...selectProps}
          />
        );
        break;

      case 'dealer':
      case 'receiver':
        inputNode = <DealerSelector placeholder="ชื่อผู้จำหน่าย" size={size || 'small'} {...selectProps} />;
        break;

      case 'seller':
        inputNode = (
          <Select placeholder="ผู้จำหน่าย" size={size || 'small'} {...selectProps}>
            {Object.entries(Seller).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        );
        break;

      case 'productCode':
        inputNode = (
          <VehicleSelector
            placeholder="รุ่น/ รหัส / ชื่อสินค้า"
            size={size || 'small'}
            {...(selectProps as any)}
          />
        );
        break;

      case 'isUsed':
        inputNode = (
          <Select className="text-primary" {...selectProps} size={size || 'small'}>
            <Select.Option value={false}>ใหม่</Select.Option>
            <Select.Option value={true}>มือสอง</Select.Option>
          </Select>
        );
        break;

      case 'pCode':
        inputNode = (
          <DocSelector
            collection="data/products/partList"
            orderBy={['pCode', 'name', 'model']}
            labels={['pCode', 'name', 'model']}
            size={size || 'small'}
            dropdownStyle={{ minWidth: 420 }}
            dropdownAlign={{ offset: [-80, 4] }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEnterKey(e)}
            {...selectProps}
          />
        );
        break;

      case 'serviceCode': {
        // Distinguish between service or part
        const isPart = record?.serviceItemType === 'อะไหล่';
        const collection = isPart ? 'data/products/partList' : 'data/services/serviceList';
        const orderBy = isPart ? ['pCode', 'name', 'model'] : ['serviceCode', 'name'];

        inputNode = isPart ? (
          <DocSelector
            collection={collection}
            orderBy={orderBy}
            size={size || 'small'}
            dropdownStyle={{ minWidth: 300 }}
            dropdownAlign={{ offset: [-80, 4] }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEnterKey(e)}
            {...selectProps}
          />
        ) : (
          <ServiceSelector placeholder="พิมพ์ รหัส/ชื่อบริการ" size={size || 'small'} {...selectProps} />
        );
        break;
      }

      case 'turnOverVehicleNo':
      case 'vehicleNo': {
        const nextProps = {
          ...selectProps,
          ...(typeof onBlur === 'function' && { onBlur: save })
        };
        let vNoQueries = [];
        if (record?.productCode && record.productCode !== 'undefined') {
          vNoQueries.push(['productPCode', '==', removeAllNonAlphaNumericCharacters(record.productCode)]);
        }
        if (record?.branchCode) {
          vNoQueries.push(['branchCode', '==', record.branchCode]);
        }
        if (typeof record.sold !== 'undefined') {
          vNoQueries.push(['sold', '==', null]);
        }

        inputNode = (
          <DocSelector
            collection="sections/stocks/vehicles"
            orderBy={['vehicleNo']}
            labels={['vehicleNo', 'model']}
            wheres={vNoQueries}
            size={size || 'small'}
            mode="tags"
            hasKeywords
            startSearchAt={2}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEnterKey(e)}
            {...nextProps}
          />
        );
        break;
      }

      case 'peripheralNo': {
        const nextProps2 = {
          ...selectProps,
          ...(typeof onBlur === 'function' && { onBlur: save })
        };
        let peripheralQueries = [];
        if (record?.branchCode) {
          peripheralQueries.push(['branchCode', '==', record.branchCode]);
        }
        if (typeof record.sold !== 'undefined') {
          peripheralQueries.push(['sold', '==', null]);
        }

        inputNode = (
          <DocSelector
            collection="sections/stocks/vehicles"
            orderBy={['peripheralNo']}
            labels={['peripheralNo', 'model']}
            wheres={peripheralQueries}
            size={size || 'small'}
            mode="tags"
            hasKeywords
            startSearchAt={2}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEnterKey(e)}
            {...nextProps2}
          />
        );
        break;
      }

      case 'peripheralNo_bak':
        inputNode = (
          <DocSelector
            collection="sections/stocks/peripherals"
            orderBy="peripheralNo"
            wheres={[
              ['reserved', '==', null],
              ['sold', '==', null]
            ]}
            size={size || 'small'}
            mode="tags"
            allowNotInList
            {...selectProps}
          />
        );
        break;

      case 'engineNo':
      case 'pressureBladeNo':
      case 'bucketNo':
      case 'sugarcanePickerNo':
      case 'turnOverVehicleNo':
      case 'turnOverPeripheralNo':
      case 'turnOverEngineNo':
        inputNode = (
          <Select
            mode="tags"
            notFoundContent={null}
            size={size || 'small'}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEnterKey(e)}
            {...selectProps}
          />
        );
        break;

      case 'customer':
        inputNode = (
          <CustomerSelector
            placeholder="พิมพ์ ชื่อ/นามสกุล/เบอร์โทร/รหัสลูกค้า"
            size={size || 'small'}
            {...selectProps}
          />
        );
        break;

      case 'whTaxDoc':
        inputNode = <WithHoldingTaxDocSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'transferDate':
      case 'importDate':
      case 'exportDate':
      case 'deliveredDate':
      case 'receivedDate':
      case 'recordedDate':
      case 'transferInDate':
      case 'transferOutDate':
      case 'decalRecordedDate':
      case 'decalWithdrawDate':
      case 'depositDate':
      case 'date':
        inputNode = <DatePicker size={size || 'small'} {...dateProps} />;
        break;

      case 'inputDate':
        inputNode = <DatePicker placeholder="วันที่คีย์" size={size || 'small'} {...dateProps} />;
        break;

      case 'year':
        inputNode = <DatePicker picker="year" size={size || 'small'} {...dateProps} />;
        break;

      case 'bank':
        inputNode = <BankSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'selfBank':
      case 'selfBankId': {
        let bDisable = false;
        if (record?.paymentType === 'cash') {
          bDisable = true;
        }
        inputNode = <SelfBankSelector size={size || 'small'} disabled={bDisable} {...(selectProps as any)} />;
        break;
      }

      case 'branchCode':
      case 'payToBranch':
        inputNode = <BranchSelector branchCode="branchCode" size={size || 'small'} {...(selectProps as any)} />;
        break;

      case 'storeLocationCode': {
        const isUsed = !!record?.isUsed;
        inputNode = <StoreLocationSelector size={size || 'small'} isUsed={isUsed} {...selectProps} />;
        break;
      }

      case 'partLocationCode':
        inputNode = <StoreLocationSelector isPart size={size || 'small'} {...selectProps} />;
        break;

      case 'priceType':
        inputNode = <PriceTypeSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'productType':
        inputNode = (
          <CommonSelector
            size={size || 'small'}
            placeholder="ประเภท"
            optionData={ProductType}
            dropdownStyle={{ minWidth: 220 }}
            {...selectProps}
          />
        );
        break;

      case 'partType':
        inputNode = (
          <CommonSelector
            size={size || 'small'}
            placeholder="ประเภท"
            optionData={['SKC', 'KBN']}
            dropdownStyle={{ minWidth: 120 }}
            {...selectProps}
          />
        );
        break;

      case 'vehicleType':
        inputNode = (
          <CommonSelector
            size={size || 'small'}
            placeholder="ประเภท"
            dropdownStyle={{ minWidth: 220 }}
            optionData={isWarehouse ? WVehicleType : VehicleType}
            {...selectProps}
          />
        );
        break;

      case 'serviceItemType':
        inputNode = (
          <CommonSelector
            optionData={['อะไหล่', 'บริการ']}
            size={size || 'small'}
            placeholder="ประเภท"
            dropdownStyle={{ minWidth: 100 }}
            {...selectProps}
          />
        );
        break;

      case 'returnQty': {
        const returnOption = record?.qty ? createArrOfLength(record.qty + 1) : [1, 2, 3, 4, 5];
        inputNode = (
          <CommonSelector
            optionData={returnOption.map(String)}
            size={size || 'small'}
            placeholder="จำนวน"
            dropdownStyle={{ minWidth: 80 }}
            {...(selectProps as any)}
          />
        );
        break;
      }

      case 'hasWHTax':
        inputNode = <WithHoldingTaxSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'paymentType':
        inputNode = <PaymentTypeSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'paymentMethod': {
        let pDisable = false;
        if (record?.paymentType === 'cash') {
          pDisable = true;
        }
        inputNode = <PaymentMethodSelector size={size || 'small'} disabled={pDisable} {...selectProps} />;
        break;
      }

      case 'buyType':
        inputNode = <BuyTypeSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'vehicleItemType':
        inputNode = <VehicleItemTypeSelector size={size || 'small'} {...selectProps} />;
        break;

      case 'isVatIncluded':
        inputNode = (
          <Select placeholder="VAT" size={size || 'small'} {...selectProps}>
            <Option value={true}>{'รวม VAT'}</Option>
            <Option value={false}>{'ไม่รวม VAT'}</Option>
          </Select>
        );
        break;

      case 'total':
      case 'amount':
        inputNode = <Input {...mProps} size={size || 'small'} suffix="บาท" placeholder="จำนวนเงิน" />;
        break;

      default:
        // Default input
        break;
    }
  }

  return inputNode;
};

export const getRenderColumns = ({
  columns,
  handleSave,
  db,
  isEditing,
  onKeyDown,
  onBlur,
  size
}: GetRenderColumnsProps): TableColumnConfig<any>[] => {
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

  return columns.map((col, n) => {
    let mCol: TableColumnConfig<any> = {
      title: col.title,
      dataIndex: col.dataIndex,
      ...(col.width && { width: col.width }),
      ...(col.align && { align: col.align })
    };

    if (col.children || col.render) {
      return { ...col, title: <div className="text-center">{col.title}</div> };
    }
    if ('titleAlign' in col && col.titleAlign) {
      switch (col.titleAlign) {
        case 'left':
          mCol = {
            ...mCol,
            title: col.title
          };
          break;
        case 'right':
          mCol = {
            ...mCol,
            title: <div className="text-right">{col.title}</div>
          };
          break;
        default:
          break;
      }
    }
    const hasTooltip = ['productName', 'seller'].includes(col.dataIndex);
    const isCurrency = [
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
      'gasCost'
    ].includes(col.dataIndex);
    const isNumber = ['import', 'total', 'qty', 'distance', 'amount'].includes(col.dataIndex);
    const isDate = isDateTypeField(col.dataIndex) || col.dataIndex === 'date';
    const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(col.dataIndex);

    if (hasTooltip) {
      mCol = {
        ...mCol,
        render: text => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        )
      };
    } else if (isCurrency) {
      mCol = {
        ...mCol,
        align: 'right',
        render: text => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0.00') : '-'}
          </div>
        )
      };
    } else if (isNumber) {
      mCol = {
        ...mCol,
        align: 'right',
        render: text => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0') : '-'}
          </div>
        )
      };
    } else if (isDate) {
      mCol = {
        ...mCol,
        align: 'center',
        render: text => (
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
      switch (col.dataIndex) {
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
              <div className={!text && text !== 0 ? 'transparent' : ''}>{text ? (VehicleItemType as any)[text] : '-'}</div>
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
                {text ? `${String(parser(text)).slice(0, 3)}-${String(parser(text)).slice(3, 6)}-${String(parser(text)).slice(-4)}` : '-'}
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
              <span>{arr ? arr.map((tag: any, i: number) => <Tag key={i}>{`${tag.name} x${tag.total}`}</Tag>) : '-'}</span>
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
              <span>{arr ? (Array.isArray(arr) ? arr.map((tag: any, i: number) => <Tag key={i}>{tag}</Tag>) : arr) : '-'}</span>
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
      let cellObj = {
        number: col.number,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: <div className="text-center">{col.title}</div>,
        required: col.required,
        ...(typeof handleSave !== 'undefined' && { handleSave }),
        ...(typeof onKeyDown !== 'undefined' && { onKeyDown }),
        ...(typeof onBlur !== 'undefined' && { onBlur }),
        ...(typeof size !== 'undefined' && { size })
      };
      let resultForRowType = {
        ...mCol,
        ...((ColumnProps as any)[col.dataIndex]),
        ...(col.width && { width: col.width }),
        key: n.toString(),
        onCell: (record: any) => ({
          record,
          ...cellObj,
          ...(typeof isEditing === 'function' ? { editing: isEditing(record) } : {})
        })
      };
      let resultForCellType = {
        ...mCol,
        ...((ColumnProps as any)[col.dataIndex]),
        ...(col.width && { width: col.width }),
        key: n.toString(),
        onCell: (record: any) => ({
          record,
          ...cellObj
        })
      };

      return typeof isEditing === 'undefined' ? resultForCellType : resultForRowType;
    }
    return {
      ...mCol,
      key: n.toString(),
      ...((ColumnProps as any)[col.dataIndex]),
      ...(col.width && { width: col.width }),
      ...(col.align && { align: col.align })
    };
  });
};

export const GetColumns = (props: GetColumnsProps): TableColumnConfig<any>[] => {
  const {
    columns = [],
    handleDelete,
    handleSave,
    handleSelect,
    handleEdit,
    onDelete,
    isEditing,
    onKeyDown,
    onBlur,
    size,
    hasChevron,
    hasEdit,
    disabled,
    readOnly,
    deletedButtonAtEnd
  } = props;

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
  } = useSelector((state: any) => state.data);

  const db = {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  };

  let mColumns = getRenderColumns({ columns, handleSave, db, isEditing, onKeyDown, onBlur, size });

  const canDelete = typeof onDelete !== 'undefined' && !(disabled || readOnly);
  if (canDelete) {
    const deleteCol = {
      title: 'ลบ',
      dataIndex: 'operation',
      align: 'center' as 'center',
      width: 80,
      render: (_: any, record: any) => {
        const alreadyGone = record?.deleted || record?.rejected || record?.completed;
        if (!alreadyGone) {
          return (
            <Popconfirm
              title="แน่ใจหรือไม่ ?"
              onConfirm={() => handleDelete && handleDelete(record.key)}
              okText="ลบ"
              cancelText="ยกเลิก"
            >
              <DeleteOutlined className="text-danger mb-2" />
            </Popconfirm>
          );
        }
        return (
          <Button
            type="link"
            icon={<DeleteOutlined className="text-danger" />}
            onClick={() => showWarning('ไม่สามารถลบได้ ...' as any)}
          />
        );
      }
    };
    const idIndex = mColumns.findIndex(col => col.dataIndex === 'id' && !deletedButtonAtEnd);
    if (idIndex > -1) {
      mColumns.splice(idIndex + 1, 0, deleteCol);
    } else {
      mColumns.push(deleteCol);
    }
  }

  if (hasChevron && !(disabled || readOnly)) {
    mColumns.push({
      title: '→',
      dataIndex: 'selectRecord',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<RightOutlined />}
          onClick={() => {
            if (!record.deleted && typeof handleSelect === 'function') {
              handleSelect(record);
            }
          }}
        />
      )
    });
  }

  if (hasEdit && !(disabled || readOnly)) {
    const editCol = {
      title: '🖊',
      dataIndex: 'editRecord',
      align: 'center' as 'center',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            const cannotEdit = record?.deleted || record?.rejected || record?.completed;
            if (!cannotEdit && typeof handleEdit === 'function') {
              handleEdit(record);
            }
          }}
        />
      )
    };
    const idIndex = mColumns.findIndex(col => col.dataIndex === 'id');
    if (idIndex > -1) {
      mColumns.splice(idIndex + 1, 0, editCol);
    } else {
      mColumns.push(editCol);
    }
  }

  return mColumns;
};

export const createValidator = ({ dataIndex, number, getFieldValue }: CreateValidatorProps): Rule[] => {
  switch (dataIndex) {
    case 'vehicleNo':
      return [{
        validator(rule: any, value: any) {
          const peripheralNo = getFieldValue('peripheralNo');
          if (!value && !peripheralNo) {
            return Promise.reject('กรุณาป้อนข้อมูล (vehicleNo หรือ peripheralNo)');
          }
          return Promise.resolve();
        }
      }];
    case 'peripheralNo':
      return [{
        validator(rule: any, value: any) {
          const vehicleNo = getFieldValue('vehicleNo');
          if (!value && !vehicleNo) {
            return Promise.reject('กรุณาป้อนข้อมูล (vehicleNo หรือ peripheralNo)');
          }
          return Promise.resolve();
        }
      }];
    default:
      return [{
        validator(rule: any, value: any) {
          if (number) {
            if (!value || !isNaN(value)) {
              return Promise.resolve();
            }
            return Promise.reject('กรุณาป้อนเป็นตัวเลข');
          }
          return Promise.resolve();
        }
      }];
  }
};

export const TableSummary: React.FC<TableSummaryProps> = ({ columns, data, sumKeys, align, noDecimal }) => {
  const total = data.reduce((sum, record) => {
    if (sumKeys) {
      return sum + sumKeys.reduce((acc, key) => acc + (record[key] as number || 0), 0);
    }
    return sum + (record.total as number || 0);
  }, 0);

  return (
    <Table.Summary.Row>
      {columns.map((col, index) => {
        if (index === 0) {
          return (
            <Table.Summary.Cell key={index} index={index}>
              <div style={{ textAlign: align || 'right' }}>
                <Text className="text-primary">รวม</Text>
              </div>
            </Table.Summary.Cell>
          );
        }
        if (sumKeys && sumKeys.includes(col.dataIndex)) {
          const colTotal = data.reduce((sum, record) => sum + (record[col.dataIndex] as number || 0), 0);
          return (
            <Table.Summary.Cell key={index} index={index}>
              <div style={{ textAlign: align || 'right' }}>
                <Text className="text-primary">{numeral(colTotal).format(noDecimal ? '0,0' : '0,0.00')}</Text>
              </div>
            </Table.Summary.Cell>
          );
        }
        return <Table.Summary.Cell key={index} index={index} />;
      })}
      {!sumKeys && (
        <Table.Summary.Cell index={columns.length}>
          <div style={{ textAlign: align || 'right' }}>
            <Text className="text-primary">{numeral(total).format(noDecimal ? '0,0' : '0,0.00')}</Text>
          </div>
        </Table.Summary.Cell>
      )}
    </Table.Summary.Row>
  );
};

export const getRules = ({ rules }: GetRulesProps): Rule[] => {
  const requiredRule = [{ required: true, message: 'กรุณาป้อนข้อมูล' }];
  const numberRule = [
    () => ({
      validator(rule: any, value: any) {
        if (!value || !isNaN(value)) {
          return Promise.resolve();
        }
        return Promise.reject('กรุณาป้อนตัวเลข');
      }
    })
  ];
  const mobileNumberRule = [
    () => ({
      validator(rule: any, value: any) {
        if (!value) {
          return Promise.resolve();
        }
        if (validateMobileNumber(value)) {
          return Promise.resolve();
        }
        return Promise.reject('กรุณาตรวจสอบ เบอร์โทรศัพท์');
      }
    })
  ];

  let result: Rule[] = [];

  rules.forEach(rule => {
    switch (true) {
      case rule === 'required': {
        result = result.concat(requiredRule);
        break;
      }
      case rule === 'number': {
        result = result.concat(numberRule);
        break;
      }
      case rule === 'mobileNumber': {
        result = result.concat(mobileNumberRule);
        break;
      }
      case typeof rule === 'object' && 'pattern' in rule: {
        const { pattern, message } = rule as { pattern: RegExp; message?: string };
        result.push({ pattern, message: message || 'รูปแบบไม่ถูกต้อง' });
        break;
      }
      case typeof rule === 'object' && 'minLength' in rule: {
        const { minLength, message } = rule as { minLength: number; message?: string };
        result.push({
          min: minLength,
          message: message || `กรุณาป้อนอย่างน้อย ${minLength} ตัวอักษร`
        });
        break;
      }
    }
  });

  return result;
};

export const getRulesFromColumn = (col: TableColumnConfig<any>) => {
  const { required, number } = col;

  if (required && number) {
    return [
      { required: true, message: 'กรุณาป้อนข้อมูล' },
      {
        validator(rule: any, value: any) {
          if (!value || !isNaN(value)) {
            return Promise.resolve();
          }
          return Promise.reject('กรุณาป้อนตัวเลข');
        }
      }
    ];
  } else if (required) {
    return [{ required: true, message: 'กรุณาป้อนข้อมูล' }];
  } else if (number) {
    return [
      {
        validator(rule: any, value: any) {
          if (!value || !isNaN(value)) {
            return Promise.resolve();
          }
          return Promise.reject('กรุณาป้อนตัวเลข');
        }
      }
    ];
  }
  return undefined;
};

const getIndexFromColumns = ({ columns, startAt = 0 }: GetIndexFromColumnsProps): string[] => {
  const result: string[] = [];
  const traverse = (cols: TableColumnConfig<any>[]) => {
    cols.forEach(col => {
      if (col.dataIndex) {
        result.push(col.dataIndex);
      }
      if (col.children) {
        traverse(col.children);
      }
    });
  };
  traverse(columns);
  return result.slice(startAt);
};

export const getColumnDataIndex = ({ columns, startAt = 0 }: GetColumnDataIndexProps): string[] => {
  return getIndexFromColumns({ columns, startAt });
};

export const getColumnTitles = ({ columns, startAt = 0 }: GetColumnTitlesProps): string[] => {
  const result: string[] = [];
  const traverse = (cols: TableColumnConfig<any>[]) => {
    cols.forEach(col => {
      if (col.title) {
        result.push(col.title as string);
      }
      if (col.children) {
        traverse(col.children);
      }
    });
  };
  traverse(columns);
  return result.slice(startAt);
};
