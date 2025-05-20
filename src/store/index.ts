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
    process.env.NODE_ENV === 'development' ? getDefaultMiddleware().concat(logger) : getDefaultMiddleware()
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
