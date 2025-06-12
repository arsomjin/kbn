import React, { useContext, useEffect, Suspense } from 'react';
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
import { useDataSynchronization } from 'hooks/useDataSync';

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
  const { users } = useSelector(state => state.data);
  const { navItems } = useSelector(state => state.unPersisted);

  const all_menu_items = [...navItems]; // Using new navigationConfig.js system

  // 🔧 CHECK: Determine if authentication is complete before initializing data
  const isAuthenticationComplete = user && 
                                   user.uid && 
                                   (user.access || user.isPendingApproval) &&
                                   !isVerifying;

  // Initialize all data synchronization hooks - they will handle auth checks internally
  useDataSynchronization();
  
  // Initialize all listener hooks - they will handle auth checks internally
  useAppListeners(api, user);

  // Force an update for example logic:
  const _forceUpdate = () => {
    // 🔧 SAFETY: Only run force update if authentication is complete
    if (!isAuthenticationComplete) {
      console.log('⏳ Skipping force update - authentication not complete');
      return;
    }
    
    // Example user status check
    const updateStateRef = app.firestore().collection('status').doc(user.uid);
    updateStateRef.get().then(doc => {
      if (users[user.uid]?.status === 'ลาออก') {
        if (doc.exists) {
          updateStateRef.update({ state: 'offline', last_offline: Date.now() }).then(() => {
            dispatch(logoutUser());
            // Force navigation to login route
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          });
        } else {
          dispatch(logoutUser());
          // Force navigation to login route
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      } else if (doc.exists) {
        updateStateRef.update({
          state: 'online',
          lastActive: Date.now(),
          last_online: Date.now()
        });
      }
    }).catch(error => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('🔒 No access to status collection - this is normal for some users');
      } else {
        console.warn('❌ Error updating user status:', error);
      }
    });
  };

  useEffect(() => {
    // 🔧 DEFER: Only run initialization when authentication is complete
    if (!isAuthenticationComplete) {
      console.log('⏳ Waiting for authentication to complete...');
      return;
    }
    
    _forceUpdate();
    api.getVersion();

    // 🔧 SAFE PATH VALIDATION: Only validate paths when auth is complete
    if (props.location?.pathname) {
      const all_paths = getAllPaths(all_menu_items);
      if (['/login', '/'].includes(props.location.pathname)) {
        history.push('/overview');
      } else if (!all_paths.includes(props.location.pathname)) {
        // 🔧 GRACE PERIOD: Give a moment for navigation items to load
        setTimeout(() => {
          const updated_paths = getAllPaths(all_menu_items);
          if (!updated_paths.includes(props.location.pathname)) {
            console.log('🔍 Invalid path after grace period:', props.location.pathname);
            history.push('/not-found');
          }
        }, 1000);
      }
    }
    
    async function registerPush() {
      try {
        // Only register FCM in production or if explicitly enabled
        if (process.env.NODE_ENV !== 'development' || process.env.REACT_APP_ENABLE_FCM === 'true') {
          // Check if service worker and messaging are supported
          if (!('serviceWorker' in navigator) || !firebase.messaging.isSupported()) {
            console.log('🔔 FCM not supported in this browser/environment');
            return;
          }

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
          console.log('🔔 FCM Token:', token);
        } else {
          console.log('🔔 FCM disabled in development mode');
        }
      } catch (error) {
        console.warn('🔔 FCM registration failed (non-critical):', error.message);
        // Don't throw error - FCM is not critical for app functionality
      }
    }

    registerPush();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticationComplete]); // 🔧 DEPENDENCY: Re-run when auth completes

  // 🔧 LOADING STATE: Show loading while authentication is completing
  if (!isAuthenticationComplete) {
    return <Load loading />;
  }

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
                {isLoggingOut ? (
                  <Load loading />
                ) : (
                  <Suspense fallback={<Load loading />}>
                    <route.component {...props2} />
                  </Suspense>
                )}
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
