import niceAndClean from './niceAndClean';
import nightSky from './nightSky';

export const ThemeSwitch = theme => {
  switch (theme) {
    case 'Nice And Clean':
      return niceAndClean;
    case 'Night Sky':
      return nightSky;
    default:
      return niceAndClean;
  }
};
