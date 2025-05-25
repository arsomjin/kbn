import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: {},
  loading: false,
  error: null
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setEmployees, setLoading, setError } = employeesSlice.actions;
export default employeesSlice.reducer; 