import React, { useEffect, useRef } from 'react';
import { Loader, LoaderManager } from 'api/Loader';

export default () => {
  useEffect(() => {
    // Register the loader located on this master page
    // This Loader will be accessible from the current (same) component, and from its child component
    // The Loader is then declared only once, in your main component.
    LoaderManager.registerLoader(loadRef);
    return () => {
      // Remove the loader located on this master page from the manager
      LoaderManager.unregisterLoader();
    };
  }, []);

  let loadRef = useRef();
  return (
    <Loader
      ref={ref => {
        loadRef = ref;
      }}
    />
  );
};
