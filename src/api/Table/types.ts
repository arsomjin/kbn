import { BaseSelectRef } from 'rc-select';
import type { FormInstance } from 'antd';
import type { DateTime } from "luxon";
import type { TablePaginationConfig } from "antd/es/table";
import type { SorterResult, TableCurrentDataSource } from "antd/es/table/interface";
import type { ColumnType } from "antd/es/table";
import type { Rule } from "rc-field-form/lib/interface";

// Input Reference Interface
export interface InputRef extends BaseSelectRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (props: Record<string, any>) => void;
}

// Basic Table Record Types
export interface TableBaseRecord {
  id: string;
  provinceId: string;
  branchId: string;
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
  created: number;
  updated: number;
  createdBy: string;
  updatedBy?: string;
  deleted?: boolean;
  [key: string]: any;
}

// Database Context Types
export interface TableDatabaseContext {
  branches: Record<string, { 
    branchName: string; 
    provinceId: string; 
    branchId: string;
  }>;
  departments: Record<string, { 
    name: string; 
    code: string; 
    id: string;
  }>;
  provinces: Record<string, {
    name: string;
    code: string;
    id: string;
  }>;
  userGroups: Record<string, { userGroupName: string }>;
  dealers: Record<string, { 
    dealerPrefix?: string;
    dealerName: string;
    dealerLastName?: string;
  }>;
  banks: Record<string, {
    bankName: string;
    accNo: string;
    name: string;
  }>;
  expenseCategories: Record<string, { expenseCategoryName: string }>;
  employees: Record<string, {
    firstName: string;
    nickName?: string;
  }>;
  executives: Record<string, {
    firstName: string;
    nickName?: string;
    lastName?: string;
  }>;
  expenseAccountNames: Record<string, { expenseName: string }>;
}

// Column Configuration Types
export interface TableColumnConfig<T = any> extends Omit<ColumnType<T>, 'dataIndex'> {
  dataIndex: string;
  editable?: boolean;
  inputType?: 'text' | 'number' | 'select' | 'date' | 'status';
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  rules?: Rule[];
  width?: string | number;
  fixed?: boolean | 'left' | 'right';
}

// Column Props and Handlers
export interface GetColumnsProps {
  columns?: TableColumnConfig[];
  handleDelete?: (key: string) => void;
  handleSave?: (record: TableBaseRecord) => void;
  handleSelect?: (record: TableBaseRecord) => void;
  handleEdit?: (record: TableBaseRecord) => void;
  onDelete?: boolean;
  isEditing?: (record: TableBaseRecord) => boolean;
  onKeyDown?: (key: string, dataIndex: string) => void;
  onBlur?: (dataIndex: string) => void;
  size?: 'small' | 'middle' | 'large';
  hasChevron?: boolean;
  hasEdit?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  deletedButtonAtEnd?: boolean;
}

// Event Handler Types
export interface TableEventHandlers<T = any> {
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>, dataIndex: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>, dataIndex: string) => void;
  onSelect?: (value: any, record: T) => void;
  onDateChange?: (date: DateTime, record: T) => void;
  onStatusChange?: (status: string, record: T) => void;
}

// Table State and Configuration Types
export interface TableState<T = any> {
  dataSource: T[];
  pagination: TablePaginationConfig;
  filters: Record<string, any[]>;
  sorter?: SorterResult<T>;
  loading: boolean;
  editingKey: string;
  searchText: string;
  searchedColumn: string;
}

export interface TableChangeParams<T = any> {
  pagination: TablePaginationConfig;
  filters: Record<string, (string | number | boolean)[] | null>;
  sorter: SorterResult<T> | SorterResult<T>[];
  extra: TableCurrentDataSource<T>;
}

// Component Context Type
export interface TableContext {
  handleSave: (record: TableBaseRecord) => void;
  handleDelete: (key: string) => void;
  handleAdd: () => void;
  handleEdit: (record: TableBaseRecord) => void;
  form: FormInstance;
  dataSource: TableBaseRecord[];
  columns: TableColumnConfig[];
  branches: Record<string, any>;
  departments: Record<string, any>;
  userGroups: Record<string, any>;
  dealers: Record<string, any>;
  banks: Record<string, any>;
  expenseCategories: Record<string, any>;
  employees: Record<string, any>;
  executives: Record<string, any>;
  expenseAccountNames: Record<string, any>;
  sellers: Record<string, string>;
  priceTypes: Record<string, string>;
  witholdingTaxes: Record<string, string>;
  witholdingTaxDocs: Record<string, string>;
  vehicleItemTypes: Record<string, string>;
  saleTypes: Record<string, string>;
  transferTypes: Record<string, string>;
  otherVehicleImportTypes: Record<string, string>;
  productTypes: Record<string, string>;
  vehicleTypes: Record<string, string>;
  wVehicleTypes: Record<string, string>;
  deliveryTypes: Record<string, string>;
  paymentTypes: Record<string, string>;
  buyTypes: Record<string, string>;
  paymentMethods: Record<string, string>;
  [key: string]: any;
}

// Selector Component Types
export interface ExpenseNameSelectorRef extends BaseSelectRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (props: Record<string, any>) => void;
}

export interface ExpenseNameSelectorProps {
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  record: TableBaseRecord;
  onSelect?: () => void;
  ref?: React.RefObject<ExpenseNameSelectorRef>;
}

export interface VehicleSelectorProps extends ExpenseNameSelectorProps {
  ref?: React.RefObject<VehicleSelectorRef>;
}

export interface VehicleSelectorRef extends BaseSelectRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (props: Record<string, any>) => void;
}