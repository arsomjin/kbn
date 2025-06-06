import { w } from 'api';
import { isMobile } from 'react-device-detect';

export const MODAL_WIDTH = isMobile ? w(90) : w(80);
export const MODAL_HEIGHT = '77vh';
export const MODAL_STYLE = { left: isMobile ? 0 : w(8) };
