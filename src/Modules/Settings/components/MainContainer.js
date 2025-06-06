import React from 'react';
import { isMobile } from 'react-device-detect';
import { Slide, Fade } from 'react-awesome-reveal';

const MainContainer = ({ children }) =>
  isMobile ? (
    <Slide direction="right" duration={500}>
      {children}
    </Slide>
  ) : (
    <Fade>{children}</Fade>
  );

export default MainContainer;
