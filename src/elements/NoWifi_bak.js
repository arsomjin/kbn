import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';
import { Fade } from 'react-awesome-reveal';
import { waitFor } from 'functions';

const NoWifi = () => {
  const { isOnline } = useSelector(state => state.unPersisted);
  const { theme } = useSelector(state => state.global);
  const [show, setShow] = useState(false);
  const [showOffline, setShowOffline] = useState(false);

  let intervalRef = useRef(null);

  const checkOffline = useCallback(async isOn => {
    if (isOn) {
      setShowOffline(false);
      // Clear timer.
      clearInterval(intervalRef.current);
    } else {
      // To make loop animation.
      intervalRef.current = setInterval(() => setShow(pShow => !pShow), 1500);
      // Delay to avoid displaying when app start.
      await waitFor(3000);
      setShowOffline(true);
    }
  }, []);

  useEffect(() => {
    checkOffline(isOnline);
    return () => clearInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // showLog('showOffline', showOffline);

  if (!showOffline) {
    return null;
  }

  return show ? (
    <div
      style={{
        position: 'absolute',
        right: '3%',
        top: '15%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Fade duration={500}>
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
          <p style={{ color: theme.colors.notification }}>Offline</p>
        </div>
      </Fade>
    </div>
  ) : null;
};

export default NoWifi;
