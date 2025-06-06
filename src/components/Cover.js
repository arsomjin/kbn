import { h } from 'api';
import React from 'react';

export default ({ info }) => (
  <div
    style={{
      display: 'flex',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.25)',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: h(40)
    }}
  >
    {!!info && typeof info === 'string' && (
      <h6
        style={{
          position: 'fixed',
          color: 'white',
          textAlign: 'center',
          margin: 20
        }}
      >
        {info}
      </h6>
    )}
  </div>
);
