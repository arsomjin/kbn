import { DateTime } from 'luxon';

export interface BankDepositItem {
  id?: number;
  _key?: string;
  key?: string;
  depositId: string;
  date: string;
  depositDate: string;
  branchCode: string;
  depositor: string;
  selfBankId: string;
  total: number;
  remark?: string;
  deleted: boolean;
  created?: number;
  createdBy?: string;
  editedBy?: Array<{
    uid: string;
    time: number;
    changes: Record<string, any>;
  }>;
  status?: string;
}

export interface BankDepositFormValues {
  depositId: string;
  date: string;
  depositDate: string;
  branchCode: string;
  depositor: string;
  selfBankId: string;
  total: number;
  remark?: string;
  deleted: boolean;
}

export interface BankDepositProps {
  order?: BankDepositItem;
  readOnly?: boolean;
  onBack?: {
    path: string;
    params?: any;
  };
  isEdit?: boolean;
  activeStep?: number;
  grant?: boolean;
}

export interface BankDepositState {
  order: BankDepositItem;
  readOnly: boolean;
  onBack: any;
  isEdit: boolean;
  activeStep: number;
  grant: boolean;
} 