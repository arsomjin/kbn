import { Box, Link, Typography } from '@material-ui/core';
import React from 'react';
import OpenApp from 'react-open-app';

export const Copyright = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center" style={{ color: 'lightblue' }}>
      {'Copyright © '}
      <Link color="inherit" href="https://www.facebook.com/kbnkorat">
        Kubota Banjapol Nakhon Ratchasima
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

export const Socials = ({ medium, large }) => {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      style={{ color: 'lightblue', marginBottom: '10px' }}
    >
      <OpenApp
        href="https://www.facebook.com/kbnkorat/"
        android="fb://page/390277407694392"
        ios="fb://page/?id=390277407694392"
      >
        <i className="material-icons" style={{ fontSize: medium ? '48px' : large ? '64px' : '24px' }}>
          facebook
        </i>
      </OpenApp>
    </Typography>
  );
};

export const FooterContent = () => (
  <Box mt={6}>
    {/* <Socials /> */}
    <Copyright />
  </Box>
);
