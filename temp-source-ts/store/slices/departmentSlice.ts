import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Department } from 'services/departmentService';

interface DepartmentState {
  departments: Record<string, Department>;
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: {},
  loading: false,
  error: null
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Record<string, Department>>) => {
      state.departments = action.payload;
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.departments[action.payload.id] = action.payload;
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      state.departments[action.payload.id] = action.payload;
    },
    removeDepartment: (state, action: PayloadAction<string>) => {
      delete state.departments[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setDepartments, addDepartment, updateDepartment, removeDepartment, setLoading, setError } =
  departmentSlice.actions;
export default departmentSlice.reducer;
