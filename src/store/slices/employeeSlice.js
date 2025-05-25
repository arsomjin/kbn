import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: {},
  loading: false,
  error: null
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action) => {
      state.employees[action.payload.id] = action.payload;
    },
    updateEmployee: (state, action) => {
      state.employees[action.payload.id] = action.payload;
    },
    removeEmployee: (state, action) => {
      delete state.employees[action.payload];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setEmployees, addEmployee, updateEmployee, removeEmployee, setLoading, setError } =
  employeeSlice.actions;
export default employeeSlice.reducer; 