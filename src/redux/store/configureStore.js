import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import reducers from '../reducers';
import { verifyAuth } from 'redux/actions/auth';
import { __DEV__ } from 'utils';

const config = {
  key: 'root',
  storage,
  blacklist: ['unPersisted'],
  // stateReconciler: autoMergeLevel2,
  timeout: 400, // To make the PersistGate open quicker. But timeout depends on the size of persisted data.
  debug: __DEV__
};

const loggerMiddleware = createLogger({
  collapsed: true,
  duration: true,
  predicate: (getState, action) => __DEV__
});

let middleware =
  process.env.NODE_ENV !== 'production'
    ? applyMiddleware(thunkMiddleware, loggerMiddleware)
    : applyMiddleware(thunkMiddleware);

export default function configureStore(preloadedState) {
  const persistedReducer = persistCombineReducers(config, reducers);
  const store = createStore(persistedReducer, preloadedState, middleware);
  store.dispatch(verifyAuth());
  return store;
}
