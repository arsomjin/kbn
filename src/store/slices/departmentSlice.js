import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departments: {},
  loading: false,
  error: null
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setDepartments: (state, action) => {
      state.departments = action.payload;
    },
    addDepartment: (state, action) => {
      state.departments[action.payload.id] = action.payload;
    },
    updateDepartment: (state, action) => {
      state.departments[action.payload.id] = action.payload;
    },
    removeDepartment: (state, action) => {
      delete state.departments[action.payload];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setDepartments, addDepartment, updateDepartment, removeDepartment, setLoading, setError } =
  departmentSlice.actions;
export default departmentSlice.reducer; 