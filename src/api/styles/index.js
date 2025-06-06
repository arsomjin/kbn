import hexToRgba from 'hex-to-rgba';
import * as Colors from './colors';
export { default as niceAndClean } from './niceAndClean';
export { default as nightSky } from './nightSky';

export const shadow = elevation => {
  let height, radius, width;

  switch (elevation) {
    case 1:
      width = 0.5;
      height = 1;
      radius = 1.5;
      break;
    case 2:
      height = 1.5;
      width = 1;
      radius = 3;
      break;
    default:
      height = elevation * 1.5;
      radius = elevation * 2;
      width = elevation;
  }
  return {
    boxShadow: `${width}px ${height}px ${radius}px ${hexToRgba(Colors.grey700, 0.2)}`,
    zIndex: elevation
  };
};
