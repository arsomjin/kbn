import React from 'react';
import { Form, Popconfirm, Tooltip, Select, Table, Typography, Tag } from 'antd';
import numeral from 'numeral';
import dayjs from 'dayjs';
import {
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  RightOutlined,
  CloseOutlined,
  EditOutlined as EditIcon,
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
  PaymentType,
} from 'data/Constant';
import PaymentTypeSelector from 'components/PaymentTypeSelector';
import PaymentMethodSelector from 'components/PaymentMethodSelector';
import CustomerSelector from 'modules/Customers/CustomerSelector';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { showLog, isDateTypeField, validateMobileNumber, Numb, parser } from 'utils/functions';
import BooleanSelector from 'components/BooleanSelector';
import { createArrOfLength } from 'utils/functions';
import ServiceSelector from 'components/ServiceSelector';
import { getNameFromEmployeeCode } from 'modules/Utils';
import BuyTypeSelector from 'components/BuyTypeSelector';
import { BuyType } from 'data/Constant';
import ExecutiveSelector from 'components/ExecutiveSelector';
import { PaymentMethod } from 'data/Constant';
import { useModal } from 'contexts/ModalContext';

const { Option } = Select;
const { Text } = Typography;

export const EditableContext = React.createContext(null);

export const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false} scrollToFirstError>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export const ColumnProps = {
  id: {
    width: 50,
  },
  productCode: {
    width: 180,
  },
  pCode: {
    width: 180,
  },
  serviceCode: {
    width: 180,
  },
  productName: {
    width: 180,
  },
  productType: {
    width: 100,
  },
  partType: {
    width: 100,
  },
  vehicleType: {
    width: 100,
  },
  serviceItemType: {
    width: 120,
  },
  storeLocationCode: {
    width: 120,
  },
  partLocationCode: {
    width: 120,
  },
  isUsed: {
    width: 100,
  },
  import: {
    width: 60,
  },
  unit: {
    width: 60,
  },
  unitPrice: {
    width: 130,
  },
  discount: {
    width: 130,
  },
  total: {
    width: 140,
  },
  amount: {
    width: 140,
  },
  amtReceived: {
    width: 140,
  },
  amtFull: {
    width: 130,
  },
  operation: {
    width: 45,
  },
  branchCode: {
    width: 110,
  },
  payToBranch: {
    width: 110,
  },
  branch: {
    width: 80,
  },
  date: {
    width: 120,
  },
  inputDate: {
    width: 120,
  },
  incomeDate: {
    width: 120,
  },
  transferDate: {
    width: 120,
  },
  importDate: {
    width: 120,
  },
  receivedDate: {
    width: 120,
  },
  recordedDate: {
    width: 120,
  },
  transferInDate: {
    width: 120,
  },
  transferOutDate: {
    width: 120,
  },
  exportDate: {
    width: 120,
  },
  saleDate: {
    width: 120,
  },
  docDate: {
    width: 120,
  },
  receiveDate: {
    width: 120,
  },
  deliverDate: {
    width: 120,
  },
  deliveredDate: {
    width: 120,
  },
  decalRecordedDate: {
    width: 120,
  },
  decalWithdrawDate: {
    width: 120,
  },
  depositDate: {
    width: 120,
  },
  deliverTime: {
    width: 80,
  },
  arrivalTime: {
    width: 80,
  },
  appointmentTime: {
    width: 80,
  },
  year: {
    width: 120,
  },
  seller: {
    width: 180,
  },
  payer: {
    width: 120,
  },
  paymentType: {
    width: 120,
  },
  paymentMethod: {
    width: 100,
  },
  senderEmployee: {
    width: 150,
  },
  receiverEmployee: {
    width: 150,
  },
  salesPerson: {
    width: 150,
  },
  technicianId: {
    width: 150,
  },
  technician: {
    width: 150,
  },
  person: {
    width: 150,
  },
  sender: {
    width: 120,
  },
  recordedBy: {
    width: 120,
  },
  verifiedBy: {
    width: 120,
  },
  deliveredBy: {
    width: 120,
  },
  receivedBy: {
    width: 120,
  },
  employeeId: {
    width: 120,
  },
  employeeCode: {
    width: 120,
  },
  depositor: {
    width: 120,
  },
  expenseCategoryId: {
    width: 180,
  },
  expenseName: {
    width: 240,
  },
  item: {
    width: 240,
  },
  expenseBranch: {
    width: 180,
  },
  department: {
    width: 180,
  },
  balance: {
    width: 120,
  },
  expenseAccountName: {
    width: 200,
  },
  expenseAccountNameId: {
    width: 200,
  },
  dealer: {
    width: 180,
  },
  billNo: {
    width: 140,
  },
  isVatIncluded: {
    width: 100,
  },
  receiver: {
    width: 220,
  },
  bank: {
    width: 120,
  },
  selfBank: {
    width: 160,
  },
  selfBankId: {
    width: 180,
  },
  accNo: {
    width: 130,
  },
  selfAccNo: {
    width: 130,
  },
  remark: {
    width: 180,
  },
  bankName: {
    width: 200,
  },
  selfBankName: {
    width: 200,
  },
  refNo: {
    width: 180,
  },
  payInNo: {
    width: 140,
  },
  taxInvoiceNo: {
    width: 180,
  },
  docNo: {
    width: 140,
  },
  whTaxDoc: {
    width: 120,
  },
  vehicleNo: {
    width: 200,
  },
  turnOverVehicleNo: {
    width: 200,
  },
  itemType: {
    width: 180,
  },
  prefix: {
    width: 70,
  },
  firstName: {
    width: 120,
  },
  nickName: {
    width: 80,
  },
  lastName: {
    width: 140,
  },
  userGroup: {
    width: 120,
  },
  saleNo: {
    width: 160,
  },
  bookNo: {
    width: 160,
  },
  assessmentResult: {
    width: 100,
  },
  assessmentDate: {
    width: 120,
  },
  saleType: {
    width: 120,
  },
  engineNo: {
    width: 180,
  },
  pressureBladeNo: {
    width: 180,
  },
  bucketNo: {
    width: 180,
  },
  sugarcanePickerNo: {
    width: 180,
  },
  chassisNumber: {
    width: 140,
  },
  importType: {
    width: 100,
  },
  isDecal: {
    width: 80,
  },
  isTakeOut: {
    width: 80,
  },
  peripheralNo: {
    width: 200,
  },
  priceType: {
    width: 120,
  },
  hasWHTax: {
    width: 120,
  },
  whTax: {
    width: 140,
  },
  VAT: {
    width: 140,
  },
  ledgerCompleted: {
    width: 48,
  },
  taxInvoiceCompleted: {
    width: 48,
  },
  vehicleItemType: {
    width: 120,
  },
  qty: {
    width: 60,
  },
  returnQty: {
    width: 100,
  },
  percentage: {
    width: 80,
  },
  amtOilType: {
    width: 120,
  },
  amtPartType: {
    width: 120,
  },
  netPrice: {
    width: 120,
  },
  netTotal: {
    width: 120,
  },
  AD_Discount: {
    width: 120,
  },
  SKCDiscount: {
    width: 120,
  },
  SKCManualDiscount: {
    width: 120,
  },
  discountCoupon: {
    width: 120,
  },
  discountPointRedeem: {
    width: 120,
  },
  sourceOfData: {
    width: 180,
  },
  customerName: {
    width: 200,
  },
  orderTypeDesc: {
    width: 180,
  },
  model: {
    width: 120,
  },
  orderNo: {
    width: 120,
  },
  vehicleRegNumber: {
    width: 100,
  },
  gasCost: {
    width: 120,
  },
  distance: {
    width: 120,
  },
  origin: {
    width: 120,
  },
  fromOrigin: {
    width: 120,
  },
  destination: {
    width: 120,
  },
  toDestination: {
    width: 120,
  },
  transferType: {
    width: 100,
  },
  deliverType: {
    width: 100,
  },
  giveaways: {
    width: 160,
  },
  customer: {
    width: 180,
  },
  picker: {
    width: 180,
  },
  address: {
    width: 80,
  },
  moo: {
    width: 80,
  },
  village: {
    width: 80,
  },
  tambol: {
    width: 80,
  },
  amphoe: {
    width: 80,
  },
  province: {
    width: 80,
  },
  postcode: {
    width: 80,
  },
  phoneNumber: {
    width: 120,
  },
};

