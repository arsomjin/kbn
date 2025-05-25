import { createSlice } from '@reduxjs/toolkit';
import { createSerializedReducer } from '../../utils/reduxSerialization';

const initialState = {
  banks: {},
  branches: {},
  dealers: {},
  isLoading: false,
  error: null,
  provinces: {},
  departments: {},
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBanks: (state, action) => {
      state.banks = action.payload;
    },
    addBank: (state, action) => {
      state.banks[action.payload.bankId] = action.payload.bank;
    },
    setDealers: (state, action) => {
      state.dealers = action.payload;
    },
    setDataLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDataError: (state, action) => {
      state.error = action.payload;
    },
    setBranches: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.branches[key];
          } else {
            state.branches[key] = value;
          }
        });
      } else {
        state.branches = changes;
      }
    },
    setProvinces: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.provinces[key];
          } else {
            state.provinces[key] = value;
          }
        });
      } else {
        state.provinces = changes;
      }
    },
    setDepartments: (state, action) => {
      const [changes, isPartial] = action.payload;
      if (isPartial) {
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null) {
            delete state.departments[key];
          } else {
            state.departments[key] = value;
          }
        });
      } else {
        state.departments = changes;
      }
    },
  },
});

export const {
  setBanks,
  addBank,
  setDealers,
  setDataLoading,
  setDataError,
  setBranches,
  setProvinces,
  setDepartments,
} = dataSlice.actions;

export default dataSlice.reducer;
