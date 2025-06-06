import React, { useCallback, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { AnimateKeyframes } from 'react-simple-animate';

const NoWifi = () => {
  const { isOnline } = useSelector(state => state.unPersisted);
  const { theme } = useSelector(state => state.global);
  const [showOffline, setShowOffline] = useState(false);
  const [startRef, setStart] = useState(false);

  const checkOffline = useCallback(async isOn => {
    setShowOffline(isOn ? false : true);
  }, []);

  useEffect(() => {
    checkOffline(isOnline);
    setTimeout(() => {
      setStart(true);
    }, 3000);
    return () => clearTimeout();
  }, [checkOffline, isOnline]);

  // showLog({ showOffline, isOnline, startRef: startRef });

  if (!showOffline) {
    return null;
  }

  if (!startRef) {
    // Delay to avoid short displaying on app started.
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '120px',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <AnimateKeyframes play iterationCount="infinite" duration={3} keyframes={['opacity: 0.1', 'opacity: 1']}>
        <div>
          <i
            className="material-icons"
            style={{
              fontSize: '28px',
              color: theme.colors.notification,
              marginLeft: '8px'
            }}
          >
            wifi_off
          </i>
          <p
            style={{
              color: theme.colors.notification,
              fontSize: '12px',
              fontWeight: '300'
            }}
          >
            {' '}
            Offline
          </p>
        </div>
      </AnimateKeyframes>
    </div>
  );
};

export default NoWifi;