// Helper function to handle Enter key behavior
const handleEnterKey = (event, ref, save) => {
  if (event.key === 'Enter') {
    // For Input and similar, check the value from event.target.value.
    // For Select (in tags mode), you may need to access the current selection value differently.
    const currentValue = event.target && event.target.value ? event.target.value.trim() : '';
    showLog({ handleEnterKey_value: currentValue });
    if (!currentValue) {
      // If empty, trigger blur to finish editing.
      if (ref && ref.current && typeof ref.current.blur === 'function') {
        ref.current.blur();
      }
      return;
    } else {
      // Otherwise, call the save function
      save();
    }
  }
};

export const getInputNode = ({ dataIndex, number, ref, save, size, record, onBlur, path }) => {
  // Provide default props to avoid repeated null/undefined checks
  const mProps = {
    ref,
    ...(typeof onBlur === 'function' && { onBlur: save }),
    // ...(typeof save === 'function' && { onChange: save }),
    ...(number && { number: true }), // For numeric input
  };
  const selectProps = {
    ref,
    ...(typeof save === 'function' && { onSelect: save }),
  };
  const dateProps = {
    ref,
    ...(typeof save === 'function' && { onChange: save }),
  };

  const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(dataIndex);
  const isSale = ['/sale-machines', '/sale-booking'].includes(path || '');
  const isWarehouse = ['/warehouse/export-by-transfer'].includes(path || '');

  let inputNode = <Input {...mProps} size={size || 'small'} />;

  if (isBoolean) {
    // Some boolean-like columns
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
          <ExecutiveSelector
            placeholder="ผู้บริหาร"
            size={size || 'small'}
            allowNotInList
            {...selectProps}
          />
        );
        break;

      case 'expenseBranch':
        inputNode = (
          <BranchSelector
            placeholder="ค่าใช้จ่ายประจำสาขา"
            size={size || 'small'}
            {...selectProps}
          />
        );
        break;

      case 'department':
        inputNode = (
          <DepartmentSelector placeholder="แผนก" size={size || 'small'} {...selectProps} />
        );
        break;

      case 'expenseCategoryId':
        inputNode = (
          <ExpenseCategorySelector
            placeholder="หมวดรายจ่าย"
            size={size || 'small'}
            {...selectProps}
          />
        );
        break;

      case 'expenseAccountNameId':
      case 'expenseAccountName':
        inputNode = (
          <ExpenseNameSelector
            placeholder="ชื่อบัญชี"
            size={size || 'small'}
            record={record || {}}
            {...selectProps}
          />
        );
        break;

      case 'dealer':
      case 'receiver':
        inputNode = (
          <DealerSelector placeholder="ชื่อผู้จำหน่าย" size={size || 'small'} {...selectProps} />
        );
        break;

      case 'seller':
        inputNode = (
          <Select placeholder="ผู้จำหน่าย" size={size || 'small'} {...selectProps}>
            {Object.keys(Seller).map((sl) => (
              <Option key={sl} value={sl}>
                {Seller[sl]}
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
            record={record || {}}
            {...selectProps}
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
            onKeyDown={(e) => handleEnterKey(e, ref, save)}
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
            onKeyDown={(e) => handleEnterKey(e, ref, save)}
            {...selectProps}
          />
        ) : (
          <ServiceSelector
            placeholder="พิมพ์ รหัส/ชื่อบริการ"
            size={size || 'small'}
            {...selectProps}
          />
        );
        break;
      }

      case 'vehicleNo': {
        const nextProps = {
          ...selectProps,
          ...(typeof onBlur === 'function' && { onBlur: save }),
        };
        let vNoQueries = [];
        if (record?.productCode && record.productCode !== 'undefined') {
          vNoQueries.push([
            'productPCode',
            '==',
            removeAllNonAlphaNumericCharacters(record.productCode),
          ]);
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
            onKeyDown={(e) => handleEnterKey(e, ref, save)}
            {...nextProps}
          />
        );
        break;
      }

      case 'peripheralNo': {
        const nextProps2 = {
          ...selectProps,
          ...(typeof onBlur === 'function' && { onBlur: save }),
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
            onKeyDown={(e) => handleEnterKey(e, ref, save)}
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
              ['sold', '==', null],
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
            onKeyDown={(e) => handleEnterKey(e, ref, save)}
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
        inputNode = (
          <SelfBankSelector size={size || 'small'} disabled={bDisable} {...selectProps} />
        );
        break;
      }

      case 'branchCode':
      case 'payToBranch':
        inputNode = <BranchSelector branchCode size={size || 'small'} {...selectProps} />;
        break;

      case 'storeLocationCode': {
        const isUsed = !!record?.isUsed;
        inputNode = (
          <StoreLocationSelector size={size || 'small'} isUsed={isUsed} {...selectProps} />
        );
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
            optionData={returnOption}
            size={size || 'small'}
            placeholder="จำนวน"
            dropdownStyle={{ minWidth: 80 }}
            {...selectProps}
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
        inputNode = (
          <PaymentMethodSelector size={size || 'small'} disabled={pDisable} {...selectProps} />
        );
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
        inputNode = (
          <Input {...mProps} size={size || 'small'} suffix="บาท" placeholder="จำนวนเงิน" />
        );
        break;

      default:
        // Default input
        break;
    }
  }

  return inputNode;
};

export const getRenderColumns = (
  columns,
  handleSave,
  db,
  isEditing,
  // validating
  onKeyDown,
  onBlur,
  size,
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
    expenseAccountNames,
  } = db;
  return columns.map((col, n) => {
    if (col.children || col.render) {
      return { ...col, title: <div className="text-center">{col.title}</div> };
    }
    let mCol = {
      ...col,
      title: <div className="text-center">{col.title}</div>,
    };
    if (col?.titleAlign) {
      switch (col.titleAlign) {
        case 'left':
          mCol = {
            ...mCol,
            title: col.title,
          };
          break;
        case 'right':
          mCol = {
            ...mCol,
            title: <div className="text-right">{col.title}</div>,
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
      'gasCost',
    ].includes(col.dataIndex);
    const isNumber = ['import', 'total', 'qty', 'distance', 'amount'].includes(col.dataIndex);
    const isDate = isDateTypeField(col.dataIndex) || col.dataIndex === 'date';
    const isBoolean = ['isDecal', 'isTakeOut', 'WR', 'FOC'].includes(col.dataIndex);

    if (hasTooltip) {
      mCol = {
        ...mCol,
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
      };
    } else if (isCurrency) {
      mCol = {
        ...mCol,
        align: 'right',
        render: (text) => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0.00') : '-'}
          </div>
        ),
      };
    } else if (isNumber) {
      mCol = {
        ...mCol,
        align: 'right',
        render: (text) => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0') : '-'}
          </div>
        ),
      };
    } else if (isDate) {
      mCol = {
        ...mCol,
        align: 'center',
        render: (text) => (
          <div className={!text ? 'transparent' : ''}>
            {text === 'N/A' ? text : text ? dayjs(text).format('D/MM/YYYY') : ''}
          </div>
        ),
      };
    } else if (isBoolean) {
      mCol = {
        ...mCol,
        align: 'center',
        render: (txt) => (
          <div className={`text-center ${txt ? 'text-success' : 'text-warning'}`}>
            {txt ? <CheckOutlined /> : <CloseOutlined />}
          </div>
        ),
      };
    } else {
      switch (col.dataIndex) {
        case 'id':
          mCol = {
            ...mCol,
            render: (text) => <div>{(text || n) + 1}</div>,
          };
          break;
        case 'dealer':
        case 'receiver':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && dealers[text]
                  ? `${dealers[text]?.dealerPrefix || ''}${
                      dealers[text].dealerName
                    } ${dealers[text]?.dealerLastName || ''}`.trim()
                  : text || '-'}
              </div>
            ),
          };
          break;
        case 'branchCode':
        case 'payToBranch':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && branches[text] ? branches[text].branchName : text || '-'}
              </div>
            ),
          };
          break;
        case 'selfBank':
        case 'selfBankId':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && banks[text]
                  ? `${banks[text].bankName} - ${banks[text].accNo} - ${banks[text].name}`
                  : '-'}
              </div>
            ),
          };
          break;
        case 'expenseBranch':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && branches[text] ? branches[text].branchName : '-'}
              </div>
            ),
          };
          break;
        case 'department':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && departments[text] ? departments[text].department : '-'}
              </div>
            ),
          };
          break;
        case 'userGroup':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && userGroups[text] ? userGroups[text].userGroupName : '-'}
              </div>
            ),
          };
          break;
        case 'expenseCategoryId':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && expenseCategories[text]
                  ? expenseCategories[text].expenseCategoryName
                  : '-'}
              </div>
            ),
          };
          break;
        case 'expenseAccountNameId':
          mCol = {
            ...mCol,
            render: (text) => {
              return (
                <div className={!text ? 'transparent' : ''}>
                  {text && expenseAccountNames[text] ? expenseAccountNames[text].expenseName : '-'}
                </div>
              );
            },
          };
          break;
        case 'expenseAccountName':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && expenseAccountNames[text] ? expenseAccountNames[text].expenseName : '-'}
              </div>
            ),
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
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && employees[text]
                  ? `${employees[text].firstName}${employees[text].nickName ? `(${employees[text].nickName})` : ''}`
                  : text || '-'}
              </div>
            ),
          };
          break;
        case 'executiveId':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text && executives[text]
                  ? `คุณ${executives[text].firstName}${
                      executives[text].nickName ? `(${executives[text].nickName})` : ''
                    } ${executives[text].lastName || ''}`
                  : text || '-'}
              </div>
            ),
          };
          break;
        case 'employeeCode':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {getNameFromEmployeeCode({ employeeCode: text, employees }) || '-'}
              </div>
            ),
          };
          break;
        case 'salesPerson':
        case 'technician':
        case 'technicianId':
          mCol = {
            ...mCol,
            render: (arr) => {
              let content =
                arr && Array.isArray(arr)
                  ? arr.map((text, n) =>
                      text && employees[text]
                        ? `${employees[text].firstName}${
                            employees[text].nickName ? `(${employees[text].nickName})` : ''
                          }${n < arr.length - 1 ? ', ' : ''}`
                        : text || '-',
                    )
                  : arr && employees[arr]
                    ? `${employees[arr].firstName}${employees[arr].nickName ? `(${employees[arr].nickName})` : ''}`
                    : arr || '-';
              return <div className={!arr ? 'transparent' : ''}>{content}</div>;
            },
          };
          break;
        case 'priceType':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>{text ? PriceType[text] : '-'}</div>
            ),
          };
          break;
        case 'hasWHTax':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && WitholdingTax[text] ? WitholdingTax[text] : text || '-'}
              </div>
            ),
          };
          break;
        case 'whTaxDoc':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && WitholdingTaxDoc[text] ? WitholdingTaxDoc[text] : text || '-'}
              </div>
            ),
          };
          break;
        case 'paymentType':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && PaymentType[text] ? PaymentType[text] : text || '-'}
              </div>
            ),
          };
          break;
        case 'paymentMethod':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && PaymentMethod[text] ? PaymentMethod[text] : text || '-'}
              </div>
            ),
          };
          break;
        case 'buyType':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text && BuyType[text] ? BuyType[text] : text || '-'}
              </div>
            ),
          };
          break;
        case 'vehicleItemType':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text ? VehicleItemType[text] : '-'}
              </div>
            ),
          };
          break;
        case 'importType':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text && text !== 0 ? 'transparent' : ''}>
                {text ? OtherVehicleImportType[text] : '-'}
              </div>
            ),
          };
          break;
        case 'ledgerCompleted':
          mCol = {
            ...mCol,
            render: (txt) => (
              <div className="d-flex align-items-center justify-content-center">
                {txt ? (
                  <CheckOutlined className="text-success" twoToneColor="#52c41a" />
                ) : (
                  <InfoCircleOutlined className="text-warning" spin />
                )}
              </div>
            ),
          };
          break;
        case 'taxInvoiceCompleted':
          mCol = {
            ...mCol,
            render: (txt) => (
              <div className="d-flex align-items-center justify-content-center">
                {txt ? (
                  <CheckOutlined className="text-success" twoToneColor="#52c41a" />
                ) : (
                  <InfoCircleOutlined className="text-warning" spin />
                )}
              </div>
            ),
          };
          break;
        case 'phoneNumber':
          mCol = {
            ...mCol,
            render: (text) => (
              <div className={!text ? 'transparent' : ''}>
                {text
                  ? `${parser(text).slice(0, 3)}-${parser(text).slice(3, 6)}-${parser(text).slice(-4)}`
                  : '-'}
              </div>
            ),
          };
          break;
        case 'saleType':
          mCol = {
            ...mCol,
            render: (text) => <div>{text ? SaleType[text] : '-'}</div>,
          };
          break;
        case 'transferType':
          mCol = {
            ...mCol,
            render: (text) => <div>{text ? TransferType[text] : '-'}</div>,
          };
          break;
        case 'deliverType':
          mCol = {
            ...mCol,
            render: (text) => <div>{text ? DeliveryType[text] : '-'}</div>,
          };
          break;
        case 'isUsed':
          mCol = {
            ...mCol,
            render: (text) => <div>{text ? 'มือสอง' : 'ใหม่'}</div>,
          };
          break;
        case 'giveaways':
          mCol = {
            ...mCol,
            render: (arr) => (
              <span>
                {arr ? arr.map((tag, i) => <Tag key={i}>{`${tag.name} x${tag.total}`}</Tag>) : '-'}
              </span>
            ),
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
            render: (arr) => (
              <span>
                {arr
                  ? Array.isArray(arr)
                    ? arr.map((tag, i) => <Tag key={i}>{tag}</Tag>)
                    : arr
                  : '-'}
              </span>
            ),
          };
          break;
        case 'toDestination':
          mCol = {
            ...mCol,
            render: (text, record) => {
              return (
                <div>
                  {text
                    ? record.transferType === 'sold'
                      ? text
                      : branches[text]?.branchName || text
                    : '-'}
                </div>
              );
            },
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
                return (
                  <div>{`${record.prefix}${record.firstName} ${record.lastName || ''}`.trim()}</div>
                );
              }
              return <div>{text || '-'}</div>;
            },
          };
          break;
        case 'origin':
        case 'fromOrigin':
          mCol = {
            ...mCol,
            render: (text, record) => {
              return (
                <div>
                  {text ? (text === 'SKC' ? 'SKC' : branches[text]?.branchName || text) : '-'}
                </div>
              );
            },
          };
          break;

        default:
          mCol = {
            ...mCol,
            render: (text) => <div className={!text ? 'transparent' : ''}>{text || '-'}</div>,
          };
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
        ...(typeof size !== 'undefined' && { size }),
      };
      let resultForRowType = {
        ...mCol,
        ...ColumnProps[col.dataIndex],
        ...(col.width && { width: col.width }),
        key: n.toString(),
        onCell: (record) => ({
          record,
          ...cellObj,
          editing: isEditing(record),
          // validating,
        }),
      };
      let resultForCellType = {
        ...mCol,
        ...ColumnProps[col.dataIndex],
        ...(col.width && { width: col.width }),
        key: n.toString(),
        onCell: (record) => ({
          record,
          ...cellObj,
        }),
      };

      return typeof isEditing === 'undefined' ? resultForCellType : resultForRowType;
    }
    return {
      ...mCol,
      key: n.toString(),
      ...ColumnProps[col.dataIndex],
      ...(col.width && { width: col.width }),
      ...(col.align && { align: col.align }),
    };
  });
};

