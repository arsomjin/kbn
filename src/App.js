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
    // Silent initialization in production
    const isDev = process?.env?.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('🔥 KBN Application Ready');
    }
    
    // 🔍 DEBUGGING: Start authentication flow monitoring in development (silent)
    if (isDev) {
      import('./utils/authFlowDebugger').then(({ debugAuthFlow }) => {
        // Start monitoring but don't store the cleanup function unless needed
        const cleanup = debugAuthFlow();
        
        // Optional: Stop monitoring after 30 seconds to reduce noise
        setTimeout(() => {
          cleanup();
        }, 30000);
      }).catch(error => {
        // Silent error handling
      });
    }
    
    // Load utilities silently in development
    if (isDev) {
      import('./utils/selfApproval').catch(() => {});
      import('./utils/debugAuth').catch(() => {});
      import('./dev/approval-debug').catch(() => {});
      import('./fix-auth-instability').catch(() => {});
      import('./role-testing-utilities').catch(() => {});
      import('./dev/quick-rbac-setup').catch(() => {});
    }
    
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
