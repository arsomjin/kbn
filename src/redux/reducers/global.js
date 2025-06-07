import {
  GET_THEME_SUCCESS,
  RESET_GLOBAL_STATES,
  GET_LANGUAGUE_SUCCESS,
  GET_DEVICE,
  SET_VERSION,
  SET_ALERT_ON_START,
  SET_NETWORK_STATUS_CONFIG
} from '../actions/global';
import { niceAndClean } from '../../api/styles';

const initialState = {
  mTheme: 'Nice And Clean',
  theme: niceAndClean,
  nightMode: false,
  lan: null,
  device: {},
  version: '',
  showAlertOnStart: true,
  networkStatus: {
    enabled: true,
    detailedStatus: true,
    showRetryButton: true,
    autoRetry: true,
    enableQualityCheck: true,
    showWhenOnline: false,
    retryInterval: 5000,
    position: {
      top: 140,
      right: 20,
      mobileTop: 100,
      mobileRight: 10
    }
  }
};

const resetState = initialState;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_THEME_SUCCESS:
      return {
        ...state,
        mTheme: action.mTheme,
        theme: action.theme,
        nightMode: action.nightMode
      };
    case GET_LANGUAGUE_SUCCESS:
      return {
        ...state,
        lan: action.lan
      };
    case GET_DEVICE:
      return {
        ...state,
        device: action.device
      };
    case SET_VERSION:
      return {
        ...state,
        version: action.version
      };
    case SET_ALERT_ON_START:
      return {
        ...state,
        showAlertOnStart: action.showAlertOnStart
      };
    case SET_NETWORK_STATUS_CONFIG:
      return {
        ...state,
        networkStatus: {
          ...state.networkStatus,
          ...action.config
        }
      };
    case RESET_GLOBAL_STATES:
      return resetState;
    default:
      return state;
  }
}
