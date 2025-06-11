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
export const store = configureStore();

const persistor = persistStore(store, null, () => {
  const states = store.getState();
  // console.log('Persistor_persisted', states);
});

const App = () => {

  const onBeforeLift = () => {
    console.log('PersistGate OPEN!');
    // Safe access to process.env with fallback
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    const projectId = (typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_PROJECT_ID) || 'development';
    console.log("🔥 Connected to Firebase Project:", projectId);
    
    // Load self-approval utilities for development
    if (isDev) {
      import('./utils/selfApproval').catch(error => {
        console.warn('Could not load self-approval utilities:', error);
      });
      import('./utils/debugAuth').catch(error => {
        console.warn('Could not load debug utilities:', error);
      });
    }
    
    // 🚨 URGENT: Load multi-province deployment script
    import('./urgent-migration-deploy').catch(error => {
      console.warn('Could not load urgent deployment script:', error);
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