export const GetColumns = ({
  columns = [], // Provide a default empty array to avoid issues
  handleDelete,
  handleSave,
  handleSelect,
  handleEdit,
  onDelete, // If onDelete is truly separate, see note below
  isEditing,
  onKeyDown,
  onBlur,
  size,
  hasChevron,
  hasEdit,
  disabled,
  readOnly,
  deletedButtonAtEnd,
}) => {
  // Pull data from your Redux store
  const {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames,
  } = useSelector((state) => state.data);

  const { showWarning } = useModal();

  // Prepare object for getRenderColumns
  const db = {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames,
  };

  // Generate base columns
  let mColumns = getRenderColumns(columns, handleSave, db, isEditing, onKeyDown, onBlur, size);

  // --- 1) Insert Delete column if "onDelete" is available
  //     and table is not disabled/readonly.
  const canDelete = typeof onDelete !== 'undefined' && !(disabled || readOnly);
  if (canDelete) {
    const deleteCol = {
      title: 'ลบ',
      dataIndex: 'operation',
      align: 'center',
      width: 80,
      key: 'deleteColumn',
      render: (_, record) => {
        const alreadyGone = record?.deleted || record?.rejected || record?.completed;
        if (!alreadyGone) {
          return (
            <Popconfirm
              title="แน่ใจหรือไม่ ?"
              onConfirm={() => handleDelete(record.key)}
              okText="ลบ"
              cancelText="ยกเลิก"
            >
              <DeleteOutlined className="text-danger mb-2" />
            </Popconfirm>
          );
        }
        // If the record is deleted/rejected/completed
        return (
          <Button
            type="link"
            icon={<DeleteOutlined className="text-danger" />}
            onClick={() =>
              showWarning(
                `ไม่สามารถลบได้ ${record.deleted ? 'รายการถูกลบแล้ว' : record.completed ? 'ทำรายการสำเร็จแล้ว' : ''}`,
              )
            }
          />
        );
      },
    };

    // If you want the delete button next to the "id" column (and not at the end),
    // find that column's index and insert. Otherwise push it onto the end.
    const idIndex = mColumns.findIndex((col) => col.dataIndex === 'id' && !deletedButtonAtEnd);
    if (idIndex > -1) {
      mColumns.splice(idIndex + 1, 0, deleteCol);
    } else {
      mColumns.push(deleteCol);
    }
  }

  // --- 2) Insert a Chevron column if "hasChevron"
  //     The code is fine, just check for the function presence.
  if (hasChevron && !(disabled || readOnly)) {
    mColumns.push({
      title: '→',
      dataIndex: 'selectRecord',
      key: 'selectColumn',
      render: (_, record) => (
        <Button
          type="link"
          icon={<RightOutlined />}
          onClick={() => {
            // If it's not deleted and handleSelect is present, call it.
            if (!record.deleted && typeof handleSelect === 'function') {
              handleSelect(record);
            }
          }}
        />
      ),
      align: 'center',
      width: 50,
    });
  }

  // --- 3) Insert an Edit column if "hasEdit"
  if (hasEdit && !(disabled || readOnly)) {
    const editCol = {
      title: '🖊', // or 🖊, up to you
      dataIndex: 'editRecord',
      key: 'editColumn',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditIcon />}
          onClick={() => {
            const cannotEdit = record?.deleted || record?.rejected || record?.completed;
            if (!cannotEdit && typeof handleEdit === 'function') {
              handleEdit(record);
            }
          }}
        />
      ),
      align: 'center',
      width: 50,
    };

    // Place it right next to "id" if that column exists
    const idIndex = mColumns.findIndex((col) => col.dataIndex === 'id');
    if (idIndex > -1) {
      mColumns.splice(idIndex + 1, 0, editCol);
    } else {
      mColumns.push(editCol);
    }
  }

  return mColumns;
};

