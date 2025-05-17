import { ComponentType } from 'react';

export interface PrinterState extends Record<string, unknown> {
  show: boolean;
  ComponentToPrint: ComponentType | null;
  onAfterPrint: () => void;
  fileName: string;
}

export interface PrinterRef {
  setNewState: (props: Partial<PrinterState>) => void;
  showPrint: (props: Partial<PrinterState>) => void;
  hidePrint: () => void;
} 