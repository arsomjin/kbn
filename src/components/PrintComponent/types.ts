import { ComponentType, CSSProperties } from 'react';
import { ButtonProps } from 'antd';

export interface PrintComponentProps {
  ComponentToPrint: ComponentType;
  buttonText?: string;
  hideComponent?: boolean;
  buttonSize?: ButtonProps['size'];
  className?: string;
  disabled?: boolean;
  type?: ButtonProps['type'];
  buttonStyle?: CSSProperties;
  onAfterPrint?: () => void;
  fileName?: string;
  validateBeforePrint?: () => Promise<boolean>;
}

export interface TableItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface TableColumn {
  title: string;
  dataIndex?: string;
  key: string;
  width: string;
} 