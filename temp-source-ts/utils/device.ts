import { isMobile, browserName, browserVersion, osName, osVersion } from 'react-device-detect';

export interface DeviceInfo {
  isMobile: boolean;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
}

export const getDeviceInfo = (): DeviceInfo => ({
  isMobile,
  browserName,
  browserVersion,
  osName,
  osVersion
});
