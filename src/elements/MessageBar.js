import React, { useRef, useEffect } from 'react';
import { MessageBar, MessageBarManager } from '../api/MessageBar';

export default () => {
  useEffect(() => {
    // Register the alert located on this master page
    // This MessageBar will be accessible from the current (same) component, and from its child component
    // The MessageBar is then declared only once, in your main component.
    MessageBarManager.registerMessageBar(messageBarRef);
    return () => {
      // Remove the alert located on this master page from the manager
      MessageBarManager.unregisterMessageBar();
    };
  }, []);

  let messageBarRef = useRef();

  return (
    <MessageBar
      ref={ref => {
        messageBarRef = ref;
      }}
    />
  );
};
