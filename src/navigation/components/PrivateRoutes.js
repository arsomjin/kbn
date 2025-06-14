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
                                   (user.access?.authority || user.isApproved || user.isPendingApproval) &&
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

    // 🔧 SAFE PATH VALIDATION: Use route definitions instead of menu items
    if (props.location?.pathname && routes && routes.length > 0) {
      // Get all valid paths from route definitions (not menu items)
      const validPaths = routes.map(route => route.path).filter(Boolean);
      const currentPath = props.location.pathname;
      
      console.log('🔍 PrivateRoutes - Route validation:', {
        currentPath,
        validPathsCount: validPaths.length,
        validPaths: validPaths.slice(0, 10), // Show first 10 for debugging
        hasOverviewRoute: validPaths.includes('/overview'),
        routesArrayLength: routes.length
      });
      
      if (['/login', '/'].includes(currentPath)) {
        console.log('🔄 Redirecting from root/login to /overview');
        history.push('/overview');
      } else if (currentPath === '/not-found') {
        // 🔧 FIXED: Approved users shouldn't be on /not-found page
        console.log('🔄 Approved user found on /not-found - redirecting to /overview');
        history.push('/overview');
      } else {
        // Check if the current path matches any defined route
        const isValidRoute = validPaths.some(routePath => {
          // Handle exact routes
          if (routePath === currentPath) return true;
          
          // Handle parameterized routes (e.g., /customer/:id, /admin/user/:userId)
          if (routePath.includes(':')) {
            const routePattern = routePath.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${routePattern}$`);
            return regex.test(currentPath);
          }
          
          // Handle wildcard routes (e.g., /admin/*)
          if (routePath.includes('*')) {
            const routePattern = routePath.replace(/\*/g, '.*');
            const regex = new RegExp(`^${routePattern}`);
            return regex.test(currentPath);
          }
          
          return false;
        });

        // Additional check: Allow common admin and development routes that might not be in the routes array
        const commonValidPaths = [
          '/admin', '/admin/', 
          '/admin/user-management', '/admin/permission-management', '/admin/user-approval',
          '/dev', '/dev/',
          '/developer', '/developer/',
          '/reports', '/reports/',
          '/overview' // 🔧 TEMPORARY: Always allow /overview route
        ];
        
        const isCommonValidRoute = commonValidPaths.some(validPath => 
          currentPath === validPath || currentPath.startsWith(validPath + '/')
        );

        console.log('🔍 Route validation result:', {
          currentPath,
          isValidRoute,
          isCommonValidRoute,
          willRedirectToNotFound: !isValidRoute && !isCommonValidRoute,
          overviewInValidPaths: validPaths.includes('/overview'),
          overviewInCommonPaths: commonValidPaths.includes('/overview')
        });

        if (!isValidRoute && !isCommonValidRoute) {
          console.log('🔍 Invalid route - redirecting to not-found:', currentPath);
          console.log('📋 Valid routes:', validPaths);
          console.log('📋 Common valid routes:', commonValidPaths);
          history.push('/not-found');
        } else if (isCommonValidRoute && !isValidRoute) {
          console.log('✅ Allowing common valid route:', currentPath);
        } else if (isValidRoute) {
          console.log('✅ Valid route confirmed:', currentPath);
        }
      }
    } else if (props.location?.pathname) {
      console.log('⏳ Routes not loaded yet, skipping validation for:', props.location.pathname);
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
