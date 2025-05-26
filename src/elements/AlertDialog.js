import React, { useRef, useEffect } from 'react';
import { AlertDialog, AlertManager } from '../api/AlertDialog';

export default () => {
  let alertRef = useRef();
  useEffect(() => {
    // Register the alert located on this master page
    // This AlertDialog will be accessible from the current (same) component, and from its child component
    // The AlertDialog is then declared only once, in your main component.
    AlertManager.registerAlert(alertRef);
    return () => {
      // Remove the alert located on this master page from the manager
      AlertManager.unregisterAlert();
    };
  }, []);

  return (
    <AlertDialog
      ref={ref => {
        alertRef = ref;
      }}
    />
  );
};
