import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dealer } from '../../types/dealer';

interface Bank {
  bankId: string;
  bankName: string;
  accNo: string;
  name: string;
  branch?: string;
  order?: number;
  created?: number;
  inputBy?: string;
}

interface DataState {
  banks: Record<string, Bank>;
  branches: Record<
    string,
    {
      branchName: string;
      [key: string]: any;
    }
  >;
  dealers: Record<string, Dealer>;
  isLoading: boolean;
  error: string | null;
}

const initialState: DataState = {
  banks: {},
  branches: {},
  dealers: {},
  isLoading: false,
  error: null
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBanks: (state, action: PayloadAction<Record<string, Bank>>) => {
      state.banks = action.payload;
    },
    addBank: (state, action: PayloadAction<{ bankId: string; bank: Bank }>) => {
      state.banks[action.payload.bankId] = action.payload.bank;
    },
    setDealers: (state, action: PayloadAction<Record<string, Dealer>>) => {
      state.dealers = action.payload;
    },
    setDataLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDataError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setBanks, addBank, setDealers, setDataLoading, setDataError } = dataSlice.actions;

export default dataSlice.reducer;
