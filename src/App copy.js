import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import FirebaseProvider from './firebase';
import { PersistGate } from 'redux-persist/integration/react';
import Navigation from './navigation';
import Load from './elements/Load';
import EventEmitter from './api/EventEmitter';

const App = ({ store }) => {
  const persistor = persistStore(store, null, () => {
    // const states = store.getState();
  });
  return (
    <Provider store={store}>
      <PersistGate loading={<Load loading />} persistor={persistor}>
        <FirebaseProvider>
          <Navigation />
          <EventEmitter />
        </FirebaseProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
