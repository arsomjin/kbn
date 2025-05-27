const PrinterManager = {
  _currentPrinter: null,
  registerPrinter(Printer) {
    this._currentPrinter = Printer;
    // showLog('currentPrinter', this._currentPrinter);
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
        this._currentPrinter.hidePrint();
      }, 100);
    }
  },
};

export default PrinterManager;
