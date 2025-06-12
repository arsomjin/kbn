import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import NatureThemeProvider from './components/theme/NatureThemeProvider';
import Navigation from './navigation';
import Load from './elements/Load';
import EventEmitter from './api/EventEmitter';
import ErrorBoundary from 'api/ErrorBoundary';
import configureStore from './redux/store/configureStore';
import EnterKeyNavigationProvider from 'components/EnterKeyNavigationProvider';
import './role-testing-utilities';
// URGENT RBAC MIGRATION - Make available globally
import './utils/urgent-rbac-migration';
// URGENT: Firebase Rules Fix
import './fix-firebase-rules-issue';
// 🔍 Authentication Flow Debugger
import './utils/authFlowDebugger';
// 🧪 Auth Fix Test Utility
import './utils/testAuthFix';
// 🔧 Migration Utility for Clean Slate RBAC
import './utils/migrate-current-user';
// 🚨 Permission Error Fix Script
import './fix-permission-error';

export const store = configureStore();

// Expose store globally for testing utilities
window.store = store;

const persistor = persistStore(store, null, () => {
  const states = store.getState();
  // console.log('Persistor_persisted', states);
});

const App = () => {

  const onBeforeLift = () => {
    console.log('PersistGate OPEN!');
    // Safe access to process.env with fallback
    const isDev = process?.env?.NODE_ENV === 'development';
    const projectId = process?.env?.REACT_APP_FIREBASE_PROJECT_ID || 'development';
    console.log("🔥 Connected to Firebase Project:", projectId);
    
    // 🔍 DEBUGGING: Start authentication flow monitoring in development
    if (isDev) {
      console.log('🔍 Starting authentication flow debugger...');
      import('./utils/authFlowDebugger').then(({ debugAuthFlow }) => {
        // Start monitoring but don't store the cleanup function unless needed
        const cleanup = debugAuthFlow();
        
        // Optional: Stop monitoring after 30 seconds to reduce noise
        setTimeout(() => {
          cleanup();
          console.log('🔍 Auto-stopped auth flow monitoring after 30 seconds');
        }, 30000);
      }).catch(error => {
        console.warn('Could not load auth flow debugger:', error);
      });
    }
    
    // Load self-approval utilities for development
    if (isDev) {
      import('./utils/selfApproval').catch(error => {
        console.warn('Could not load self-approval utilities:', error);
      });
      import('./utils/debugAuth').catch(error => {
        console.warn('Could not load debug utilities:', error);
      });
      import('./dev/approval-debug').catch(error => {
        console.warn('Could not load approval debug utilities:', error);
      });

      import('./fix-auth-instability').catch(error => {
        console.warn('Could not load auth instability fix utility:', error);
      });
    }
    
    // 🎭 Load role testing utilities for multi-role testing
    import('./role-testing-utilities').catch(error => {
      console.warn('Could not load role testing utilities:', error);
    });
    
    // 🚀 Load quick RBAC setup and testing script
    import('./dev/quick-rbac-setup').catch(error => {
      console.warn('Could not load quick RBAC setup:', error);
    });
    
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<Load loading />} persistor={persistor} onBeforeLift={onBeforeLift}>
        <ErrorBoundary>
          <NatureThemeProvider>
            <EnterKeyNavigationProvider>
              <Navigation />
              <EventEmitter />
            </EnterKeyNavigationProvider>
          </NatureThemeProvider>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
};

export default App;
