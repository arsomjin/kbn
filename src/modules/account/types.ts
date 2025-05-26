import type { Dayjs } from 'dayjs';

/**
 * Financial data point interface
 */
export interface FinancialDataPoint {
  date: Dayjs;
  income: number;
  expense: number;
  balance: number;
}

/**
 * Account module types
 */

export interface AccountIncomeRecord {
  id: string;
  accountId: string;
  saleId?: string;
  incomeCategory: 'vehicle' | 'service' | 'parts' | 'other';
  amount: number;
  date: number;
  provinceId: string;
  created: number;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: number;
  notes?: string;
}

export interface AccountExpenseRecord {
  id: string;
  accountId: string;
  expenseType: 'vehicle' | 'service' | 'parts' | 'other';
  amount: number;
  date: number;
  provinceId: string;
  created: number;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: number;
  notes?: string;
}

export interface AccountOverviewData {
  data: FinancialDataPoint[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

/**
 * Account report props interface
 */
export interface AccountReportProps {
  title: string;
  branchName: string;
  range: [Dayjs, Dayjs];
  onRangeChange: (range: [Dayjs, Dayjs]) => void;
  data: AccountOverviewData;
}

/**
 * Account pie chart props interface
 */
export interface AccountPieChartProps {
  title: string;
  branchName: string;
  range: [Dayjs, Dayjs];
  data: AccountOverviewData;
}

/**
 * Account table props interface
 */
export interface AccountTableProps {
  data: FinancialDataPoint[];
  range: [Dayjs, Dayjs];
}

/**
 * Financial data hook return type
 */
export interface UseFinancialDataReturn {
  getFinancialData: (range: string, branchCode: string) => Promise<FinancialDataPoint[]>;
  loading: boolean;
  error: Error | null;
}

export interface IncomeRecord {
  id: string;
  date: Dayjs;
  amount: number;
  category: string;
  description: string;
  branchId: string;
  provinceId: string;
  createdBy: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ExpenseRecord {
  id: string;
  date: Dayjs;
  amount: number;
  category: string;
  description: string;
  branchId: string;
  provinceId: string;
  createdBy: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  status: 'pending' | 'approved' | 'rejected';
}
