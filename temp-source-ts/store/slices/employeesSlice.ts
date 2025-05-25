import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Employee {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: Date | string; // Allow both Date and serialized string
  updatedAt: Date | string; // Allow both Date and serialized string
  startDate?: Date | string; // Allow both Date and serialized string
  endDate?: Date | string | null; // Allow both Date and serialized string
}

interface EmployeesState {
  employees: Record<string, Employee>;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  employees: {},
  loading: false,
  error: null
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Record<string, Employee>>) => {
      state.employees = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setEmployees, setLoading, setError } = employeesSlice.actions;
export default employeesSlice.reducer;
