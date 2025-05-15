declare module '@/api/Table' {
  export const getRules: (rules: string[]) => any[];
  export const TableSummary: React.FC<{ total: number }>;
}

declare module '@/components/elements' {
  export const InputGroup: React.FC<{
    spans: number[];
    addonBefore?: string;
    addonAfter?: string;
    inputComponent?: React.ComponentType<any>;
    alignRight?: boolean;
    primary?: boolean;
  }>;
  export const Input: React.FC<{
    placeholder?: string;
  }>;
  export const DatePicker: React.FC<any>;
  export const Button: React.FC<{
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    htmlType?: 'submit' | 'button' | 'reset';
    icon?: React.ReactNode;
    disabled?: boolean;
    children?: React.ReactNode;
  }>;
}

declare module '@/components/HiddenItem' {
  const HiddenItem: React.FC<{
    name: string;
  }>;
  export default HiddenItem;
}

declare module '@/components/EmployeeSelector' {
  const EmployeeSelector: React.FC<any>;
  export default EmployeeSelector;
}

declare module '@/components/SelfBankSelector' {
  const SelfBankSelector: React.FC<any>;
  export default SelfBankSelector;
}

declare module '@/utils/date' {
  export const dateToThai: (date: string) => string;
}

declare module '@/contexts/FirebaseContext' {
  import { Context } from 'react';
  export const FirebaseContext: Context<any>;
}

declare module '@/hooks/useMergeState' {
  export const useMergeState: <T>(initialState: T) => [T, (newState: Partial<T>) => void];
}

declare module '@/utils/notifications' {
  export const showLog: (message: any) => void;
  export const showWarn: (message: any) => void;
  export const showSuccess: (callback: () => void, message: string, showCallback?: boolean) => void;
  export const showConfirm: (message: string, callback: () => void) => void;
  export const errorHandler: (error: { code?: string; message?: string; snap?: any }) => void;
}

declare module '@/utils/helpers' {
  export const cleanValuesBeforeSave: (values: any) => any;
  export const firstKey: (obj: Record<string, any>) => string;
  export const waitFor: (ms: number) => Promise<void>;
  export const deepEqual: (a: any, b: any) => boolean;
  export const load: (loading: boolean) => void;
  export const getChanges: (oldValues: any, newValues: any) => Record<string, any>;
}

declare module '@/modules/utils' {
  export const checkEditRecord: (values: any, data: any[], user: any) => any;
}

declare module '@/modules/account/api' {
  export const createNewOrderId: () => string;
}

declare module '@/constants/status' {
  export const StatusMapToStep: Record<string, number>;
  export const StatusMap: Record<string, string>;
}

declare module '@/components/EditableCellTable' {
  const EditableCellTable: React.FC<{
    columns: any[];
    dataSource: any[];
    loading: boolean;
    onUpdate: (row: any) => void;
    onDelete: (key: string) => void;
    summary: (pageData: any[]) => React.ReactNode;
  }>;
  export default EditableCellTable;
}

declare module '@/components/branch-date-header' {
  const BranchDateHeader: React.FC<{
    form: any;
    branch: string;
    date: string | undefined;
    onValuesChange: (values: Record<string, any>) => void;
    readOnly: boolean;
  }>;
  export default BranchDateHeader;
}

declare module '@/components/Footer' {
  const Footer: React.FC<{
    children: React.ReactNode;
  }>;
  export default Footer;
} 