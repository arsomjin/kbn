import { PrinterRef } from './types';

interface PrinterState {
  ComponentToPrint?: React.ComponentType;
  onAfterPrint?: () => void;
  fileName?: string;
}

interface PrinterManagerType {
  _currentPrinter: PrinterRef | null;
  registerPrinter: (printer: PrinterRef) => void;
  unregisterPrinter: () => void;
  showPrinter: (newState?: Partial<PrinterState> | null) => void;
  hidePrinter: () => void;
}

const PrinterManager: PrinterManagerType = {
  _currentPrinter: null,

  registerPrinter(printer: PrinterRef) {
    this._currentPrinter = printer;
  },

  unregisterPrinter() {
    this._currentPrinter = null;
  },

  showPrinter(newState = null) {
    if (this._currentPrinter === null) {
      return;
    }

    if (newState !== null) {
      this._currentPrinter.showPrint(newState);
    }
  },

  hidePrinter() {
    if (this._currentPrinter !== null) {
      // Delay to prevent async event
      setTimeout(() => {
        this._currentPrinter?.hidePrint();
      }, 100);
    }
  }
};

export default PrinterManager; 