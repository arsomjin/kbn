import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RenderMonitor = ({ componentName = 'Unknown' }) => {
  const renderCount = useRef(0);
  const { user, userProfile, loading } = useAuth();

  renderCount.current += 1;

  useEffect(() => {
    // console.log(`[RenderMonitor] ${componentName} mounted`);
    return () => {
      // console.log(`[RenderMonitor] ${componentName} unmounted`);
    };
  }, [componentName]);

  // console.log(`[RenderMonitor] ${componentName} render #${renderCount.current}`, {
  //   hasUser: !!user,
  //   hasProfile: !!userProfile,
  //   loading,
  //   timestamp: new Date().toISOString(),
  // });

  if (import.meta.env.DEV) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          fontFamily: 'monospace',
        }}
      >
        {componentName}: {renderCount.current} renders
      </div>
    );
  }

  return null;
};

export default RenderMonitor;
