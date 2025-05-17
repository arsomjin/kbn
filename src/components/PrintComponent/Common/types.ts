import { ReactNode } from 'react';

export interface PrintHeaderProps {
  title: string;
  subtitle?: string;
  logo?: string;
  className?: string;
}

export interface PrintSignBoxProps {
  title: string;
  name: string;
  position: string;
  date?: string;
  className?: string;
}

export interface PrintContainerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface PrintFooterProps {
  text: string;
  className?: string;
}

export interface PrintConsentProps {
  text: string;
  signature?: string;
  date?: string;
  className?: string;
}

export interface BeforePrintProps {
  onBeforePrint?: () => Promise<boolean> | boolean;
  children: ReactNode;
} 