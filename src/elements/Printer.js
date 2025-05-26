import React, { useEffect, useRef } from 'react';
import { Printer, PrinterManager } from 'api/Printer';

export default () => {
  useEffect(() => {
    // Register the loader located on this master page
    // This Printer will be accessible from the current (same) component, and from its child component
    // The Printer is then declared only once, in your main component.
    PrinterManager.registerPrinter(loadRef);
    return () => {
      // Remove the loader located on this master page from the manager
      PrinterManager.unregisterPrinter();
    };
  }, []);

  let loadRef = useRef();
  return (
    <Printer
      ref={ref => {
        loadRef = ref;
      }}
    />
  );
};
