import React, { useEffect, useRef } from 'react';
import { Success, SuccessManager } from '../api/Success';

export default () => {
  useEffect(() => {
    // Register the success located on this master page
    // This Success will be accessible from the current (same) component, and from its child component
    // The Success is then declared only once, in your main component.
    SuccessManager.registerSuccess(successRef);
    return () => {
      // Remove the success located on this master page from the manager
      SuccessManager.unregisterSuccess();
    };
  }, []);

  let successRef = useRef();

  return (
    <Success
      ref={ref => {
        successRef = ref;
      }}
    />
  );
};
