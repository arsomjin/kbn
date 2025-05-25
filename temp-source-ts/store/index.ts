import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import employeesReducer from './slices/employeesSlice';
import dataReducer from './slices/dataSlice';
import notificationsReducer from './slices/notificationsSlice';
import departmentsReducer from './slices/departmentSlice';
import logger from 'redux-logger';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    employees: employeesReducer,
    data: dataReducer,
    notifications: notificationsReducer,
    departments: departmentsReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Firebase Timestamp objects in these action types
        ignoredActions: [
          // Employee-related actions that might contain timestamps
          'employees/setEmployees',
          'employees/addEmployee',
          'employees/updateEmployee',
          // Other actions that might contain Firebase objects
          'data/setData',
          'notifications/addNotification',
          'notifications/setNotifications'
        ],
        // Ignore timestamp fields in the state
        ignoredPaths: ['employees.employees', 'data', 'notifications.notifications']
      }
    }).concat(process.env.NODE_ENV === 'development' ? [logger] : [])
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
