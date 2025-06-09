import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useNotificationAdd,
  useStatusListener,
  useSelfListener,
  useSelfUpdate
} from 'api/CustomHooks';
// Old navigation menus removed - using new navigationConfig.js
import Load from 'elements/Load';
import { getAllPaths } from 'navigation/api';
import routes from 'navigation/routes';
import { FirebaseContext } from '../../firebase';
import { logoutUser } from 'redux/actions/auth';
import { vapidKey } from 'firebase/firebaseConfig';
import { useNotificationListener } from 'api/NotificationsUnified';
import useDataSynchronization from 'hooks/useDataSync';

export const NotFoundRedirect = () => <Redirect to="/not-found" />;

/**
 * Custom hook to handle all listener-based hooks
 */
const useAppListeners = (api, user) => {
  // Self-related listeners
  useSelfUpdate();
  useSelfListener();

  // Notification and status listeners
  useNotificationAdd();
  useNotificationListener(api, user);
  useStatusListener();
};


export const PrivateRoutes = props => {
  const { api, app } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const history = useHistory();

  const { isVerifying, isLoggingOut, user } = useSelector(state => state.auth);
  const { expenseCategories, users } = useSelector(state => state.data);
  const { navItems } = useSelector(state => state.unPersisted);

  const all_menu_items = [...navItems]; // Using new navigationConfig.js system

  // Initialize all data synchronization hooks
  useDataSynchronization();
  
  // Initialize all listener hooks
  useAppListeners(api, user);

  // Force an update for example logic:
  const _forceUpdate = () => {
    // Example user status check
    const updateStateRef = app.firestore().collection('status').doc(user.uid);
    updateStateRef.get().then(doc => {
      if (users[user.uid]?.status === 'ลาออก') {
        if (doc.exists) {
          updateStateRef.update({ state: 'offline', last_offline: Date.now() }).then(() => dispatch(logoutUser()));
        } else {
          dispatch(logoutUser());
        }
      } else if (doc.exists) {
        updateStateRef.update({
          state: 'online',
          lastActive: Date.now(),
          last_online: Date.now()
        });
      }
    });
  };

  useEffect(() => {
    _forceUpdate();
    api.getVersion();

    // Validate path
    if (props.location?.pathname) {
      const all_paths = getAllPaths(all_menu_items);
      if (['/login', '/'].includes(props.location.pathname)) {
        history.push('/overview');
      } else if (!all_paths.includes(props.location.pathname)) {
        history.push('/not-found');
      }
    }
    async function registerPush() {
      try {
        // Register the service worker.
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Wait until the service worker is active.
        const registration = await navigator.serviceWorker.ready;
        // Initialize messaging.
        const messaging = firebase.messaging();

        // Retrieve the FCM token using the active service worker registration.
        const token = await messaging.getToken({
          vapidKey,
          serviceWorkerRegistration: registration
        });
        console.log('FCM Token:', token);
      } catch (error) {
        console.error('Failed to subscribe to push', error);
      }
    }

    registerPush();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          render={props2 =>
            isVerifying ? (
              <div />
            ) : (
              <route.layout {...props2}>
                {isLoggingOut ? <Load loading /> : <route.component {...props2} />}
              </route.layout>
            )
          }
        />
      ))}
    </div>
  );
};

PrivateRoutes.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
};
