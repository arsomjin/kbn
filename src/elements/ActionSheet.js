import React, { useEffect, useRef } from 'react';
import { ActionSheet, ActionSheetManager } from '../api/ActionSheet';

export default () => {
  useEffect(() => {
    // Register the actionSheet located on this master page
    // This ActionSheet will be accessible from the current (same) component, and from its child component
    // The ActionSheet is then declared only once, in your main component.
    ActionSheetManager.registerActionSheet(actionSheetRef);
    return () => {
      // Remove the actionSheet located on this master page from the manager
      ActionSheetManager.unregisterActionSheet();
    };
  }, []);

  let actionSheetRef = useRef();

  return (
    <ActionSheet
      ref={ref => {
        actionSheetRef = ref;
      }}
    />
  );
};
