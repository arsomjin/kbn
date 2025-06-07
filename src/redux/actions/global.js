import { ThemeSwitch } from '../../api/styles/themeSwitch';
// import { setI18nConfig } from '../../translations/i18n';

const numeral = require('numeral');

export const GET_THEME_SUCCESS = 'GET_THEME_SUCCESS';
export const GET_LANGUAGUE_SUCCESS = 'GET_LANGUAGUE_SUCCESS';
export const RESET_GLOBAL_STATES = 'RESET_GLOBAL_STATES';
export const GET_DEVICE = 'GET_DEVICE';
export const SET_VERSION = 'SET_VERSION';
export const SET_ALERT_ON_START = 'SET_ALERT_ON_START';
export const SET_NETWORK_STATUS_CONFIG = 'SET_NETWORK_STATUS_CONFIG';

export function getThemeSuccess(nightMode) {
  let mTheme = 'Nice And Clean';
  if (nightMode) {
    mTheme = 'Night Sky';
  }
  const theme = ThemeSwitch(mTheme);
  return {
    type: GET_THEME_SUCCESS,
    nightMode,
    mTheme,
    theme
  };
}

export const updateLan = lan => {
  // setI18nConfig(lan);
  numeral.locale('th'); // Fix to Thai Baht.
  return {
    type: GET_LANGUAGUE_SUCCESS,
    lan
  };
};

export const updateDevice = device => {
  return {
    type: GET_DEVICE,
    device
  };
};

export const setVersion = version => {
  return {
    type: SET_VERSION,
    version
  };
};
export const setAlertOnStart = showAlertOnStart => {
  return {
    type: SET_ALERT_ON_START,
    showAlertOnStart
  };
};

export const setNetworkStatusConfig = config => {
  return {
    type: SET_NETWORK_STATUS_CONFIG,
    config
  };
};

export const resetGlobalStates = () => {
  return {
    type: RESET_GLOBAL_STATES
  };
};
