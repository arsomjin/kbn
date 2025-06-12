import React, { useCallback, useEffect } from 'react';

import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { getCurrentDevice } from 'functions';
import { useDispatch, useSelector } from 'react-redux';
import { updateDevice } from 'redux/actions/global';

// Essential styles imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

// Nature theme styles
import 'styles/nature-theme.scss';
import 'styles/nature-components.css';
import 'styles/nature-antd-overrides.css';
import 'styles/nature-login.css';
import 'styles/nature-enhancement.css';

// Additional styles
import 'styles/print.css';
import 'styles/network-status.css';

import { PrivateRoutes } from './components/PrivateRoutes';
import AuthRoutes from './components/AuthRoutes';
import FirebaseProvider from '../firebase';
import Load from 'elements/Load';

export const NotFoundRedirect = () => <Redirect to="/not-found" />;

const Navigation = () => {
  const { isAuthenticated, isLoggingOut, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const _getDevice = useCallback(() => {
    const device = getCurrentDevice();
    dispatch(updateDevice(device));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // showLog('navigation_auth', isAuthenticated);
    // Disable right click.
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    // Get device info.
    _getDevice();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FirebaseProvider>
      <Router basename={(typeof process !== 'undefined' && process.env?.REACT_APP_BASENAME) || ''}>
        <Switch>
          {!isAuthenticated ? (
            <AuthRoutes />
          ) : isLoggingOut ? ( // Avoid Firebase PERMISSION_DENIED ISSUE.
            <Load loading />
          ) : (user?.isApproved !== true || user?.isActive !== true) ? ( // Show approval status for pending users
            <AuthRoutes showApprovalStatus={true} user={user} />
          ) : (
            <PrivateRoutes />
          )}
          {/* <Route path="/not-found" component={NotFound} /> */}
          <Route component={NotFoundRedirect} />
        </Switch>
      </Router>
    </FirebaseProvider>
  );
};

Navigation.displayName = 'Navigation';
export default Navigation;
