import dayjs, { Dayjs } from 'dayjs';
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
}

export interface InputPriceFormValues {
  billNoSKC: string;
  taxInvoiceNo: string;
  taxInvoiceDate: string | Dayjs;
  taxFiledPeriod: string;
  creditDays: number;
  dueDate: string | Dayjs;
  priceType: string;
  remark?: string;
  billDiscount?: number;
  deductDeposit?: number;
  transferCompleted?: boolean;
  items: InputPriceItem[];
  auditTrail?: any[];
  statusHistory?: Array<{
    status: string;
    time: number;
    uid: string;
    userInfo: {
      name: string;
      email: string;
      department?: string;
      role?: string;
    };
  }>;
  status?: 'draft' | 'reviewed' | 'approved' | 'rejected';
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
  provinceId: string;
  departmentId: string;
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
