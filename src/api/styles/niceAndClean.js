/* @flow */
import { baseColors, grey700 } from './colors';
import { sizes } from './sizes';
import { fonts } from './fonts';

export default {
  dark: false,
  rounded: 4,
  colors: baseColors,
  shadow: {
    shadowColor: grey700,
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
