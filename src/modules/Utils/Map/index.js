import React, { useCallback } from 'react';
import { longdo, map, LongdoMap } from './LongdoMap';

const Map = ({ style }) => {
  const initMap = useCallback(() => {
    map.Layers.setBase(longdo.Layers.GRAY);
  }, []);

  const mapKey = 'c74d6841b84709512b0b33bd449130c8';
  return (
    <div style={style}>
      <LongdoMap id="longdo-map" mapKey={mapKey} callback={initMap} />
    </div>
  );
};

export default Map;
