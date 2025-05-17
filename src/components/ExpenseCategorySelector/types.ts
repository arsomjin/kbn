import { FirestoreDocument } from "utils/firestoreUtils";
import type { BaseSelectRef } from "rc-select";

export interface ExpenseCategory extends FirestoreDocument {
  expenseCategoryId: string;
  expenseCategoryName: string;
  provinceId: string;
  deleted?: boolean;
  keywords?: string[];
  created?: number;
  inputBy?: string;
}

export interface ExpenseCategoryDetailsProps {
  visible: boolean;
  onOk: (values: ExpenseCategory) => void;
  onCancel: () => void;
}

export interface ExpenseCategorySelectorProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  noAddable?: boolean;
  [key: string]: any;
}

export type ExpenseCategorySelectorRef = BaseSelectRef; 