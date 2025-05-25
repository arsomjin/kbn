import { ReactNode } from 'react';
import { ModalProps } from 'antd';

export interface ModalComponentProps extends Omit<ModalProps, 'visible'> {
  children: ReactNode;
  visible: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  noFooter?: boolean;
  footer?: ReactNode;
  isFull?: boolean;
  bodyStyle?: React.CSSProperties;
}

export interface ModalConstants {
  MODAL_WIDTH: number;
  MODAL_HEIGHT: string;
  MODAL_STYLE: React.CSSProperties;
}
