import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from 'modules/employees/types';

interface EmployeeState {
  employees: Record<string, Employee>;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: {},
  loading: false,
  error: null
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Record<string, Employee>>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees[action.payload.id] = action.payload;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees[action.payload.id] = action.payload;
    },
    removeEmployee: (state, action: PayloadAction<string>) => {
      delete state.employees[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setEmployees, addEmployee, updateEmployee, removeEmployee, setLoading, setError } =
  employeeSlice.actions;
export default employeeSlice.reducer;
