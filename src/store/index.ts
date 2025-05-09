import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import notificationReducer from './slices/notificationSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  notifications: notificationReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they contain non-serializable data
        ignoredActions: ['auth/fetchUserProfile/fulfilled', 'auth/setUser'],
        // Ignore these paths in the state as they contain non-serializable data
        ignoredPaths: ['auth.userProfile.createdAt', 'auth.userProfile.updatedAt']
      }
    });
    if (process.env.NODE_ENV === 'development') {
      return middleware.concat(logger);
    }
    return middleware;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
