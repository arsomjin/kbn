import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { h } from 'api';

export const AccountSkeleton = () => (
  <div width="90%" style={{ height: h(60) }}>
    <Skeleton />
    <Skeleton animation={false} />
    <Skeleton animation="wave" variant="rect" width="100%" height="50%" />
    <Skeleton animation={false} />
    <Skeleton animation="wave" />
    <Skeleton animation={false} />
    <Skeleton animation="wave" variant="rect" width="100%" height="30%" />
    <Skeleton animation={false} />
    <Skeleton animation="wave" />
    <Skeleton animation={false} />
  </div>
);
