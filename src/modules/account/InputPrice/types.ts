import { DateTime } from 'luxon';
import { DocumentData } from 'firebase/firestore';
import { TableData } from 'components/Table/types';

export interface InputPriceItem {
  id: number;
  key: string;
  productCode: string;
  productName: string;
  vehicleNo: string[];
  peripheralNo: string[] | string;
  engineNo: string[];
  productType: string | null;
  detail: string;
  unitPrice: number;
  qty: number;
  total: number;
  status: string;
  _key: string;
  itemId?: string;
  docId?: string;
  storeLocationCode?: string;
  unit?: string;
  discount?: number;
  billNoSKC?: string;
  branch?: string;
  branchCode?: string;
  docDate?: string;
  docNo?: string;
  invoiceDate?: string;
  priceType?: string;
  purchaseNo?: string;
  seller?: string;
  startBalance?: number;
  warehouseChecked?: boolean;
  warehouseCheckedBy?: string;
  warehouseCheckedDate?: string;
  warehouseInputBy?: string;
  warehouseReceiveDate?: string;
  creditTerm?: number;
  unitPrice_original?: number;
  deleted?: boolean;
  import?: number;
  importTime?: string;
  inputDate?: string;
  receiveNo?: string;
  [key: string]: unknown;
}

export interface InputPriceFormValues {
  billNoSKC: string | null;
  taxInvoiceNo: string | null;
  taxInvoiceDate: DateTime | undefined;
  taxFiledPeriod: string | null;
  creditDays: number | null;
  dueDate: DateTime | undefined;
  priceType: string | null;
  remark: string | null;
  billDiscount: number | null;
  deductDeposit: number | null;
  transferCompleted: boolean;
  items: InputPriceItem[];
}

export interface InputPriceState extends Record<string, unknown> {
  mReceiveNo: string | null;
  noItemUpdated: boolean;
  deductDeposit: number | null;
  billDiscount: number | null;
  priceType: string | null;
  total: number | null;
}

export interface InputPriceProps {
  grant?: boolean;
  readOnly?: boolean;
}

export interface RenderSummaryProps {
  total: number;
  afterDiscount: number;
  afterDepositDeduct: number;
  billVAT: number;
  billTotal: number;
  onBillDiscountChange: (value: number | null) => void;
  onDeductDepositChange: (value: number | null) => void;
} 