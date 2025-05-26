import React, { useEffect, useRef } from 'react';
import { Progress, ProgressManager } from 'api/Progress';

export default () => {
  useEffect(() => {
    // Register the loader located on this master page
    // This Progress will be accessible from the current (same) component, and from its child component
    // The Progress is then declared only once, in your main component.
    ProgressManager.registerProgress(progressRef);
    return () => {
      // Remove the loader located on this master page from the manager
      ProgressManager.unregisterProgress();
    };
  }, []);

  let progressRef = useRef();
  return (
    <Progress
      ref={ref => {
        progressRef = ref;
      }}
    />
  );
};
