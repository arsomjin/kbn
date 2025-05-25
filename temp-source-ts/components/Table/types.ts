// TableData type for use in table-related components
export interface TableData {
  key: string;
  _key?: string;
  id?: number;
  deleted?: boolean;
  rejected?: boolean;
  completed?: boolean;
  [key: string]: any;
}