export const createValidator = ({ dataIndex, number, getFieldValue, ...vProps }) => {
  // You can append more custom validators as needed
  switch (dataIndex) {
    case 'vehicleNo':
      return {
        validator(rule, value) {
          const peripheralNo = getFieldValue('peripheralNo');
          // If neither vehicleNo nor peripheralNo is set, prompt user
          if (!value && !peripheralNo) {
            return Promise.reject('กรุณาป้อนข้อมูล (vehicleNo หรือ peripheralNo)');
          }
          return Promise.resolve();
        },
      };

    case 'peripheralNo':
      return {
        validator(rule, value) {
          const vehicleNo = getFieldValue('vehicleNo');
          if (!value && !vehicleNo) {
            return Promise.reject('กรุณาป้อนข้อมูล (vehicleNo หรือ peripheralNo)');
          }
          return Promise.resolve();
        },
      };

    default:
      // For numeric fields, ensure user typed a number
      return {
        validator(rule, value) {
          if (number) {
            // If empty or numeric => pass
            if (!value || !isNaN(value)) {
              return Promise.resolve();
            }
            return Promise.reject('กรุณาป้อนเป็นตัวเลข');
          }
          // Not numeric => pass through
          return Promise.resolve();
        },
      };
  }
};

export const TableSummary = ({
  pageData,
  dataLength,
  startAt,
  sumKeys,
  align,
  labelAlign,
  sumClassName,
  noDecimal,
  columns,
  label,
  hasSection,
}) => {
  if (dataLength === 0) {
    return null;
  }
  // Filter out any deleted items
  const dArr = pageData.filter((l) => !l.deleted);

  let total = 0;
  let sumObj = {};

  // Decide if we sum rows that are isSection or not
  const relevantRows = hasSection
    ? dArr.filter((l) => l?.isSection)
    : dArr.filter((l) => !l?.isSection);

  if (sumKeys && Array.isArray(sumKeys)) {
    sumKeys.forEach((k) => {
      sumObj[k] = relevantRows.reduce((acc, elem) => acc + Numb(elem[k]), 0);
    });
  } else {
    // If no sumKeys, default to sum 'total'
    total = relevantRows.reduce((acc, elem) => acc + Numb(elem.total), 0);
  }

  if (pageData.length === 0) {
    return null;
  }

  return (
    <Table.Summary.Row className="bg-light">
      {Array.from(new Array(startAt), (_, i) => (
        <Table.Summary.Cell key={i} />
      ))}
      <Table.Summary.Cell>
        <div style={{ textAlign: labelAlign || 'right' }}>
          <Text>{label || 'ยอดรวม'}</Text>
        </div>
      </Table.Summary.Cell>
      {sumKeys && Array.isArray(sumKeys) ? (
        columns ? (
          // If columns exist, figure out dataIndices to match each sumKey
          getIndexFromColumns(columns)
            .slice(startAt + 1)
            .map((colDataIndex, idx) => {
              if (sumKeys.includes(colDataIndex)) {
                return (
                  <Table.Summary.Cell key={colDataIndex}>
                    <div style={{ textAlign: align || 'right' }}>
                      <Text
                        className={
                          sumClassName && sumClassName[idx] ? sumClassName[idx] : 'text-primary'
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
          // If no columns passed, just map sumObj
          Object.keys(sumObj).map((k, i) => (
            <Table.Summary.Cell key={k}>
              <div style={{ textAlign: align || 'right' }}>
                <Text
                  className={sumClassName && sumClassName[i] ? sumClassName[i] : 'text-primary'}
                >
                  {numeral(sumObj[k]).format(noDecimal ? '0,0' : '0,0.00')}
                </Text>
              </div>
            </Table.Summary.Cell>
          ))
        )
      ) : (
        // If no sumKeys, just show total
        <Table.Summary.Cell>
          <div style={{ textAlign: align || 'right' }}>
            <Text className="text-primary">
              {numeral(total).format(noDecimal ? '0,0' : '0,0.00')}
            </Text>
          </div>
        </Table.Summary.Cell>
      )}
    </Table.Summary.Row>
  );
};

export const getRules = (rules) => {
  const requiredRule = [{ required: true, message: 'กรุณาป้อนข้อมูล' }];
  const numberRule = [
    () => ({
      validator(rule, value) {
        if (!value || !isNaN(value)) {
          return Promise.resolve();
        }
        return Promise.reject('กรุณาป้อนตัวเลข');
      },
    }),
  ];
  const mobileNumberRule = [
    () => ({
      validator(rule, value) {
        if (!value) {
          return Promise.resolve();
        }
        if (validateMobileNumber(value)) {
          return Promise.resolve();
        }
        return Promise.reject('กรุณาตรวจสอบ เบอร์โทรศัพท์');
      },
    }),
  ];

  let result = [];

  rules.forEach((rule) => {
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
      // If user passes an object like { pattern: /regex/, message: '...' }
      case typeof rule === 'object' && rule.pattern instanceof RegExp: {
        const { pattern, message } = rule;
        result.push({ pattern, message: message || 'รูปแบบไม่ถูกต้อง' });
        break;
      }
      // If user passes { minLength: 5, message: '...' }
      case typeof rule === 'object' && rule.minLength: {
        const { minLength, message } = rule;
        result.push({
          min: minLength,
          message: message || `กรุณาป้อนอย่างน้อย ${minLength} ตัวอักษร`,
        });
        break;
      }
      default:
        break;
    }
  });

  return result;
};

export const getRulesFromColumn = (col) => {
  const { required, number } = col;

  if (required && number) {
    return [
      { required: true, message: 'กรุณาป้อนข้อมูล' },
      {
        validator(rule, value) {
          if (!value || !isNaN(value)) {
            return Promise.resolve();
          }
          return Promise.reject('กรุณาป้อนตัวเลข');
        },
      },
    ];
  } else if (required) {
    return [{ required: true, message: 'กรุณาป้อนข้อมูล' }];
  } else if (number) {
    return [
      {
        validator(rule, value) {
          if (!value || !isNaN(value)) {
            return Promise.resolve();
          }
          return Promise.reject('กรุณาป้อนตัวเลข');
        },
      },
    ];
  }
  return undefined;
};

export const getIndexFromColumns = (columns) => {
  // Recursively gather dataIndex from nested children arrays
  const result = [];

  const traverse = (cols) => {
    cols.forEach((col) => {
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
