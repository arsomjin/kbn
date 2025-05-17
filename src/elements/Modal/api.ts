import { w } from 'api';
import { isMobile } from 'react-device-detect';
import { ModalConstants } from './types';

export const MODAL_WIDTH: ModalConstants['MODAL_WIDTH'] = isMobile ? w(90) : w(80);
export const MODAL_HEIGHT: ModalConstants['MODAL_HEIGHT'] = '77vh';
export const MODAL_STYLE: ModalConstants['MODAL_STYLE'] = { left: isMobile ? 0 : w(8) }; 