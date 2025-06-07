import React, { useCallback, useEffect } from 'react';

import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { getCurrentDevice } from 'functions';
import { useDispatch, useSelector } from 'react-redux';
import { updateDevice } from 'redux/actions/global';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'assets/main.scss';
import 'antd/dist/antd.css';
import 'styles/print.css';
import 'styles/network-status.css';

import moment from 'moment';
import 'moment/locale/th';
import { PrivateRoutes } from './components/PrivateRoutes';
import AuthRoutes from './components/AuthRoutes';
import FirebaseProvider from '../firebase';
import Load from 'elements/Load';

export const NotFoundRedirect = () => <Redirect to="/not-found" />;

const Navigation = () => {
  const { isAuthenticated, isLoggingOut } = useSelector(state => state.auth);
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
    // Set Thai language.
    moment.locale('th');
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
