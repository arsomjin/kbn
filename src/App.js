import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import Navigation from './navigation';
import Load from './elements/Load';
import EventEmitter from './api/EventEmitter';
import ErrorBoundary from 'api/ErrorBoundary';
import configureStore from './redux/store/configureStore';
export const store = configureStore();

const persistor = persistStore(store, null, () => {
  const states = store.getState();
  // console.log('Persistor_persisted', states);
});

const App = () => {
  const onBeforeLift = () => {
    console.log('PersistGate OPEN!');
    console.log("🔥 Connected to Firebase Project:", process.env.REACT_APP_FIREBASE_PROJECT_ID);
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<Load loading />} persistor={persistor} onBeforeLift={onBeforeLift}>
        <ErrorBoundary>
          <Navigation />
          <EventEmitter />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
};

export default App;
