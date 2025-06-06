/* @flow */

import color from 'color';
import { sizes } from './sizes';
import { fonts } from './fonts';
import { black, white, redA400, pinkA100, baseColors } from './colors';

const nightSky = {
  // ...niceAndClean,
  dark: true,
  colors: {
    ...baseColors,
    primary: '#fbb30a',
    // accent: '#4DA1FF',
    accent: '#007BFC',
    // dominant: '#fbb30a',
    background: '#000000',
    surface: '#1b1d1e',
    // surface: '#181a1b',
    // background: '#0e1725',
    // surface: '##1A222F',
    indigo: '#333F64',
    error: redA400,
    text: 'rgba(255, 255, 255, 0.75)',
    heading: 'rgba(255, 255, 255, 0.95)',
    textSecondary: 'rgba(255, 255, 255, 0.55)',
    disabled: 'rgba(255, 255, 255, 0.35)',
    placeholder: color(white).alpha(0.54).rgb().string(),
    backdrop: color(black).alpha(0.5).rgb().string(),
    notification: pinkA100,
    linear: ['#305174', '#0e1725', '#0e1725'],
    linearSurface: ['#203046', '#203046', '#203046'],
    // linear: ['#84552e', '#0e1725', '#0e1725'],
    // linearSurface: ['#203046', '#203046', '#203046'],
    grey5: '#262626',
    grey4: '#333333',
    grey3: '#666666',
    grey2: '#999999',
    grey: '#cccccc',
    // grey: '#F0F0F0',
    green: '#00ff00'
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  fonts,
  sizes
};

export default nightSky;
